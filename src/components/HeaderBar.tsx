import React from 'react';
import { Settings, Volume2, VolumeX, Shield, Wifi, Award } from 'lucide-react';
import { PlayerProfile } from '../types';
import { sounds } from '../utils/audio';

interface HeaderBarProps {
  player: PlayerProfile;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  player,
  onOpenSettings,
  onOpenProfile,
  soundEnabled,
  onToggleSound
}) => {
  return (
    <header 
      className="w-full h-11 sm:h-12 md:h-13 flex items-center justify-between px-2 sm:px-4 md:px-6 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 z-20 select-none shrink-0 max-w-full overflow-hidden"
      style={{
        paddingLeft: 'max(env(safe-area-inset-left), 0.5rem)',
        paddingRight: 'max(env(safe-area-inset-right), 0.5rem)',
        paddingTop: 'max(env(safe-area-inset-top), 0.2rem)'
      }}
    >
      {/* Left: Player Profile Badge (RABBI, Level, Rank, XP) */}
      <div 
        id="btn-header-profile"
        onClick={() => {
          sounds.playOpenModal();
          onOpenProfile();
        }}
        className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group py-1 px-1.5 sm:px-2 rounded-lg hover:bg-slate-900/90 border border-transparent hover:border-slate-800 active:scale-95 transition-all shrink min-w-0"
        title="View Player Profile"
      >
        {/* Avatar badge */}
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 border-2 border-amber-400 flex items-center justify-center shadow-md shadow-amber-950/50 overflow-hidden shrink-0">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 fill-amber-300" />
          <div className="absolute bottom-0 right-0 bg-slate-950/90 px-0.5 sm:px-1 text-[7px] sm:text-[8px] font-mono font-black text-amber-400 rounded-tl">
            {player.level}
          </div>
        </div>

        {/* Name & Rank */}
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <span className="text-[11px] sm:text-xs md:text-sm font-black tracking-wider text-slate-100 uppercase group-hover:text-amber-400 transition-colors truncate">
              {player.name}
            </span>
            <span className="text-[7px] sm:text-[8px] md:text-[9px] font-bold px-1 sm:px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 truncate hidden xs:inline-block">
              {player.rank}
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
            <div className="w-10 sm:w-16 md:w-20 h-1 sm:h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400"
                style={{ width: `${(player.xp / player.nextLevelXp) * 100}%` }}
              />
            </div>
            <span className="text-[7px] sm:text-[8px] font-mono text-slate-400 shrink-0">
              LVL {player.level}
            </span>
          </div>
        </div>
      </div>

      {/* Center: BATTLEZONE MAGURA Logo / Title */}
      <div className="flex flex-col items-center justify-center px-1 sm:px-2 shrink-0">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="text-xs sm:text-sm md:text-base lg:text-lg font-black tracking-wider sm:tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] uppercase font-mono whitespace-nowrap">
            BATTLEZONE MAGURA
          </span>
          <span className="text-[7px] sm:text-[8px] font-mono font-bold px-1 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 hidden sm:inline-block">
            SEASON 1
          </span>
        </div>
        <span className="text-[7px] sm:text-[8px] md:text-[9px] font-mono tracking-wider text-slate-400 uppercase hidden md:block">
          SECTOR 1 • MAGURA COMBAT THEATER
        </span>
      </div>

      {/* Right: Currency / Status / Audio / Settings */}
      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
        {/* Magura Taka */}
        <div className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-[9px] sm:text-[10px] md:text-xs font-mono font-bold text-emerald-400 shadow-inner">
          <span className="text-[10px] sm:text-xs font-serif font-black">৳</span>
          <span>{player.tokens.toLocaleString()}</span>
        </div>

        {/* CP Credits */}
        <div className="hidden xs:flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-[9px] sm:text-[10px] md:text-xs font-mono font-bold text-amber-300 shadow-inner">
          <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
          <span>{player.cp.toLocaleString()}</span>
        </div>

        {/* Server Ping */}
        <div className="hidden lg:flex items-center gap-1 text-[8px] sm:text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded-md">
          <Wifi className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span>18ms</span>
        </div>

        {/* Sound Toggle */}
        <button
          id="btn-header-sound"
          onClick={() => {
            onToggleSound();
          }}
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 active:scale-95 transition-colors cursor-pointer shrink-0"
          title={soundEnabled ? "Mute Audio" : "Unmute Audio"}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />}
        </button>

        {/* Settings Button */}
        <button
          id="btn-header-settings"
          onClick={() => {
            sounds.playOpenModal();
            onOpenSettings();
          }}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 h-8 sm:h-9 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/60 text-slate-200 hover:text-amber-300 active:scale-95 transition-all shadow-md group cursor-pointer shrink-0"
          title="Game Settings"
        >
          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-amber-400 group-hover:rotate-45 transition-transform" />
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider hidden sm:inline">Settings</span>
        </button>
      </div>
    </header>
  );
};
