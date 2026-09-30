import React from 'react';
import { User, Briefcase, Play, Crosshair, MapPin, Trophy } from 'lucide-react';
import { GameMode, MapId } from '../types';
import { sounds } from '../utils/audio';

interface BottomBarProps {
  selectedMode: GameMode;
  selectedMapId: MapId;
  onSelectMap: (mapId: MapId) => void;
  onPlay: () => void;
  onOpenProfile: () => void;
  onOpenLoadout: () => void;
  onOpenInventory: () => void;
  onOpenMissions: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  selectedMode,
  selectedMapId,
  onSelectMap,
  onPlay,
  onOpenProfile,
  onOpenLoadout,
  onOpenInventory,
  onOpenMissions
}) => {
  return (
    <footer 
      className="w-full h-12 sm:h-13 md:h-15 flex items-center justify-between px-2 sm:px-4 md:px-6 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 z-20 select-none shrink-0 max-w-full overflow-hidden"
      style={{
        paddingLeft: 'max(env(safe-area-inset-left), 0.5rem)',
        paddingRight: 'max(env(safe-area-inset-right), 0.5rem)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 0.25rem)'
      }}
    >
      {/* Left: Tactical Navigation Buttons (PROFILE, LOADOUT, INVENTORY, MISSIONS) */}
      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink min-w-0">
        {/* Profile Button */}
        <button
          id="btn-nav-profile"
          onClick={() => {
            sounds.playOpenModal();
            onOpenProfile();
          }}
          onMouseEnter={() => sounds.playHover()}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-3.5 h-9 sm:h-10 md:h-11 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition-all shadow-sm group active:scale-95 cursor-pointer shrink-0"
          title="Player Profile"
        >
          <div className="p-1 rounded bg-slate-800 group-hover:bg-amber-500/20 text-slate-300 group-hover:text-amber-400 transition-colors shrink-0">
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="text-[10px] sm:text-[11px] md:text-xs font-black tracking-wider uppercase whitespace-nowrap">
            PROFILE
          </span>
        </button>

        {/* Loadout Button */}
        <button
          id="btn-nav-loadout"
          onClick={() => {
            sounds.playOpenModal();
            onOpenLoadout();
          }}
          onMouseEnter={() => sounds.playHover()}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-3.5 h-9 sm:h-10 md:h-11 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition-all shadow-sm group active:scale-95 cursor-pointer shrink-0"
          title="Weapons & Loadout"
        >
          <div className="p-1 rounded bg-slate-800 group-hover:bg-amber-500/20 text-slate-300 group-hover:text-amber-400 transition-colors shrink-0">
            <Crosshair className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="text-[10px] sm:text-[11px] md:text-xs font-black tracking-wider uppercase whitespace-nowrap">
            LOADOUT
          </span>
        </button>

        {/* Inventory Button */}
        <button
          id="btn-nav-inventory"
          onClick={() => {
            sounds.playOpenModal();
            onOpenInventory();
          }}
          onMouseEnter={() => sounds.playHover()}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-3.5 h-9 sm:h-10 md:h-11 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition-all shadow-sm group active:scale-95 cursor-pointer shrink-0"
          title="Tactical Inventory"
        >
          <div className="p-1 rounded bg-slate-800 group-hover:bg-amber-500/20 text-slate-300 group-hover:text-amber-400 transition-colors shrink-0">
            <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="text-[10px] sm:text-[11px] md:text-xs font-black tracking-wider uppercase whitespace-nowrap">
            INVENTORY
          </span>
        </button>

        {/* Missions Button */}
        <button
          id="btn-nav-missions"
          onClick={() => {
            sounds.playOpenModal();
            onOpenMissions();
          }}
          onMouseEnter={() => sounds.playHover()}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-3.5 h-9 sm:h-10 md:h-11 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 hover:border-cyan-400 text-cyan-200 hover:text-white transition-all shadow-sm group active:scale-95 cursor-pointer shrink-0"
          title="Operational Missions"
        >
          <div className="p-1 rounded bg-cyan-900/60 group-hover:bg-cyan-500/30 text-cyan-400 group-hover:text-cyan-300 transition-colors shrink-0">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="text-[10px] sm:text-[11px] md:text-xs font-black tracking-wider uppercase whitespace-nowrap text-cyan-300 group-hover:text-cyan-100">
            MISSIONS
          </span>
        </button>
      </div>

      {/* Center: Map Switcher (MAGURA TOWN vs ABALPUR VILLAGE) */}
      <div className="flex items-center bg-slate-900/95 border border-slate-800 rounded-lg p-0.5 sm:p-1 gap-1 shrink-0 shadow-inner">
        <div className="hidden sm:flex items-center gap-1 pl-1 text-[8px] sm:text-[9px] font-mono font-bold text-slate-400">
          <MapPin className="w-3 h-3 text-amber-400" />
          <span>MAP:</span>
        </div>
        <button
          id="btn-map-magura-town"
          onClick={() => {
            sounds.playSelect();
            onSelectMap('magura_town');
          }}
          className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-md text-[9px] sm:text-[10px] md:text-xs font-black tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            selectedMapId === 'magura_town'
              ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)] ring-1 ring-amber-300'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
          }`}
          title="Magura Town (Urban Combat)"
        >
          {selectedMapId === 'magura_town' && (
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
          )}
          <span>MAGURA TOWN</span>
        </button>
        <button
          id="btn-map-abalpur-village"
          onClick={() => {
            sounds.playSelect();
            onSelectMap('abalpur_village');
          }}
          className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-md text-[9px] sm:text-[10px] md:text-xs font-black tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            selectedMapId === 'abalpur_village'
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)] ring-1 ring-emerald-300'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
          }`}
          title="Abalpur Village (Rural Combat)"
        >
          {selectedMapId === 'abalpur_village' && (
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
          )}
          <span>ABALPUR VILLAGE</span>
        </button>
        <button
          id="btn-map-river-port"
          onClick={() => {
            sounds.playSelect();
            onSelectMap('magura_river_port');
          }}
          className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-md text-[9px] sm:text-[10px] md:text-xs font-black tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            selectedMapId === 'magura_river_port' || selectedMapId === 'magura-river-port'
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)] ring-1 ring-cyan-300'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
          }`}
          title="Magura River Port (Industrial Zone)"
        >
          {(selectedMapId === 'magura_river_port' || selectedMapId === 'magura-river-port') && (
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
          )}
          <span>RIVER PORT</span>
          <span className={`hidden md:inline text-[7px] font-bold px-1 py-0.2 rounded ${
            selectedMapId === 'magura_river_port' || selectedMapId === 'magura-river-port' ? 'bg-slate-950/30 text-slate-950' : 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40'
          }`}>
            MAP 3
          </span>
        </button>
      </div>

      {/* Right: Selected Mode Quick Badge & Tactical PLAY Button */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mode Preview Tag */}
        <div className="hidden lg:flex flex-col items-end justify-center pr-1">
          <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-slate-400">
            <span className={`w-1.5 h-1.5 rounded-full ${selectedMapId === 'magura_river_port' || selectedMapId === 'magura-river-port' ? 'bg-cyan-400' : selectedMapId === 'abalpur_village' ? 'bg-emerald-400' : 'bg-amber-400'} animate-ping inline-block`} />
            <span className="uppercase">{selectedMapId === 'magura_river_port' || selectedMapId === 'magura-river-port' ? 'RIVER PORT' : selectedMapId === 'abalpur_village' ? 'ABALPUR' : 'MAGURA'} READY</span>
          </div>
          <div className="text-xs font-black text-amber-300 uppercase tracking-wider truncate max-w-[160px]">
            {selectedMode.title}
          </div>
        </div>

        {/* Large Tactical PLAY / START Button */}
        <button
          id="btn-main-play"
          onClick={() => {
            sounds.playLaunchGame();
            onPlay();
          }}
          onMouseEnter={() => sounds.playHover()}
          className="relative group flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-7 md:px-9 h-9 sm:h-10 md:h-11 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:via-amber-300 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-xs sm:text-sm md:text-base tracking-wider uppercase shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:shadow-[0_0_30px_rgba(245,158,11,0.7)] transition-all cursor-pointer border border-amber-200/70 overflow-hidden shrink-0 whitespace-nowrap"
        >
          {/* Animated Sheen effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

          <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-slate-950 text-slate-950 transition-transform group-hover:scale-110 shrink-0" />
          <span>START / PLAY</span>

          {/* Subtext badge */}
          <span className="hidden xl:inline-block text-[8px] font-bold tracking-normal px-1 py-0.2 rounded bg-slate-950/20 text-slate-900 border border-slate-950/30">
            যুদ্ধ শুরু
          </span>
        </button>
      </div>
    </footer>
  );
};
