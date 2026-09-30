import http from 'http';
import path from 'path';
import fs from 'fs';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

interface PlayerSession {
  playerId: string;
  displayName: string;
  ws: WebSocket;
  roomId: string | null;
  isHost: boolean;
  isReady: boolean;
  spawnIndex: number;
  hp: number;
  maxHp: number;
  isAlive: boolean;
  kills: number;
  deaths: number;
  invulnerableUntil: number;
  lastShotTime: number;
  connected: boolean;
  lastActive: number;
}

interface RoomPlayerInfo {
  playerId: string;
  displayName: string;
  isHost: boolean;
  isReady: boolean;
  connected: boolean;
  kills: number;
  deaths: number;
  hp: number;
  isAlive: boolean;
}

interface Room {
  roomId: string;
  hostPlayerId: string;
  mapId: string;
  maxPlayers: number;
  gameState: 'waiting' | 'in_game' | 'ended';
  players: Map<string, PlayerSession>;
  emptySince: number | null;
  matchStartTime?: number;
}

interface QueueEntry {
  playerId: string;
  displayName: string;
  preferredMap: string;
  joinedAt: number;
  ws: WebSocket;
}

// Map Verified Safe Spawn Points for Authoritative Respawn
const MAP_SPAWNS: Record<string, Array<{ x: number; y: number; z: number; yaw: number }>> = {
  magura_town: [
    { x: 0, y: 1.72, z: -15, yaw: 0 },
    { x: 25, y: 1.72, z: -48, yaw: Math.PI / 2 },
    { x: -40, y: 1.72, z: -68, yaw: -Math.PI / 2 },
    { x: -25, y: 1.72, z: 18, yaw: -Math.PI / 2 },
    { x: 26, y: 1.72, z: 22, yaw: Math.PI / 2 },
    { x: 0, y: 1.72, z: 42, yaw: 0 }
  ],
  abalpur_village: [
    { x: 0, y: 1.72, z: -70, yaw: 0 },
    { x: 22, y: 1.72, z: -35, yaw: Math.PI / 2 },
    { x: -24, y: 1.72, z: -15, yaw: -Math.PI / 2 },
    { x: 15, y: 1.72, z: 25, yaw: 0 },
    { x: -18, y: 1.72, z: 45, yaw: Math.PI }
  ],
  magura_river_port: [
    { x: 0, y: 1.72, z: -70, yaw: 0 },
    { x: -28, y: 1.72, z: -25, yaw: Math.PI / 4 },
    { x: 25, y: 1.72, z: -25, yaw: -Math.PI / 4 },
    { x: 0, y: 1.72, z: 20, yaw: 0 },
    { x: -25, y: 1.72, z: 52, yaw: Math.PI / 2 },
    { x: 30, y: 1.72, z: 52, yaw: -Math.PI / 2 }
  ]
};

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = parseInt(process.env.PORT || '3000', 10);
const MAX_PLAYERS_PER_ROOM = 4;
const DISCONNECT_GRACE_MS = 60000; // 60s reconnection window before room cleanup

// In-memory Authoritative Storage
const rooms = new Map<string, Room>();
const clients = new Map<WebSocket, PlayerSession>();
const playerSessionsById = new Map<string, PlayerSession>(); // playerId -> Session
const matchmakingQueue: QueueEntry[] = [];

// In-Memory Social Graph (Player Friends & Pending Requests)
const playerFriends = new Map<string, Set<string>>(); // playerId -> Set<friendPlayerId>
const pendingFriendRequests = new Map<string, Set<string>>(); // playerId -> Set<fromPlayerId>

// Generate short readable canonical room ID (e.g. MGR4821)
function generateRoomId(): string {
  const letters = 'MGR';
  let id = '';
  do {
    const num = Math.floor(1000 + Math.random() * 9000);
    id = `${letters}${num}`;
  } while (rooms.has(id));
  return id;
}

let playerCounter = 1;
function generatePlayerId(): string {
  return `PLAYER_${Date.now().toString(36).toUpperCase()}_${playerCounter++}`;
}

function broadcastToRoom(room: Room, message: object, excludeWs?: WebSocket) {
  const payload = JSON.stringify(message);
  for (const session of room.players.values()) {
    if (session.ws !== excludeWs && session.ws.readyState === WebSocket.OPEN) {
      session.ws.send(payload);
    }
  }
}

