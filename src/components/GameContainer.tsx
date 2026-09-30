import React, { useEffect, useRef } from 'react';
import { LogOut } from 'lucide-react';
import { GameModeId, MapId } from '../types';
import { sounds } from '../utils/audio';

interface GameContainerProps {
  mode: GameModeId;
  map: MapId;
  matchId?: number;
  isVisible: boolean;
  onExitToLobby: () => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({ mode, map = 'magura_town', isVisible, onExitToLobby }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Listen for exit messages sent from inside the game iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'BATTLEZONE_EXIT_TO_LOBBY') {
        sounds.playHover();
        onExitToLobby();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onExitToLobby]);

  // When map selection or mode changes, inform iframe to switch environment
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'BATTLEZONE_LOAD_MAP', map, mode }, '*');
    }
  }, [map, mode]);

  // When visibility changes (launching into game), activate and resize
  useEffect(() => {
    if (isVisible) {
      const sendActivation = () => {
        window.dispatchEvent(new Event('resize'));
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage({ type: 'BATTLEZONE_ACTIVATE', map, mode }, '*');
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
  }, [isVisible, map, mode]);

  return (
    <div 
      id="gameplay-viewport-container"
      className={`absolute inset-0 w-full h-full bg-black overflow-hidden flex flex-col transition-opacity duration-200 ${
        isVisible ? 'z-40 opacity-100 pointer-events-auto' : '-z-10 opacity-0 pointer-events-none'
      }`}
    >
      {/* Floating Exit to Lobby Overlay Button */}
      <div className="absolute top-2 left-2 z-50 pointer-events-auto">
        <button
          id="btn-overlay-exit-lobby"
          onClick={() => {
            sounds.playHover();
            onExitToLobby();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/90 hover:bg-red-900/90 text-slate-200 hover:text-white border border-slate-700 hover:border-red-500/80 shadow-lg text-xs font-black uppercase tracking-wider backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          title="Exit match and return to Main Lobby"
        >
          <LogOut className="w-3.5 h-3.5 text-red-400" />
          <span>Exit to Lobby</span>
        </button>
      </div>

      {/* Embedded Existing Gameplay — Single Persistent Instance */}
      <iframe
        ref={iframeRef}
        id="game-iframe-battlezone"
        src={`/battlezone/index.html?mode=${mode}&map=${map}`}
        title="Battlezone Magura Gameplay"
        className="w-full h-full border-0"
        allow="accelerometer; gyroscope; magnetometer"
      />
    </div>
  );
};
