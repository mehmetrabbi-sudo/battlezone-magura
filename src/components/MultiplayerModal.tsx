import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Users, 
  Play, 
  Copy, 
  Check, 
  Crown, 
  Shield, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft,
  MapPin,
  CheckCircle2,
  Clock,
  Wifi,
  WifiOff,
  UserPlus,
  UserCheck,
  Mail,
  Zap,
  Radio,
  Server
} from 'lucide-react';
import { MapId } from '../types';
import { sounds } from '../utils/audio';

interface PlayerInfo {
  playerId: string;
  displayName: string;
  isHost: boolean;
  isReady: boolean;
  connected: boolean;
  kills?: number;
  deaths?: number;
}

interface RoomState {
  roomId: string;
  hostPlayerId: string;
  mapId: MapId;
  maxPlayers: number;
  gameState: 'waiting' | 'in_game' | 'ended';
  players: PlayerInfo[];
}

interface FriendItem {
  playerId: string;
  displayName: string;
  status: 'ONLINE' | 'IN_ROOM' | 'IN_MATCH' | 'OFFLINE';
  roomId?: string | null;
}

interface PendingFriendReq {
  playerId: string;
  displayName: string;
}

interface RoomInvite {
  inviterId: string;
  inviterName: string;
  roomId: string;
  mapId: string;
}

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  onStartMultiplayerMatch: (
    mapId: MapId, 
    roomId: string, 
    playerId: string, 
    isHost: boolean, 
    playerSpawns: any, 
    roomState: RoomState
  ) => void;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  isOpen,
  onClose,
  playerName,
  onStartMultiplayerMatch
}) => {
  const [activeTab, setActiveTab] = useState<'lobby' | 'friends'>('lobby');
  const [view, setView] = useState<'menu' | 'join' | 'room' | 'matchmaking'>('menu');
  const [inputRoomId, setInputRoomId] = useState('');
  const [displayName, setDisplayName] = useState(playerName || 'COMMANDO');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Connection states
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [serverHost, setServerHost] = useState('');

  // Room state
  const [roomId, setRoomId] = useState<string | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Matchmaking state (Step 7)
  const [matchmakingTimer, setMatchmakingTimer] = useState(0);

  // Social / Friends state (Step 6)
  const [friendsList, setFriendsList] = useState<FriendItem[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingFriendReq[]>([]);
  const [friendInput, setFriendInput] = useState('');
  const [friendSuccessMsg, setFriendSuccessMsg] = useState<string | null>(null);
  const [incomingInvite, setIncomingInvite] = useState<RoomInvite | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isTransitioningToGameRef = useRef(false);

  // Determine authoritative server URL (Step 8 & 9)
  const getWebSocketUrl = () => {
    try {
      const rawUrl = (import.meta as any).env?.VITE_SERVER_URL || (typeof window !== 'undefined' ? (window as any).__VITE_SERVER_URL__ : null);
      if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim().length > 0) {
        const clean = rawUrl.trim().replace(/\/+$/, '');
        if (clean.startsWith('http://')) return clean.replace(/^http:\/\//, 'ws://');
        if (clean.startsWith('https://')) return clean.replace(/^https:\/\//, 'wss://');
        if (clean.startsWith('ws://') || clean.startsWith('wss://')) return clean;
        const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${proto}//${clean}`;
      }
    } catch (e) {}

    const isLocalDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (!isLocalDev) {
      return 'wss://battlezone-magura.onrender.com';
    }

    if (typeof window !== 'undefined' && window.location) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${window.location.host}`;
    }
    return 'ws://localhost:3000';
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const rawUrl = (import.meta as any).env?.VITE_SERVER_URL || (window as any).__VITE_SERVER_URL__;
        if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim().length > 0) {
          const clean = rawUrl.trim().replace(/\/+$/, '').replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '');
          setServerHost(clean);
          return;
        }
      } catch (e) {}
      const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isLocalDev) {
        setServerHost('battlezone-magura.onrender.com');
        return;
      }
      setServerHost(window.location.host);
    }
  }, []);

  // Matchmaking elapsed timer
  useEffect(() => {
    let interval: any;
    if (view === 'matchmaking') {
      setMatchmakingTimer(0);
      interval = setInterval(() => {
        setMatchmakingTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view]);

  // WebSocket Connection Management
  useEffect(() => {
    if (!isOpen) {
      if (!isTransitioningToGameRef.current && wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      isTransitioningToGameRef.current = false;
      setView('menu');
      setRoomId(null);
      setRoomState(null);
      setIsReady(false);
      setErrorMsg(null);
      setIsConnected(false);
      setIsReconnecting(false);
      setIncomingInvite(null);
      return;
    }

    const connect = () => {
      try {
        const wsUrl = getWebSocketUrl();
        console.log(`[NET] connecting to ${wsUrl}`);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          // Handshake will confirm connection
          setErrorMsg(null);
          ws.send(JSON.stringify({ type: 'SET_DISPLAY_NAME', displayName }));

          // Re-claim existing room session if reconnecting
          if (roomId && myPlayerId) {
            ws.send(JSON.stringify({ type: 'RECONNECT', roomId, playerId: myPlayerId }));
          }

          // Fetch friends list
          ws.send(JSON.stringify({ type: 'GET_FRIENDS' }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (!data || !data.type) return;

            switch (data.type) {
              case 'SERVER_HELLO':
              case 'CONNECTED':
                setIsConnected(true);
                setIsReconnecting(false);
                reconnectAttemptsRef.current = 0;
                setMyPlayerId(data.playerId);
                console.log(`[NET] connected playerId=${data.playerId}`);
                break;

              case 'CREATE_ROOM_SUCCESS':
              case 'ROOM_CREATED':
              case 'JOIN_SUCCESS':
              case 'ROOM_JOINED':
                setRoomId(data.roomId);
                setMyPlayerId(data.playerId);
                setRoomState(data.roomState);
                setView('room');
                setIsReady(data.host || false);
                setErrorMsg(null);
                sounds.playSelect();
                console.log(`[NET] ${data.type} roomId=${data.roomId}`);
                break;

              case 'ROOM_STATE':
                setRoomState(data.roomState);
                if (data.roomState && myPlayerId) {
                  const me = data.roomState.players.find((p: PlayerInfo) => p.playerId === myPlayerId);
                  if (me) setIsReady(me.isReady);
                }
                break;

              case 'MATCH_FOUND':
                sounds.playLaunchGame();
                setRoomId(data.roomId);
                setRoomState(data.roomState);
                setView('room');
                setIsReady(data.isHost || false);
                console.log(`[NET] MATCH_FOUND roomId=${data.roomId}`);
                break;

              case 'MATCHMAKING_QUEUED':
                setView('matchmaking');
                sounds.playSelect();
                break;

              case 'MATCHMAKING_CANCELLED':
              case 'MATCHMAKING_TIMEOUT':
                setView('menu');
                if (data.message) setErrorMsg(data.message);
                sounds.playAlert();
                break;

              case 'ROOM_INVITE':
                sounds.playAlert();
                setIncomingInvite({
                  inviterId: data.inviterId,
                  inviterName: data.inviterName,
                  roomId: data.roomId,
                  mapId: data.mapId
                });
                break;

              case 'FRIENDS_LIST':
                setFriendsList(data.friends || []);
                setPendingRequests(data.pendingRequests || []);
                break;

              case 'FRIEND_REQUEST_RECEIVED':
                sounds.playAlert();
                setPendingRequests(prev => [
                  ...prev.filter(r => r.playerId !== data.fromPlayerId),
                  { playerId: data.fromPlayerId, displayName: data.fromDisplayName }
                ]);
                break;

              case 'FRIEND_REQUEST_SENT':
                setFriendSuccessMsg(`Friend request sent to ${data.targetDisplayName}!`);
                setTimeout(() => setFriendSuccessMsg(null), 3000);
                break;

              case 'FRIEND_ACCEPTED':
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                  wsRef.current.send(JSON.stringify({ type: 'GET_FRIENDS' }));
                }
                break;

              case 'FRIEND_ERROR':
                setErrorMsg(data.message);
                sounds.playAlert();
                break;

              case 'ROOM_NOT_FOUND':
              case 'ROOM_ERROR':
                setErrorMsg(data.message || `Room ${data.roomId || ''} not found.`);
                sounds.playAlert();
                console.log(`[NET] Error: ${data.message || data.code}`);
                break;

              case 'MATCH_STARTING':
                sounds.playLaunchGame();
                isTransitioningToGameRef.current = true;
                onStartMultiplayerMatch(
                  data.mapId,
                  data.roomId,
                  myPlayerId || '',
                  roomState ? roomState.hostPlayerId === myPlayerId : false,
                  data.playerSpawns,
                  data.roomState || roomState
                );
                onClose();
                break;

              case 'ROOM_LEFT':
                setView('menu');
                setRoomId(null);
                setRoomState(null);
                setIsReady(false);
                break;
            }
          } catch (e) {
            console.error('[Multiplayer Modal] Parse error', e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          if (isOpen && !isTransitioningToGameRef.current && reconnectAttemptsRef.current < 3) {
            setIsReconnecting(true);
            reconnectAttemptsRef.current++;
            console.log(`[NET] connection lost, retry attempt ${reconnectAttemptsRef.current}...`);
            setTimeout(connect, 1500);
          } else {
            setIsReconnecting(false);
          }
        };

        ws.onerror = () => {
          setIsConnected(false);
        };
      } catch (err) {
        setIsConnected(false);
        setErrorMsg('Multiplayer server unavailable.');
      }
    };

    connect();

    return () => {
      if (!isTransitioningToGameRef.current && wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const send = (msg: object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    } else {
      setErrorMsg('Not connected to multiplayer server.');
    }
  };

  const handleCreateRoom = () => {
    setErrorMsg(null);
    sounds.playSelect();
    console.log('[NET] CREATE_ROOM sent');
    send({ type: 'CREATE_ROOM', displayName });
  };

  const handleJoinRoom = () => {
    const cleanId = inputRoomId.trim().toUpperCase();
    if (!cleanId) {
      setErrorMsg('Enter a valid room ID.');
      return;
    }
    setErrorMsg(null);
    sounds.playSelect();
    console.log(`[NET] JOIN_ROOM sent roomId=${cleanId}`);
    send({ type: 'JOIN_ROOM', roomId: cleanId, displayName });
  };

  const handleQuickMatch = () => {
    setErrorMsg(null);
    sounds.playSelect();
    console.log('[NET] QUICK_MATCH requested');
    send({ type: 'QUICK_MATCH', displayName, preferredMap: 'magura_town' });
  };

  const handleCancelMatchmaking = () => {
    sounds.playSelect();
    send({ type: 'CANCEL_MATCHMAKING' });
    setView('menu');
  };

  const handleToggleReady = () => {
    const nextState = !isReady;
    setIsReady(nextState);
    sounds.playSelect();
    send({ type: 'SET_READY', ready: nextState });
  };

  const handleSelectMap = (mapId: MapId) => {
    sounds.playSelect();
    send({ type: 'SELECT_MAP', mapId });
  };

  const handleStartMatch = () => {
    sounds.playLaunchGame();
    send({ type: 'START_MATCH' });
  };

  const handleLeaveRoom = () => {
    sounds.playSelect();
    send({ type: 'LEAVE_ROOM' });
    setView('menu');
    setRoomId(null);
    setRoomState(null);
  };

  const handleCopyCode = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Friend actions (Step 6)
  const handleSendFriendRequest = () => {
    if (!friendInput.trim()) return;
    sounds.playSelect();
    send({ type: 'SEND_FRIEND_REQUEST', target: friendInput.trim() });
    setFriendInput('');
  };

  const handleAcceptFriend = (fromPlayerId: string) => {
    sounds.playSelect();
    send({ type: 'ACCEPT_FRIEND_REQUEST', fromPlayerId });
    setPendingRequests(prev => prev.filter(r => r.playerId !== fromPlayerId));
  };

  const handleDeclineFriend = (fromPlayerId: string) => {
    sounds.playSelect();
    send({ type: 'DECLINE_FRIEND_REQUEST', fromPlayerId });
    setPendingRequests(prev => prev.filter(r => r.playerId !== fromPlayerId));
  };

  const handleInviteFriend = (friendPlayerId: string) => {
    if (!roomId) {
      setErrorMsg('Create or join a room first to invite friends.');
      return;
    }
    sounds.playSelect();
    send({ type: 'ROOM_INVITE', targetPlayerId: friendPlayerId });
  };

  const handleAcceptInvite = () => {
    if (!incomingInvite) return;
    sounds.playSelect();
    send({ type: 'JOIN_ROOM', roomId: incomingInvite.roomId, displayName });
    setIncomingInvite(null);
  };

  const isHost = Boolean(roomState && myPlayerId && roomState.hostPlayerId === myPlayerId);
  const allReady = Boolean(
    roomState &&
    roomState.players.length > 0 &&
    roomState.players.every((p) => p.isHost || p.isReady)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-widest uppercase text-amber-400 flex items-center gap-2">
                BATTLEZONE MULTIPLAYER
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  STEPS 4–8 • COMBAT ACTIVE
                </span>
              </h2>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <span>{isConnected ? 'ONLINE • SERVER CONNECTED' : isReconnecting ? 'OFFLINE • RECONNECTING...' : 'CONNECTING...'}</span>
                {serverHost && (
                  <span className="text-slate-500 hidden sm:inline">({serverHost})</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border ${
              isConnected ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' : 'bg-rose-950/40 text-rose-400 border-rose-800/60'
            }`}>
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isConnected ? 'ONLINE' : isReconnecting ? 'RETRYING' : 'OFFLINE'}</span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Lobby vs Friends) */}
        {view !== 'room' && view !== 'matchmaking' && (
          <div className="flex items-center px-6 border-b border-slate-800/80 bg-slate-950/30">
            <button
              onClick={() => setActiveTab('lobby')}
              className={`py-2.5 px-4 text-xs font-bold font-mono tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'lobby' 
                  ? 'border-amber-400 text-amber-300' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>SQUAD LOBBY</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('friends');
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                  wsRef.current.send(JSON.stringify({ type: 'GET_FRIENDS' }));
                }
              }}
              className={`py-2.5 px-4 text-xs font-bold font-mono tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 relative ${
                activeTab === 'friends' 
                  ? 'border-amber-400 text-amber-300' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>FRIENDS ({friendsList.length})</span>
              {pendingRequests.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-2 right-2" />
              )}
            </button>
          </div>
        )}

        {/* Incoming Invite Toast Banner */}
        {incomingInvite && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-amber-950/80 border border-amber-500/60 text-amber-200 text-xs font-mono flex items-center justify-between animate-in slide-in-from-top-2 shadow-lg">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>
                <strong>{incomingInvite.inviterName}</strong> invited you to Squad <strong>{incomingInvite.roomId}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAcceptInvite}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer"
              >
                JOIN
              </button>
              <button
                onClick={() => setIncomingInvite(null)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
              >
                DECLINE
              </button>
            </div>
          </div>
        )}

        {/* Error Notice */}
        {errorMsg && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-mono flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Success Notice */}
        {friendSuccessMsg && (
          <div className="mx-6 mt-3 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{friendSuccessMsg}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          
          {/* TAB 1: SQUAD LOBBY (Matchmaking / Create / Join / Room View) */}
          {activeTab === 'lobby' && (
            <>
              {/* VIEW: MAIN MENU */}
              {view === 'menu' && (
                <div className="flex flex-col gap-5">
                  {/* Operator Callsign & My Player ID */}
                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="w-full sm:w-1/2">
                      <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        OPERATOR CALLSIGN
                      </label>
                      <input
                        type="text"
                        maxLength={14}
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value.toUpperCase())}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-amber-300 font-mono tracking-wider focus:outline-none focus:border-amber-400"
                        placeholder="ENTER CALLSIGN"
                      />
                    </div>
                    {myPlayerId && (
                      <div className="w-full sm:w-1/2 bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                        <div>
                          <span className="block text-[8px] font-mono text-slate-400 uppercase">YOUR NETWORK ID</span>
                          <span className="font-mono text-xs text-slate-200 font-bold">{myPlayerId}</span>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(myPlayerId);
                            setFriendSuccessMsg('Copied Network ID to clipboard!');
                            setTimeout(() => setFriendSuccessMsg(null), 2000);
                          }}
                          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-amber-400"
                          title="Copy ID"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* STEP 7: QUICK MATCH (MATCHMAKING) */}
                    <button
                      onClick={handleQuickMatch}
                      className="p-5 rounded-xl bg-gradient-to-br from-amber-600/30 via-slate-900 to-slate-900 border border-amber-500/40 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group text-center"
                    >
                      <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                        <Zap className="w-6 h-6 fill-amber-400" />
                      </div>
                      <span className="font-black text-sm tracking-wider uppercase text-amber-300">
                        QUICK MATCH
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Instant auto-matchmaking with 2–4 players
                      </span>
                    </button>

                    {/* CREATE CUSTOM ROOM */}
                    <button
                      onClick={handleCreateRoom}
                      className="p-5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/80 hover:border-amber-500/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group text-center"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                        <Crown className="w-6 h-6" />
                      </div>
                      <span className="font-black text-sm tracking-wider uppercase text-slate-100 group-hover:text-amber-300">
                        CREATE ROOM
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Host tactical squad & choose map
                      </span>
                    </button>

                    {/* JOIN ROOM */}
                    <button
                      onClick={() => { setView('join'); sounds.playSelect(); }}
                      className="p-5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/80 hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group text-center"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6" />
                      </div>
                      <span className="font-black text-sm tracking-wider uppercase text-slate-100 group-hover:text-cyan-300">
                        JOIN ROOM
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Enter squad Room Code (e.g. MGR4821)
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW: MATCHMAKING QUEUE (Step 7) */}
              {view === 'matchmaking' && (
                <div className="py-8 flex flex-col items-center justify-center text-center gap-5">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 animate-ping" />
                    <div className="absolute inset-2 rounded-full border-2 border-amber-500/40 animate-pulse" />
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/60 flex items-center justify-center text-amber-400">
                      <Radio className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black tracking-widest uppercase text-amber-300">
                      SEARCHING FOR SQUAD...
                    </h3>
                    <p className="text-xs font-mono text-slate-400 mt-1">
                      Time elapsed: {Math.floor(matchmakingTimer / 60).toString().padStart(2, '0')}:{(matchmakingTimer % 60).toString().padStart(2, '0')}
                    </p>
                  </div>

                  <button
                    onClick={handleCancelMatchmaking}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-500 text-slate-300 hover:text-rose-400 font-mono text-xs font-bold uppercase transition-all cursor-pointer"
                  >
                    CANCEL SEARCH
                  </button>
                </div>
              )}

              {/* VIEW: JOIN ROOM INPUT */}
              {view === 'join' && (
                <div className="flex flex-col gap-5">
                  <button
                    onClick={() => { setView('menu'); sounds.playSelect(); }}
                    className="self-start flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>BACK TO MENU</span>
                  </button>

                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                      ENTER ROOM ID
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={inputRoomId}
                      onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleJoinRoom(); }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-lg font-black text-amber-300 font-mono tracking-widest text-center focus:outline-none focus:border-amber-400"
                      placeholder="MGR4821"
                      autoFocus
                    />
                    <button
                      onClick={handleJoinRoom}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black tracking-widest uppercase transition-all cursor-pointer shadow-lg"
                    >
                      JOIN SQUAD
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW: ROOM LOBBY SCREEN */}
              {view === 'room' && roomState && (
                <div className="flex flex-col gap-5">
                  {/* Room ID Badge & Header */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">
                        ROOM CODE
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xl sm:text-2xl font-black font-mono tracking-wider text-amber-400">
                          {roomId}
                        </span>
                        <button
                          onClick={handleCopyCode}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                          title="Copy Code"
                        >
                          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">
                        OPERATORS
                      </span>
                      <span className="text-base sm:text-lg font-black font-mono text-slate-100">
                        {roomState.players.length} / {roomState.maxPlayers}
                      </span>
                    </div>
                  </div>

                  {/* Player Slot List */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      SQUAD OPERATORS
                    </span>

                    {roomState.players.map((p, idx) => (
                      <div
                        key={p.playerId}
                        className={`p-3 rounded-xl border flex items-center justify-between ${
                          p.playerId === myPlayerId
                            ? 'bg-slate-900/90 border-amber-500/50'
                            : 'bg-slate-950/50 border-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black font-mono ${
                            p.isHost ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {p.isHost ? <Crown className="w-4 h-4" /> : idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold tracking-wide uppercase text-slate-100">
                                {p.displayName}
                              </span>
                              {p.playerId === myPlayerId && (
                                <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                                  YOU
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] font-mono text-slate-400 block">
                              {p.isHost ? 'SQUAD LEADER' : 'TACTICAL OPERATOR'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            p.isReady
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80'
                              : 'bg-slate-800/60 text-slate-400 border border-slate-700'
                          }`}>
                            {p.isReady ? 'READY' : 'NOT READY'}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Empty Slots */}
                    {Array.from({ length: Math.max(0, roomState.maxPlayers - roomState.players.length) }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="p-3 rounded-xl border border-dashed border-slate-800/70 bg-slate-950/20 flex items-center justify-between text-slate-500"
                      >
                        <span className="text-xs font-mono">WAITING FOR OPERATOR...</span>
                        <span className="text-[9px] font-mono uppercase text-slate-600">OPEN SLOT</span>
                      </div>
                    ))}
                  </div>

                  {/* Map Selection (Host Only) */}
                  <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>MISSION AREA (DEPLOYMENT ZONE)</span>
                      </span>
                      {!isHost && <span className="text-slate-500 font-normal">LEADER CHOOSES MAP</span>}
                    </span>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'magura_town' as MapId, name: 'MAGURA TOWN' },
                        { id: 'abalpur_village' as MapId, name: 'ABALPUR' },
                        { id: 'magura_river_port' as MapId, name: 'RIVER PORT' }
                      ].map(m => (
                        <button
                          key={m.id}
                          disabled={!isHost}
                          onClick={() => handleSelectMap(m.id)}
                          className={`py-2 px-2 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase transition-all ${
                            roomState.mapId === m.id
                              ? 'bg-amber-500 text-slate-950 shadow-md'
                              : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700'
                          } ${!isHost ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Room Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleLeaveRoom}
                      className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-500 text-slate-300 hover:text-rose-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer"
                    >
                      LEAVE
                    </button>

                    <button
                      onClick={handleToggleReady}
                      className={`flex-1 py-3 rounded-xl text-xs font-mono font-black uppercase tracking-wider border transition-all cursor-pointer ${
                        isReady
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 hover:bg-emerald-600/40'
                          : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-amber-400'
                      }`}
                    >
                      {isReady ? '✓ READY' : 'CLICK TO READY'}
                    </button>

                    {isHost && (
                      <button
                        onClick={handleStartMatch}
                        disabled={!allReady && roomState.players.length > 1}
                        className={`flex-1 py-3 rounded-xl font-mono text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          allReady || roomState.players.length === 1
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-lg'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>LAUNCH MATCH</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: FRIENDS & SOCIAL (Step 6) */}
          {activeTab === 'friends' && (
            <div className="flex flex-col gap-5">
              {/* Add Friend Input */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  ADD OPERATOR AS FRIEND
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={friendInput}
                    onChange={(e) => setFriendInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendFriendRequest(); }}
                    placeholder="ENTER CALLSIGN OR PLAYER ID"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={handleSendFriendRequest}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs uppercase cursor-pointer"
                  >
                    ADD
                  </button>
                </div>
              </div>

              {/* Pending Friend Requests */}
              {pendingRequests.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                    PENDING INCOMING REQUESTS ({pendingRequests.length})
                  </span>
                  {pendingRequests.map(req => (
                    <div
                      key={req.playerId}
                      className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold font-mono text-slate-100">{req.displayName}</span>
                        <span className="text-[9px] font-mono text-slate-400 block">{req.playerId}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptFriend(req.playerId)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded cursor-pointer"
                        >
                          ACCEPT
                        </button>
                        <button
                          onClick={() => handleDeclineFriend(req.playerId)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded cursor-pointer"
                        >
                          DECLINE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Friends List */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  OPERATOR FRIENDS LIST ({friendsList.length})
                </span>

                {friendsList.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 font-mono text-xs">
                    No friends added yet. Share your Network ID or add friends by callsign!
                  </div>
                ) : (
                  friendsList.map(f => (
                    <div
                      key={f.playerId}
                      className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-black font-mono text-xs text-amber-400">
                          {f.displayName.slice(0, 1)}
                        </div>
                        <div>
                          <span className="text-xs font-bold font-mono text-slate-100 block">{f.displayName}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              f.status === 'ONLINE' ? 'bg-emerald-400' :
                              f.status === 'IN_ROOM' ? 'bg-cyan-400' :
                              f.status === 'IN_MATCH' ? 'bg-amber-400' : 'bg-slate-600'
                            }`} />
                            <span className="text-[9px] font-mono text-slate-400 uppercase">{f.status}</span>
                          </div>
                        </div>
                      </div>

                      {roomId && f.status === 'ONLINE' && (
                        <button
                          onClick={() => handleInviteFriend(f.playerId)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs rounded-lg cursor-pointer"
                        >
                          INVITE
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