function getRoomState(room: Room) {
  const playersList: RoomPlayerInfo[] = [];
  for (const session of room.players.values()) {
    playersList.push({
      playerId: session.playerId,
      displayName: session.displayName,
      isHost: session.isHost,
      isReady: session.isReady,
      connected: session.connected && session.ws.readyState === WebSocket.OPEN,
      kills: session.kills,
      deaths: session.deaths,
      hp: session.hp,
      isAlive: session.isAlive
    });
  }

  return {
    roomId: room.roomId,
    hostPlayerId: room.hostPlayerId,
    mapId: room.mapId,
    maxPlayers: room.maxPlayers,
    gameState: room.gameState,
    players: playersList
  };
}

function getPlayerOnlineStatus(playerId: string): 'ONLINE' | 'IN_ROOM' | 'IN_MATCH' | 'OFFLINE' {
  const session = playerSessionsById.get(playerId);
  if (!session || !session.connected || session.ws.readyState !== WebSocket.OPEN) {
    return 'OFFLINE';
  }
  if (!session.roomId) {
    return 'ONLINE';
  }
  const room = rooms.get(session.roomId);
  if (!room) return 'ONLINE';
  if (room.gameState === 'in_game') return 'IN_MATCH';
  return 'IN_ROOM';
}

function handleLeaveRoom(session: PlayerSession, isDisconnect = false) {
  const roomId = session.roomId;
  if (!roomId) return;

  const room = rooms.get(roomId);
  if (!room) {
    session.roomId = null;
    return;
  }

  const leavingPlayerId = session.playerId;

  if (isDisconnect) {
    // Temporary drop — do not delete room immediately. Keep player with connected=false
    session.connected = false;
    console.log(`[NET] client disconnected temporarily playerId=${leavingPlayerId} in room=${roomId}`);

    let anyConnected = false;
    for (const p of room.players.values()) {
      if (p.connected && p.ws.readyState === WebSocket.OPEN) {
        anyConnected = true;
        break;
      }
    }

    if (!anyConnected && !room.emptySince) {
      room.emptySince = Date.now();
      console.log(`[ROOM] All players disconnected in ${roomId}, starting ${DISCONNECT_GRACE_MS / 1000}s grace timer`);
    }

    broadcastToRoom(room, {
      type: 'ROOM_STATE',
      roomState: getRoomState(room)
    });
    return;
  }

  // Explicit leave
  room.players.delete(leavingPlayerId);
  session.roomId = null;
  session.isHost = false;
  session.isReady = false;

  console.log(`[ROOM] LEAVE roomId=${roomId} player=${leavingPlayerId}`);

  broadcastToRoom(room, {
    type: 'PLAYER_LEFT',
    playerId: leavingPlayerId
  });

  if (room.players.size === 0) {
    rooms.delete(roomId);
    console.log(`[ROOM] Deleted ${roomId} (empty)`);
  } else {
    // If leaving player was host, migrate host to next player
    if (room.hostPlayerId === leavingPlayerId) {
      const nextSession = room.players.values().next().value as PlayerSession | undefined;
      if (nextSession) {
        nextSession.isHost = true;
        room.hostPlayerId = nextSession.playerId;
        console.log(`[ROOM] Host migrated in ${roomId} to ${nextSession.playerId}`);
        broadcastToRoom(room, {
          type: 'HOST_CHANGED',
          newHostPlayerId: nextSession.playerId
        });
      }
    }

    broadcastToRoom(room, {
      type: 'ROOM_STATE',
      roomState: getRoomState(room)
    });
  }
}

