// Test two-phone multiplayer flow over WebSocket
const WebSocket = require('ws');

const SERVER_URL = process.env.TEST_SERVER_URL || 'ws://localhost:3000';

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  console.log('Testing Two-Phone Multiplayer connection against:', SERVER_URL);

  const wsA = new WebSocket(SERVER_URL);
  const wsB = new WebSocket(SERVER_URL);

  let phoneAPlayerId = null;
  let phoneBPlayerId = null;
  let createdRoomId = null;

  // 1. Connection & Handshake Phone A
  await new Promise((resolve, reject) => {
    wsA.on('open', () => console.log('Phone A connected'));
    wsA.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'SERVER_HELLO' || msg.type === 'CONNECTED') {
        phoneAPlayerId = msg.playerId;
        console.log('Phone A Handshake OK:', phoneAPlayerId);
        resolve();
      }
    });
    wsA.on('error', reject);
  });

  // 2. Connection & Handshake Phone B
  await new Promise((resolve, reject) => {
    wsB.on('open', () => console.log('Phone B connected'));
    wsB.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'SERVER_HELLO' || msg.type === 'CONNECTED') {
        phoneBPlayerId = msg.playerId;
        console.log('Phone B Handshake OK:', phoneBPlayerId);
        resolve();
      }
    });
    wsB.on('error', reject);
  });

  // 3. Phone A creates room
  console.log('Phone A creating room...');
  await new Promise((resolve) => {
    const handler = (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'CREATE_ROOM_SUCCESS' || msg.type === 'ROOM_CREATED') {
        createdRoomId = msg.roomId;
        console.log('Room created successfully:', createdRoomId);
        wsA.off('message', handler);
        resolve();
      }
    };
    wsA.on('message', handler);
    wsA.send(JSON.stringify({
      type: 'CREATE_ROOM',
      displayName: 'PHONE_A_COMMANDO',
      mapId: 'magura_town'
    }));
  });

  // 4. Phone B joins room with lowercase roomId (case-insensitivity test)
  const lowerRoomId = createdRoomId.toLowerCase();
  console.log(`Phone B joining room using lowercase ID: "${lowerRoomId}"...`);

  let phoneBJoined = false;
  let phoneAReceivedUpdate = false;

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Join room timeout')), 5000);

    wsB.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'JOIN_SUCCESS' || msg.type === 'ROOM_JOINED') {
        console.log('Phone B Join Success verified!');
        phoneBJoined = true;
        if (phoneAReceivedUpdate) {
          clearTimeout(timeout);
          resolve();
        }
      }
      if (msg.type === 'ROOM_NOT_FOUND') {
        clearTimeout(timeout);
        reject(new Error('Phone B received ROOM_NOT_FOUND'));
      }
    });

    wsA.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'ROOM_STATE' && msg.roomState && msg.roomState.players.length === 2) {
        console.log('Phone A verified Phone B in room (players: 2)');
        phoneAReceivedUpdate = true;
        if (phoneBJoined) {
          clearTimeout(timeout);
          resolve();
        }
      }
    });

    wsB.send(JSON.stringify({
      type: 'JOIN_ROOM',
      roomId: lowerRoomId,
      displayName: 'PHONE_B_OPERATOR'
    }));
  });

  // 5. Phone B Sets Ready
  console.log('Phone B setting ready...');
  await new Promise((resolve) => {
    const handler = (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'ROOM_STATE' && msg.roomState) {
        const pB = msg.roomState.players.find(p => p.playerId === phoneBPlayerId);
        if (pB && pB.isReady) {
          console.log('Phone B Ready confirmed by server');
          wsA.off('message', handler);
          resolve();
        }
      }
    };
    wsA.on('message', handler);
    wsB.send(JSON.stringify({ type: 'SET_READY', ready: true }));
  });

  // 6. Phone A Launches Match
  console.log('Phone A (Host) launching match...');
  await Promise.all([
    new Promise((resolve) => {
      const handler = (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'MATCH_STARTING') {
          console.log('Phone A received MATCH_STARTING');
          wsA.off('message', handler);
          resolve();
        }
      };
      wsA.on('message', handler);
    }),
    new Promise((resolve) => {
      const handler = (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'MATCH_STARTING') {
          console.log('Phone B received MATCH_STARTING');
          wsB.off('message', handler);
          resolve();
        }
      };
      wsB.on('message', handler);
    })
  ], wsA.send(JSON.stringify({ type: 'START_MATCH' })));

  console.log('ALL TWO-PHONE MULTIPLAYER CHECKS PASSED SUCCESSFULLY!');
  wsA.close();
  wsB.close();
  process.exit(0);
}

runTest().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
