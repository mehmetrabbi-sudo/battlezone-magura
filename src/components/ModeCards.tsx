import React from 'react';
import { GameMode, GameModeId, MapId } from '../types';
import { Target, Swords, Bot, Compass, CheckCircle2, MapPin, Users, Play } from 'lucide-react';
import { sounds } from '../utils/audio';

interface ModeCardsProps {
  modes: GameMode[];
  selectedMode: GameModeId;
  selectedMapId?: MapId;
  onSelectMode: (modeId: GameModeId) => void;
  onStartMatch: (modeId: GameModeId) => void;
}

export const ModeCards: React.FC<ModeCardsProps> = ({
  modes,
  selectedMode,
  selectedMapId = 'magura_town',
  onSelectMode,
  onStartMatch
}) => {
  const getIcon = (name: string, isSelected: boolean) => {
    const className = `w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`;
    switch (name) {
      case 'battle_royale':
        return <Target className={className} />;
      case 'clash_match':
        return <Swords className={className} />;
      case 'bot_match':
        return <Bot className={className} />;
      case 'free_roam':
      default:
        return <Compass className={className} />;
    }
  };

  return (
    <div className="w-full h-full min-h-0 grid grid-cols-4 gap-1 sm:gap-2 md:gap-3 px-0.5 sm:px-1 overflow-hidden">
      {modes.map((mode) => {
        const isSelected = selectedMode === mode.id;

        return (
          <div
            key={mode.id}
            id={`card-mode-${mode.id}`}
            onClick={() => {
              sounds.playSelect();
              onSelectMode(mode.id);
            }}
            onMouseEnter={() => {
              sounds.playHover();
            }}
            className={`relative group cursor-pointer rounded-lg sm:rounded-xl p-1.5 sm:p-2 md:p-2.5 transition-all duration-200 select-none overflow-hidden flex flex-col justify-between h-full min-h-0 border ${
              isSelected
                ? 'bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-amber-950/40 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/50'
                : 'bg-slate-950/85 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
            }`}
          >
            {/* Ambient Corner Accent */}
            <div className={`absolute top-0 right-0 w-10 sm:w-14 h-10 sm:h-14 pointer-events-none rounded-bl-full transition-opacity ${
              isSelected ? 'bg-amber-500/15 opacity-100' : 'opacity-0 group-hover:opacity-40 bg-slate-700/10'
            }`} />

            {/* Top Area: Tag & Status */}
            <div className="min-h-0 flex-1 flex flex-col justify-start">
              <div className="flex items-center justify-between gap-1 mb-0.5 sm:mb-1">
                <span className={`text-[7px] sm:text-[8px] md:text-[9px] font-mono font-black uppercase tracking-wider px-1 sm:px-1.5 py-0.5 rounded truncate max-w-[78%] ${
                  isSelected 
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' 
                    : 'bg-slate-800 text-slate-300 group-hover:text-white'
                }`}>
                  {mode.tag}
                </span>

                {isSelected && (
                  <span className="flex items-center gap-0.5 text-[7px] sm:text-[8px] md:text-[9px] font-bold text-amber-400 animate-pulse shrink-0">
                    <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>ACTIVE</span>
                  </span>
                )}
              </div>

              {/* Icon & Title */}
              <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 my-0.5 sm:my-1 min-w-0">
                <div className={`p-1 sm:p-1.5 md:p-2 rounded-md sm:rounded-lg transition-colors shrink-0 ${
                  isSelected 
                    ? 'bg-amber-500/20 border border-amber-400/40' 
                    : 'bg-slate-900/90 border border-slate-800 group-hover:border-slate-700'
                }`}>
                  {getIcon(mode.id, isSelected)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-[10px] sm:text-xs md:text-sm font-black tracking-wide uppercase leading-tight truncate ${
                    isSelected ? 'text-amber-300' : 'text-slate-200 group-hover:text-white'
                  }`}>
                    {mode.title}
                  </h3>
                  <p className="text-[7px] sm:text-[8px] md:text-[9px] text-slate-400 truncate mt-0.5 hidden xs:block">
                    {mode.subtitle}
                  </p>
                </div>
              </div>

              {/* Mode Meta: Map & Players */}
              <div className="mt-auto pt-0.5 sm:pt-1 border-t border-slate-800/80 flex items-center justify-between text-[7px] sm:text-[8px] md:text-[9px] font-mono text-slate-400 min-w-0">
                <div className="flex items-center gap-0.5 sm:gap-1 truncate max-w-[65%]">
                  <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-500 shrink-0" />
                  <span className="truncate">{selectedMapId === 'abalpur_village' ? 'Abalpur Village' : 'Magura Town'}</span>
                </div>
                <div className="flex items-center gap-0.5 text-slate-400 shrink-0">
                  <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-500" />
                  <span>{mode.players}</span>
                </div>
              </div>
            </div>

            {/* Clear Action Button: START MATCH on Selected Mode, Tap to Select on Others */}
            <div className="mt-1 sm:mt-1.5 pt-1 border-t border-slate-800/60 shrink-0">
              {isSelected ? (
                <button
                  id={`btn-start-mode-${mode.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playLaunchGame();
                    onStartMatch(mode.id);
                  }}
                  className="w-full h-6 sm:h-7 md:h-8 px-1 sm:px-2 rounded-md sm:rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-[9px] sm:text-[10px] md:text-xs tracking-wider uppercase flex items-center justify-center gap-1 sm:gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.4)] active:scale-95 transition-all cursor-pointer border border-amber-300 truncate"
                  title={`Start ${mode.title}`}
                >
                  <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-slate-950 shrink-0" />
                  <span className="truncate">START MATCH</span>
                </button>
              ) : (
                <div className="w-full h-6 sm:h-7 md:h-8 px-1 sm:px-1.5 rounded-md sm:rounded-lg bg-slate-900/60 group-hover:bg-slate-800 text-slate-400 group-hover:text-slate-200 text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-wider uppercase flex items-center justify-center border border-slate-800/80 group-hover:border-slate-700 transition-colors truncate">
                  <span className="truncate">TAP TO SELECT</span>
                </div>
              )}
            </div>

            {/* Active Glow Bottom Line */}
            <div className={`absolute bottom-0 left-0 right-0 h-[2px] sm:h-[3px] transition-all duration-300 ${
              isSelected 
                ? 'bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 opacity-100' 
                : 'opacity-0 group-hover:opacity-40 bg-slate-600'
            }`} />
          </div>
        );
      })}
    </div>
  );
};