// Matchmaking Queue Processing
function processMatchmaking() {
  // Filter active valid queue entries
  const validQueue = matchmakingQueue.filter(entry => entry.ws.readyState === WebSocket.OPEN);
  matchmakingQueue.length = 0;
  matchmakingQueue.push(...validQueue);

  while (matchmakingQueue.length >= 2) {
    const p1 = matchmakingQueue.shift()!;
    const p2 = matchmakingQueue.shift()!;

    const s1 = clients.get(p1.ws);
    const s2 = clients.get(p2.ws);
    if (!s1 || !s2) continue;

    const roomId = generateRoomId();
    const mapId = p1.preferredMap || 'magura_town';

    s1.roomId = roomId;
    s1.isHost = true;
    s1.isReady = true;
    s1.spawnIndex = 0;

    s2.roomId = roomId;
    s2.isHost = false;
    s2.isReady = false;
    s2.spawnIndex = 1;

    const room: Room = {
      roomId,
      hostPlayerId: s1.playerId,
      mapId,
      maxPlayers: MAX_PLAYERS_PER_ROOM,
      gameState: 'waiting',
      players: new Map([
        [s1.playerId, s1],
        [s2.playerId, s2]
      ]),
      emptySince: null
    };

    rooms.set(roomId, room);
    console.log(`[MATCHMAKING] MATCH_FOUND room=${roomId} with ${s1.displayName} & ${s2.displayName}`);

    const state = getRoomState(room);

    p1.ws.send(JSON.stringify({
      type: 'MATCH_FOUND',
      roomId,
      hostPlayerId: s1.playerId,
      isHost: true,
      roomState: state
    }));

    p2.ws.send(JSON.stringify({
      type: 'MATCH_FOUND',
      roomId,
      hostPlayerId: s1.playerId,
      isHost: false,
      roomState: state
    }));
  }
}

// Periodic Housekeeping (Grace period room cleanup, matchmaking timeouts)
setInterval(() => {
  const now = Date.now();

  // 1. Clean up empty/abandoned rooms
  for (const [roomId, room] of rooms.entries()) {
    if (room.emptySince && now - room.emptySince > DISCONNECT_GRACE_MS) {
      console.log(`[ROOM] Cleaning abandoned room ${roomId} after grace timeout`);
      rooms.delete(roomId);
    }
  }

  // 2. Timeout long-waiting matchmaking entries (> 25 seconds)
  for (let i = matchmakingQueue.length - 1; i >= 0; i--) {
    const entry = matchmakingQueue[i];
    if (now - entry.joinedAt > 25000) {
      if (entry.ws.readyState === WebSocket.OPEN) {
        entry.ws.send(JSON.stringify({
          type: 'MATCHMAKING_TIMEOUT',
          message: 'No opponents found in queue. Try creating a room or queue again.'
        }));
      }
      matchmakingQueue.splice(i, 1);
    }
  }
}, 10000);

