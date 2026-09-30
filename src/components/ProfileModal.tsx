import React, { useEffect } from 'react';
import { X, Shield, Trophy, Swords, Crosshair, Award, Zap, ArrowLeft, Target } from 'lucide-react';
import { PlayerProfile } from '../types';
import { sounds } from '../utils/audio';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerProfile;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, player }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sounds.playHover();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const xpPercent = Math.min(100, Math.round((player.xp / player.nextLevelXp) * 100));
  const winRate = ((player.wins / Math.max(1, player.matchesPlayed)) * 100).toFixed(1);

  return (
    <div 
      id="profile-panel-fullscreen"
      className="fixed inset-0 z-50 w-full h-full w-[100vw] h-[100dvh] bg-slate-950/98 text-slate-100 flex flex-col justify-between overflow-hidden select-none animate-fade-in"
      style={{
        paddingLeft: 'max(env(safe-area-inset-left), 0.75rem)',
        paddingRight: 'max(env(safe-area-inset-right), 0.75rem)',
        paddingTop: 'max(env(safe-area-inset-top), 0.35rem)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 0.35rem)'
      }}
    >
      {/* Background Tactical Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.05] z-0"
        style={{
          backgroundImage: 'linear-gradient(to right, #f59e0b 1px, transparent 1px), linear-gradient(to bottom, #f59e0b 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-slate-950/90 to-black z-0" />

      {/* ================= TOP HEADER BAR ================= */}
      <header className="relative z-10 w-full h-12 sm:h-14 flex items-center justify-between px-3 sm:px-6 bg-slate-950/90 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-sm">
            <Shield className="w-5 h-5 fill-amber-400/30" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black tracking-wider text-slate-100 uppercase">
                OPERATOR DOSSIER // BATTLEZONE MAGURA
              </h2>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[9px] font-bold border border-amber-500/30">
                PRO-OPERATOR
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              রেকর্ড ও প্রোফাইল • MILITARY CLASSIFIED ID #{player.name}-042
            </p>
          </div>
        </div>

        {/* Clear X CLOSE Button */}
        <button
          id="btn-close-profile"
          onClick={() => {
            sounds.playHover();
            onClose();
          }}
          onMouseEnter={() => sounds.playHover()}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-amber-100 font-black text-xs sm:text-sm tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95 cursor-pointer group"
          title="Close Profile and Return to Lobby"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:rotate-90 transition-transform duration-200" />
          <span className="font-mono">CLOSE</span>
        </button>
      </header>

      {/* ================= MAIN LANDSCAPE CONTENT ================= */}
      <main className="relative z-10 flex-1 min-h-0 w-full px-3 sm:px-6 py-2 sm:py-3 flex gap-3 sm:gap-5 overflow-hidden">
        {/* LEFT COLUMN: Operator Identity & XP Progress Bar */}
        <div className="w-[36%] max-w-sm h-full flex flex-col justify-between p-3 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-y-auto">
          {/* Soldier Badge & Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {/* Avatar Insignia */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-900 border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-950/60 overflow-hidden shrink-0">
                <Shield className="w-9 h-9 sm:w-11 sm:h-11 text-slate-950 fill-amber-300 drop-shadow-md" />
                <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 py-0.5 text-center text-[9px] font-mono font-black text-amber-400">
                  LVL {player.level}
                </div>
              </div>

              {/* Name, Badge & Rank */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wider truncate drop-shadow-sm">
                  {player.name}
                </h1>
                
                {/* Badge: BD-COMMANDO */}
                <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gradient-to-r from-amber-500/25 to-amber-600/15 border border-amber-400/60 text-amber-300 font-mono text-[10px] sm:text-xs font-bold tracking-wider">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span>BADGE: {player.title}</span>
                </div>

                {/* Rank: Brigadier General */}
                <p className="text-xs sm:text-sm font-black text-amber-400/90 mt-1 uppercase tracking-wide">
                  {player.rank}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  LEVEL {player.level} COMMANDER
                </p>
              </div>
            </div>

            {/* XP PROGRESS BAR */}
            <div className="p-2.5 sm:p-3 rounded-lg bg-slate-950/80 border border-slate-800/90 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono">
                <span className="text-slate-400 font-bold uppercase">XP PROGRESS BAR</span>
                <span className="text-amber-400 font-black">{xpPercent}%</span>
              </div>

              {/* Graphical Progress Bar */}
              <div className="w-full h-3 sm:h-3.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700/80 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-slate-400">
                <span>{player.xp.toLocaleString()} XP</span>
                <span className="text-slate-500">NEXT TIER: {player.nextLevelXp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>

          {/* Unit & Clearance Footer */}
          <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono space-y-1 text-slate-400">
            <div className="flex justify-between">
              <span>SPECIAL UNIT:</span>
              <span className="text-slate-200 font-bold">BD Special Commando</span>
            </div>
            <div className="flex justify-between">
              <span>ACTIVE REGION:</span>
              <span className="text-amber-400 font-bold">Magura District Sector 1</span>
            </div>
            <div className="flex justify-between">
              <span>TACTICAL STATUS:</span>
              <span className="text-emerald-400 font-bold">COMBAT READY</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Combat Record Stats (Kills, Matches, Wins, K/D) */}
        <div className="flex-1 h-full flex flex-col justify-between p-3 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-y-auto">
          <div>
            {/* Header Section */}
            <div className="flex items-center justify-between pb-2 mb-2 sm:mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200">
                  TACTICAL COMBAT CAREER RECORD
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                OFFICIAL BATTLE METRICS
              </span>
            </div>

            {/* 4 PRIMARY STAT CARDS: KILLS, MATCHES, WINS, K/D */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {/* KILLS */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-b from-slate-950 to-red-950/20 border border-red-500/30 flex flex-col items-center justify-center text-center shadow-md">
                <div className="flex items-center gap-1 text-[10px] font-mono text-red-400 font-bold uppercase">
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>KILLS</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-red-400 font-mono tracking-tight mt-0.5">
                  {player.kills.toLocaleString()}
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                  Eliminations
                </div>
              </div>

              {/* MATCHES */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-b from-slate-950 to-sky-950/20 border border-sky-500/30 flex flex-col items-center justify-center text-center shadow-md">
                <div className="flex items-center gap-1 text-[10px] font-mono text-sky-400 font-bold uppercase">
                  <Swords className="w-3.5 h-3.5" />
                  <span>MATCHES</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-sky-400 font-mono tracking-tight mt-0.5">
                  {player.matchesPlayed.toLocaleString()}
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                  Deployments
                </div>
              </div>

              {/* WINS */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-b from-slate-950 to-emerald-950/20 border border-emerald-500/30 flex flex-col items-center justify-center text-center shadow-md">
                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold uppercase">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>WINS</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight mt-0.5">
                  {player.wins.toLocaleString()}
                </div>
                <div className="text-[9px] text-emerald-400 font-mono mt-0.5">
                  {winRate}% Win Rate
                </div>
              </div>

              {/* K/D */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-b from-slate-950 to-amber-950/20 border border-amber-500/30 flex flex-col items-center justify-center text-center shadow-md">
                <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400 font-bold uppercase">
                  <Zap className="w-3.5 h-3.5" />
                  <span>K/D</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight mt-0.5">
                  {player.kdRatio.toFixed(2)}
                </div>
                <div className="text-[9px] text-amber-400/80 font-mono mt-0.5">
                  Elite Rating
                </div>
              </div>
            </div>

            {/* Secondary Tactical Parameters */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">WEAPON ACCURACY</span>
                <span className="text-slate-100 font-bold text-sm">{player.accuracy}% Precision</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">FAVORED RIFLE</span>
                <span className="text-amber-300 font-bold text-xs truncate block">BD-08 Tactical 5.56</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block">TIER CLASSIFICATION</span>
                <span className="text-emerald-400 font-bold text-xs">Top 5% National Tier</span>
              </div>
            </div>
          </div>

          {/* Quick Mission Record Bar */}
          <div className="mt-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[10px] sm:text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <Target className="w-4 h-4 text-amber-400 shrink-0" />
              <span>PRIMARY COMBAT ZONE: <b className="text-amber-300">MAGURA SADAR MORE & BRIDGE</b></span>
            </div>
            <span className="text-slate-500 hidden sm:inline">VERIFIED COMBAT ID</span>
          </div>
        </div>
      </main>

      {/* ================= BOTTOM BAR ================= */}
      <footer className="relative z-10 w-full h-11 sm:h-12 flex items-center justify-between px-3 sm:px-6 bg-slate-950/90 border-t border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            OPERATOR ACTIVE
          </span>
          <span className="hidden sm:inline text-slate-400">• ENCRYPTED DOSSIER BATTLEZONE MAGURA</span>
        </div>

        {/* Return to Lobby Button */}
        <button
          id="btn-return-lobby-footer"
          onClick={() => {
            sounds.playHover();
            onClose();
          }}
          onMouseEnter={() => sounds.playHover()}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
          <span>RETURN TO LOBBY</span>
        </button>
      </footer>
    </div>
  );
};
