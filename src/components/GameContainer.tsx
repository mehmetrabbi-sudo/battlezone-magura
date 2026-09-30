import React, { useEffect, useRef } from 'react';
import { LogOut } from 'lucide-react';
import { GameModeId, MapId } from '../types';
import { sounds } from '../utils/audio';

interface GameContainerProps {
  mode: GameModeId;
  map: MapId;
  matchId?: number;
  missionId?: string;
  isVisible: boolean;
  onExitToLobby: () => void;
  multiplayerSession?: {
    roomId: string;
    playerId: string;
    isHost: boolean;
    playerSpawns: any;
    roomState: any;
  } | null;
}

export const GameContainer: React.FC<GameContainerProps> = ({ 
  mode, 
  map = 'abalpur_village', 
  matchId, 
  missionId, 
  isVisible, 
  onExitToLobby,
  multiplayerSession 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Listen for exit messages sent from inside the game iframe or Escape key
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'BATTLEZONE_EXIT_TO_LOBBY') {
        sounds.playHover();
        onExitToLobby();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVisible && (e.key === 'Escape' || e.key === 'Esc')) {
        sounds.playHover();
        onExitToLobby();
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, onExitToLobby]);

  // When map selection, mode, or missionId changes, inform iframe to switch environment
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'BATTLEZONE_LOAD_MAP', map, mode, missionId }, '*');
    }
  }, [map, mode, missionId]);

  // When visibility changes (launching into game), activate and resize
  useEffect(() => {
    if (isVisible) {
      const sendActivation = () => {
        window.dispatchEvent(new Event('resize'));
        if (iframeRef.current && iframeRef.current.contentWindow) {
          if (multiplayerSession) {
            const getWsUrl = () => {
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
              const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
              return `${proto}//${window.location.host}`;
            };

            iframeRef.current.contentWindow.postMessage({
              type: 'BATTLEZONE_START_MULTIPLAYER',
              map,
              roomId: multiplayerSession.roomId,
              playerId: multiplayerSession.playerId,
              isHost: multiplayerSession.isHost,
              playerSpawns: multiplayerSession.playerSpawns,
              roomState: multiplayerSession.roomState,
              serverUrl: getWsUrl()
            }, '*');
          } else {
            iframeRef.current.contentWindow.postMessage({ 
              type: 'BATTLEZONE_ACTIVATE', 
              map, 
              mode, 
              matchId, 
              missionId 
            }, '*');
          }
        }
      };

      sendActivation();
      const timer1 = setTimeout(sendActivation, 60);
      const timer2 = setTimeout(sendActivation, 180);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isVisible, map, mode, matchId, missionId, multiplayerSession]);

  return (
    <div 
      id="gameplay-viewport-container"
      className={`absolute inset-0 w-full h-full bg-black overflow-hidden flex flex-col transition-opacity duration-200 ${
        isVisible ? 'z-40 opacity-100 pointer-events-auto' : '-z-10 opacity-0 pointer-events-none'
      }`}
    >
      {/* Embedded Existing Gameplay — Single Persistent Instance */}
      <iframe
        ref={iframeRef}
        id="game-iframe-battlezone"
        src={`/battlezone/index.html?mode=${mode}&map=${map}${missionId ? `&mission=${missionId}` : ''}`}
        title="Battlezone Magura Gameplay"
        className="w-full h-full border-0"
        allow="accelerometer; gyroscope; magnetometer"
      />
    </div>
  );
};