wss.on('connection', (ws: WebSocket) => {
  const playerId = generatePlayerId();
  const session: PlayerSession = {
    playerId,
    displayName: `PLAYER_${playerCounter}`,
    ws,
    roomId: null,
    isHost: false,
    isReady: false,
    spawnIndex: 0,
    hp: 100,
    maxHp: 100,
    isAlive: true,
    kills: 0,
    deaths: 0,
    invulnerableUntil: 0,
    lastShotTime: 0,
    connected: true,
    lastActive: Date.now()
  };

  clients.set(ws, session);
  playerSessionsById.set(playerId, session);

  console.log(`[NET] client connected playerId=${playerId}`);

  // Connection Handshake (Step 8 & Protocol)
  const helloMsg = {
    type: 'SERVER_HELLO',
    playerId,
    serverTime: Date.now(),
    protocolVersion: 1
  };
  ws.send(JSON.stringify(helloMsg));
  // Backwards compatibility for existing clients expecting CONNECTED
  ws.send(JSON.stringify({ type: 'CONNECTED', playerId }));

  ws.on('message', (raw: string) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (!msg || typeof msg.type !== 'string') return;
      session.lastActive = Date.now();

      switch (msg.type) {
        case 'SET_DISPLAY_NAME': {
          if (typeof msg.displayName === 'string' && msg.displayName.trim().length > 0) {
            session.displayName = msg.displayName.trim().slice(0, 16);
            if (session.roomId) {
              const room = rooms.get(session.roomId);
              if (room) {
                broadcastToRoom(room, {
                  type: 'ROOM_STATE',
                  roomState: getRoomState(room)
                });
              }
            }
          }
          break;
        }

        // Seamless Session Rebinding (for iframe 3D game and mobile reconnections)
        case 'CLAIM_SESSION':
        case 'RECONNECT': {
          const targetPlayerId = msg.playerId;
          const targetRoomId = msg.roomId ? msg.roomId.trim().toUpperCase() : null;

          if (targetRoomId && rooms.has(targetRoomId)) {
            const room = rooms.get(targetRoomId)!;
            const existingSession = room.players.get(targetPlayerId);

            if (existingSession) {
              // Rebind new WebSocket to existing room session
              clients.delete(existingSession.ws);
              existingSession.ws = ws;
              existingSession.connected = true;
              clients.set(ws, existingSession);
              playerSessionsById.set(targetPlayerId, existingSession);
              room.emptySince = null; // Clear empty grace timeout

              if (typeof msg.displayName === 'string' && msg.displayName.trim().length > 0) {
                existingSession.displayName = msg.displayName.trim().slice(0, 16);
              }

              console.log(`[NET] Session re-claimed for ${targetPlayerId} in room ${targetRoomId}`);

              ws.send(JSON.stringify({
                type: 'JOIN_SUCCESS',
                roomId: targetRoomId,
                playerId: targetPlayerId,
                hostPlayerId: room.hostPlayerId,
                roomState: getRoomState(room)
              }));

              broadcastToRoom(room, {
                type: 'ROOM_STATE',
                roomState: getRoomState(room)
              });
              return;
            }
          }
          break;
        }

        case 'CREATE_ROOM': {
          if (session.roomId) {
            handleLeaveRoom(session);
          }

          if (typeof msg.displayName === 'string' && msg.displayName.trim().length > 0) {
            session.displayName = msg.displayName.trim().slice(0, 16);
          }

          const roomId = generateRoomId();
          session.roomId = roomId;
          session.isHost = true;
          session.isReady = true;
          session.spawnIndex = 0;
          session.hp = 100;
          session.isAlive = true;
          session.kills = 0;
          session.deaths = 0;

          const newRoom: Room = {
            roomId,
            hostPlayerId: session.playerId,
            mapId: (msg.mapId && ['magura_town', 'abalpur_village', 'magura_river_port'].includes(msg.mapId))
              ? msg.mapId 
              : 'magura_town',
            maxPlayers: MAX_PLAYERS_PER_ROOM,
            gameState: 'waiting',
            players: new Map([[session.playerId, session]]),
            emptySince: null
          };

          rooms.set(roomId, newRoom);
          console.log(`[ROOM] CREATE roomId=${roomId} host=${session.playerId} (${session.displayName})`);

          const state = getRoomState(newRoom);
          const resp = {
            type: 'CREATE_ROOM_SUCCESS',
            roomId,
            playerId: session.playerId,
            host: true,
            roomState: state
          };

          ws.send(JSON.stringify(resp));
          ws.send(JSON.stringify({ ...resp, type: 'ROOM_CREATED' })); // compat
          break;
        }

        case 'JOIN_ROOM': {
          if (session.roomId) {
            handleLeaveRoom(session);
          }

          if (typeof msg.displayName === 'string' && msg.displayName.trim().length > 0) {
            session.displayName = msg.displayName.trim().slice(0, 16);
          }

          const rawId = typeof msg.roomId === 'string' ? msg.roomId.trim().toUpperCase() : '';
          console.log(`[ROOM] JOIN request for rawId="${rawId}" by player=${session.playerId}`);

          if (!rawId) {
            ws.send(JSON.stringify({
              type: 'ROOM_ERROR',
              code: 'INVALID_ROOM_ID',
              message: 'Enter a valid room ID.'
            }));
            return;
          }

          const targetRoom = rooms.get(rawId);
          if (!targetRoom) {
            console.log(`[ROOM] NOT_FOUND roomId=${rawId} (active rooms: ${Array.from(rooms.keys()).join(', ') || 'none'})`);
            const notFoundMsg = {
              type: 'ROOM_NOT_FOUND',
              code: 'ROOM_NOT_FOUND',
              roomId: rawId,
              message: `Room ${rawId} not found.`
            };
            ws.send(JSON.stringify(notFoundMsg));
            ws.send(JSON.stringify({ ...notFoundMsg, type: 'ROOM_ERROR' })); // compat
            return;
          }

          if (targetRoom.players.size >= targetRoom.maxPlayers) {
            ws.send(JSON.stringify({
              type: 'ROOM_ERROR',
              code: 'ROOM_FULL',
              message: 'Room is full (max 4 players).'
            }));
            return;
          }

          if (targetRoom.gameState === 'in_game') {
            ws.send(JSON.stringify({
              type: 'ROOM_ERROR',
              code: 'MATCH_ALREADY_STARTED',
              message: 'Match has already started in this room.'
            }));
            return;
          }

          session.roomId = rawId;
          session.isHost = false;
          session.isReady = false;
          session.spawnIndex = targetRoom.players.size;
          session.hp = 100;
          session.isAlive = true;
          session.kills = 0;
          session.deaths = 0;

          targetRoom.emptySince = null;
          targetRoom.players.set(session.playerId, session);
          console.log(`[ROOM] JOIN success roomId=${rawId} player=${session.playerId} (${targetRoom.players.size}/${targetRoom.maxPlayers})`);

          const state = getRoomState(targetRoom);
          const joinSuccessMsg = {
            type: 'JOIN_SUCCESS',
            roomId: rawId,
            playerId: session.playerId,
            hostPlayerId: targetRoom.hostPlayerId,
            roomState: state
          };

          ws.send(JSON.stringify(joinSuccessMsg));
          ws.send(JSON.stringify({ ...joinSuccessMsg, type: 'ROOM_JOINED' })); // compat

          broadcastToRoom(targetRoom, {
            type: 'ROOM_STATE',
            roomState: state
          });
          break;
        }

        case 'SET_READY': {
          if (!session.roomId) return;
          const room = rooms.get(session.roomId);
          if (!room) return;

          session.isReady = Boolean(msg.ready);
          console.log(`[ROOM] Ready state player=${session.playerId} ready=${session.isReady}`);
          broadcastToRoom(room, {
            type: 'ROOM_STATE',
            roomState: getRoomState(room)
          });
          break;
        }

        case 'SELECT_MAP': {
          if (!session.roomId) return;
          const room = rooms.get(session.roomId);
          if (!room || room.hostPlayerId !== session.playerId) return;

          const validMaps = ['magura_town', 'abalpur_village', 'magura_river_port'];
          if (typeof msg.mapId === 'string' && validMaps.includes(msg.mapId)) {
            room.mapId = msg.mapId;
            broadcastToRoom(room, {
              type: 'MAP_SELECTED',
              mapId: room.mapId
            });
            broadcastToRoom(room, {
              type: 'ROOM_STATE',
              roomState: getRoomState(room)
            });
          }
          break;
        }

        case 'START_MATCH': {
          if (!session.roomId) return;
          const room = rooms.get(session.roomId);
          if (!room || room.hostPlayerId !== session.playerId) return;

          let allReady = true;
          for (const p of room.players.values()) {
            if (!p.isHost && !p.isReady) {
              allReady = false;
              break;
            }
          }

          if (!allReady && room.players.size > 1) {
            ws.send(JSON.stringify({
              type: 'ROOM_ERROR',
              code: 'PLAYERS_NOT_READY',
              message: 'All players must be READY before launching match.'
            }));
            return;
          }

          room.gameState = 'in_game';
          room.matchStartTime = Date.now();
          console.log(`[MATCH] START room=${room.roomId} map=${room.mapId} players=${room.players.size}`);

          // Reset health & combat stats
          const playerSpawns: Record<string, { spawnIndex: number; spawn: { x: number; y: number; z: number; yaw: number } }> = {};
          const mapSpawnsList = MAP_SPAWNS[room.mapId] || MAP_SPAWNS.magura_town;

          let spIdx = 0;
          for (const p of room.players.values()) {
            p.spawnIndex = spIdx;
            p.hp = 100;
            p.isAlive = true;
            p.kills = 0;
            p.deaths = 0;
            p.invulnerableUntil = Date.now() + 3000; // 3s initial spawn protection

            const safeSpawn = mapSpawnsList[spIdx % mapSpawnsList.length];
            playerSpawns[p.playerId] = {
              spawnIndex: p.spawnIndex,
              spawn: safeSpawn
            };
            spIdx++;
          }

          broadcastToRoom(room, {
            type: 'MATCH_STARTING',
            roomId: room.roomId,
            mapId: room.mapId,
            playerSpawns,
            roomState: getRoomState(room)
          });
          break;
        }

        // STEP 4: Server-Authoritative Shooting & Damage Validation
        case 'PLAYER_SHOOT': {
          if (!session.roomId) return;
          const room = rooms.get(session.roomId);
          if (!room || room.gameState !== 'in_game') return;

          // Reject if shooter is dead
          if (!session.isAlive || session.hp <= 0) return;

          // Rate of fire cooldown check (anti-macro / speed-hack)
          const now = Date.now();
          if (now - session.lastShotTime < 75) { // max ~13 shots/sec
            return;
          }
          session.lastShotTime = now;

          const weaponId = typeof msg.weaponId === 'string' ? msg.weaponId : 'BD-08';
          const isHead = Boolean(msg.isHead);
          const targetPlayerId = typeof msg.targetPlayerId === 'string' ? msg.targetPlayerId : null;

          // Broadcast firing effects (muzzle flash, tracer, audio) to room
          broadcastToRoom(room, {
            type: 'REMOTE_SHOOT',
            shooterId: session.playerId,
            weaponId,
            origin: msg.origin,
            direction: msg.direction
          }, ws);

          // If a player target was raycasted, apply authoritative damage
          if (targetPlayerId && targetPlayerId !== session.playerId) {
            const target = room.players.get(targetPlayerId);
            if (!target || !target.isAlive || target.hp <= 0) return;

            // Check target invulnerability (spawn protection)
            if (now < target.invulnerableUntil) {
              ws.send(JSON.stringify({
                type: 'TARGET_PROTECTED',
                targetId: targetPlayerId,
                message: 'Target is under spawn protection.'
              }));
              return;
            }

            // Standard Damage Table: Headshot 50, Body 25
            const damage = isHead ? 50 : 25;
            target.hp = Math.max(0, target.hp - damage);

            console.log(`[COMBAT] ${session.displayName} shot ${target.displayName} for ${damage} dmg (head=${isHead}, remaining=${target.hp})`);

            // Authoritative damage notification
            broadcastToRoom(room, {
              type: 'PLAYER_HIT',
              shooterId: session.playerId,
              targetId: target.playerId,
              damage,
              isHead,
              targetHealth: target.hp,
              hitPoint: msg.hitPoint || null
            });

            // STEP 5: Authoritative Death, Kills & Respawn
            if (target.hp === 0 && target.isAlive) {
              target.isAlive = false;
              target.deaths++;
              session.kills++;

              console.log(`[COMBAT] ${session.displayName} ELIMINATED ${target.displayName} (Kills: ${session.kills}, Deaths: ${target.deaths})`);

              broadcastToRoom(room, {
                type: 'PLAYER_DIED',
                playerId: target.playerId,
                killerId: session.playerId,
                killerName: session.displayName,
                victimName: target.displayName,
                kills: session.kills,
                deaths: target.deaths,
                respawnDelay: 3.0
              });

              broadcastToRoom(room, {
                type: 'ROOM_STATE',
                roomState: getRoomState(room)
              });

              // Server-Authoritative Respawn after 3.0 seconds
              setTimeout(() => {
                // Confirm player and room still exist
                if (!rooms.has(room.roomId) || !room.players.has(target.playerId)) return;

                const mapSpawns = MAP_SPAWNS[room.mapId] || MAP_SPAWNS.magura_town;
                const nextSpawn = mapSpawns[Math.floor(Math.random() * mapSpawns.length)];

                target.hp = 100;
                target.isAlive = true;
                target.invulnerableUntil = Date.now() + 2500; // 2.5s post-respawn shield

                console.log(`[COMBAT] ${target.displayName} RESPAWNED at [${nextSpawn.x}, ${nextSpawn.z}]`);

                broadcastToRoom(room, {
                  type: 'PLAYER_RESPAWNED',
                  playerId: target.playerId,
                  spawnPosition: { x: nextSpawn.x, y: nextSpawn.y, z: nextSpawn.z },
                  spawnRotation: { yaw: nextSpawn.yaw },
                  health: 100,
                  invulnerableDuration: 2.5
                });

                broadcastToRoom(room, {
                  type: 'ROOM_STATE',
                  roomState: getRoomState(room)
                });
              }, 3000);
            }
          }
          break;
        }

        case 'PLAYER_TRANSFORM': {
          if (!session.roomId) return;
          const room = rooms.get(session.roomId);
          if (!room || room.gameState !== 'in_game') return;

          const pos = msg.position;
          const rot = msg.rotation;

          if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number' || typeof pos.z !== 'number' ||
              !Number.isFinite(pos.x) || !Number.isFinite(pos.y) || !Number.isFinite(pos.z)) {
            return;
          }
          if (!rot || typeof rot.yaw !== 'number' || !Number.isFinite(rot.yaw)) {
            return;
          }

          const pitch = (rot && typeof rot.pitch === 'number' && Number.isFinite(rot.pitch)) ? rot.pitch : 0;
          const movementState = (typeof msg.movementState === 'string') ? msg.movementState : 'IDLE';

          broadcastToRoom(room, {
            type: 'PLAYER_TRANSFORM',
            playerId: session.playerId,
            displayName: session.displayName,
            position: { x: pos.x, y: pos.y, z: pos.z },
            rotation: { yaw: rot.yaw, pitch },
            movementState
          }, ws);
          break;
        }

        // STEP 6: Friends + Social Graph
        case 'SEND_FRIEND_REQUEST': {
          const targetQuery = typeof msg.target === 'string' ? msg.target.trim() : '';
          if (!targetQuery || targetQuery === session.playerId || targetQuery.toUpperCase() === session.displayName.toUpperCase()) {
            ws.send(JSON.stringify({ type: 'FRIEND_ERROR', message: 'Cannot add yourself.' }));
            return;
          }

          // Search session by playerId or displayName
          let targetSession: PlayerSession | undefined;
          for (const s of playerSessionsById.values()) {
            if (s.playerId === targetQuery || s.displayName.toUpperCase() === targetQuery.toUpperCase()) {
              targetSession = s;
              break;
            }
          }

          if (!targetSession) {
            ws.send(JSON.stringify({ type: 'FRIEND_ERROR', message: `Player "${targetQuery}" not found or offline.` }));
            return;
          }

          // Initialize sets
          if (!pendingFriendRequests.has(targetSession.playerId)) {
            pendingFriendRequests.set(targetSession.playerId, new Set());
          }
          pendingFriendRequests.get(targetSession.playerId)!.add(session.playerId);

          // Notify target if online
          if (targetSession.connected && targetSession.ws.readyState === WebSocket.OPEN) {
            targetSession.ws.send(JSON.stringify({
              type: 'FRIEND_REQUEST_RECEIVED',
              fromPlayerId: session.playerId,
              fromDisplayName: session.displayName
            }));
          }

          ws.send(JSON.stringify({
            type: 'FRIEND_REQUEST_SENT',
            targetPlayerId: targetSession.playerId,
            targetDisplayName: targetSession.displayName
          }));
          break;
        }

        case 'ACCEPT_FRIEND_REQUEST': {
          const fromId = msg.fromPlayerId;
          const reqs = pendingFriendRequests.get(session.playerId);
          if (reqs && reqs.has(fromId)) {
            reqs.delete(fromId);

            if (!playerFriends.has(session.playerId)) playerFriends.set(session.playerId, new Set());
            if (!playerFriends.has(fromId)) playerFriends.set(fromId, new Set());

            playerFriends.get(session.playerId)!.add(fromId);
            playerFriends.get(fromId)!.add(session.playerId);

            ws.send(JSON.stringify({ type: 'FRIEND_ACCEPTED', friendId: fromId }));

            const otherSession = playerSessionsById.get(fromId);
            if (otherSession && otherSession.connected && otherSession.ws.readyState === WebSocket.OPEN) {
              otherSession.ws.send(JSON.stringify({
                type: 'FRIEND_ACCEPTED',
                friendId: session.playerId,
                friendDisplayName: session.displayName
              }));
            }
          }
          break;
        }

        case 'DECLINE_FRIEND_REQUEST': {
          const fromId = msg.fromPlayerId;
          const reqs = pendingFriendRequests.get(session.playerId);
          if (reqs) reqs.delete(fromId);
          break;
        }

        case 'GET_FRIENDS': {
          const friendIds = playerFriends.get(session.playerId) || new Set();
          const friendsList = [];

          for (const fid of friendIds) {
            const fSession = playerSessionsById.get(fid);
            const name = fSession ? fSession.displayName : 'COMMANDO';
            const status = getPlayerOnlineStatus(fid);
            friendsList.push({
              playerId: fid,
              displayName: name,
              status,
              roomId: (fSession && fSession.roomId) ? fSession.roomId : null
            });
          }

          const reqs = Array.from(pendingFriendRequests.get(session.playerId) || []).map(pid => {
            const s = playerSessionsById.get(pid);
            return { playerId: pid, displayName: s ? s.displayName : pid };
          });

          ws.send(JSON.stringify({
            type: 'FRIENDS_LIST',
            friends: friendsList,
            pendingRequests: reqs
          }));
          break;
        }

        case 'ROOM_INVITE': {
          if (!session.roomId) {
            ws.send(JSON.stringify({ type: 'INVITE_ERROR', message: 'You are not in a room.' }));
            return;
          }
          const room = rooms.get(session.roomId);
          if (!room) return;

          if (room.players.size >= room.maxPlayers) {
            ws.send(JSON.stringify({ type: 'INVITE_ERROR', message: 'Room is already full.' }));
            return;
          }

          const targetPlayerId = msg.targetPlayerId;
          const targetSession = playerSessionsById.get(targetPlayerId);

          if (!targetSession || !targetSession.connected || targetSession.ws.readyState !== WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'INVITE_ERROR', message: 'Friend is currently offline.' }));
            return;
          }

          targetSession.ws.send(JSON.stringify({
            type: 'ROOM_INVITE',
            inviterId: session.playerId,
            inviterName: session.displayName,
            roomId: room.roomId,
            mapId: room.mapId
          }));

          ws.send(JSON.stringify({
            type: 'INVITE_SENT',
            targetPlayerId,
            message: `Invited ${targetSession.displayName} to squad.`
          }));
          break;
        }

        // STEP 7: Matchmaking Queue
        case 'QUICK_MATCH': {
          if (session.roomId) {
            handleLeaveRoom(session);
          }

          if (typeof msg.displayName === 'string' && msg.displayName.trim().length > 0) {
            session.displayName = msg.displayName.trim().slice(0, 16);
          }

          // Avoid duplicate entries
          const idx = matchmakingQueue.findIndex(e => e.playerId === session.playerId);
          if (idx !== -1) matchmakingQueue.splice(idx, 1);

          matchmakingQueue.push({
            playerId: session.playerId,
            displayName: session.displayName,
            preferredMap: typeof msg.preferredMap === 'string' ? msg.preferredMap : 'magura_town',
            joinedAt: Date.now(),
            ws
          });

          console.log(`[MATCHMAKING] Player ${session.displayName} joined queue (queue length=${matchmakingQueue.length})`);

          ws.send(JSON.stringify({
            type: 'MATCHMAKING_QUEUED',
            message: 'Searching for opponents...'
          }));

          processMatchmaking();
          break;
        }

        case 'CANCEL_MATCHMAKING': {
          const qIdx = matchmakingQueue.findIndex(e => e.playerId === session.playerId);
          if (qIdx !== -1) {
            matchmakingQueue.splice(qIdx, 1);
            console.log(`[MATCHMAKING] Player ${session.displayName} cancelled queue`);
          }
          ws.send(JSON.stringify({
            type: 'MATCHMAKING_CANCELLED',
            message: 'Matchmaking cancelled.'
          }));
          break;
        }

        case 'LEAVE_ROOM': {
          handleLeaveRoom(session);
          ws.send(JSON.stringify({
            type: 'ROOM_LEFT'
          }));
          break;
        }
      }
    } catch (err) {
      console.error('[WebSocket Error]', err);
    }
  });

  ws.on('close', () => {
    // Remove from matchmaking queue if present
    const qIdx = matchmakingQueue.findIndex(e => e.ws === ws);
    if (qIdx !== -1) matchmakingQueue.splice(qIdx, 1);

    handleLeaveRoom(session, true);
    clients.delete(ws);
  });
});

// STEP 8: HTTP Endpoints & Health Check
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'battlezone-magura-server',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    activeRooms: rooms.size,
    connectedPlayers: clients.size
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      console.warn('[SERVER] Warning: dist directory not found in production mode. Initializing Vite middleware fallback...');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
    }
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Battlezone Magura] Authoritative Server active on port ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
  });
}

// Graceful Shutdown Handler (Step 8.5)
function handleShutdown(signal: string) {
  console.log(`[SERVER] Received ${signal}. Initiating graceful shutdown...`);

  // Inform connected clients
  for (const [ws, _s] of clients.entries()) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({
          type: 'SERVER_SHUTDOWN',
          message: 'Server is restarting for update.'
        }));
        ws.close(1001, 'Server shutting down');
      } catch (e) {
        // ignore
      }
    }
  }

  wss.close(() => {
    server.close(() => {
      console.log('[SERVER] Server closed cleanly.');
      process.exit(0);
    });
  });

  // Force exit if hanging
  setTimeout(() => {
    process.exit(0);
  }, 3000);
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

startServer();
