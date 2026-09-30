import React, { useState, useEffect } from 'react';
import { GameMode, GameModeId, MapId, PlayerProfile } from './types';
import { HeaderBar } from './components/HeaderBar';
import { ModeCards } from './components/ModeCards';
import { BottomBar } from './components/BottomBar';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { LoadoutModal } from './components/LoadoutModal';
import { InventoryModal } from './components/InventoryModal';
import { GameContainer } from './components/GameContainer';
import { sounds } from './utils/audio';
import { Shield } from 'lucide-react';

const INITIAL_PLAYER: PlayerProfile = {
  name: 'RABBI',
  title: 'BD-COMMANDO',
  level: 42,
  xp: 8450,
  nextLevelXp: 10000,
  rank: 'Brigadier General',
  kdRatio: 3.42,
  accuracy: 48,
  matchesPlayed: 184,
  wins: 62,
  kills: 812,
  cp: 4850,
  tokens: 12200
};

const GAME_MODES: GameMode[] = [
  {
    id: 'battle_royale',
    title: 'BATTLE ROYALE',
    tag: '50 PLAYERS',
    subtitle: 'Magura Town Survival & Airdrops',
    mapName: 'Sector 1 (Sadar More & Bridge)',
    players: '50 Combatants',
    iconName: 'battle_royale',
    bgGradient: 'from-amber-950/40 to-slate-950',
    badgeColor: '#f59e0b'
  },
  {
    id: 'clash_match',
    title: 'CLASH MATCH',
    tag: 'TACTICAL TDM',
    subtitle: 'Intense 4v4 Urban Combat Skirmish',
    mapName: 'Puran Bazar & Stadium Road',
    players: '4 vs 4',
    iconName: 'clash_match',
    bgGradient: 'from-sky-950/40 to-slate-950',
    badgeColor: '#38bdf8'
  },
  {
    id: 'bot_match',
    title: 'BOT MATCH',
    tag: 'SOLO COMBAT',
    subtitle: '7 Elite AI Bots Weapon Training',
    mapName: 'Magura Town Center',
    players: 'Solo vs 7 Bots',
    iconName: 'bot_match',
    bgGradient: 'from-emerald-950/40 to-slate-950',
    badgeColor: '#22c55e'
  },
  {
    id: 'free_roam',
    title: 'FREE ROAM',
    tag: 'EXPLORATION',
    subtitle: 'Explore 3D Magura Town & Vehicles',
    mapName: 'Full Magura District 3D Map',
    players: 'Open Sandbox',
    iconName: 'free_roam',
    bgGradient: 'from-indigo-950/40 to-slate-950',
    badgeColor: '#818cf8'
  }
];

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedModeId, setSelectedModeId] = useState<GameModeId>('battle_royale');
  const [selectedMapId, setSelectedMapId] = useState<MapId>('magura_town');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Detect if preview viewport container is portrait-shaped (< 1.35 aspect ratio)
  const [isPortraitShape, setIsPortraitShape] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < window.innerHeight || (window.innerWidth / window.innerHeight) < 1.35;
    }
    return false;
  });

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoadoutOpen, setIsLoadoutOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsPortraitShape(w < h || (w / h) < 1.35);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const selectedMode = GAME_MODES.find((m) => m.id === selectedModeId) || GAME_MODES[0];

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
  };

  const [matchSession, setMatchSession] = useState(1);

  const handlePlay = () => {
    setMatchSession((prev) => prev + 1);
    setIsPlaying(true);
  };

  const handleStartMatch = (modeId: GameModeId) => {
    setSelectedModeId(modeId);
    setMatchSession((prev) => prev + 1);
    setIsPlaying(true);
  };

  const handleExitToLobby = () => {
    setIsPlaying(false);
  };

  return (
    <div 
      id="battlezone-root-container"
      className="fixed inset-0 w-full h-full bg-[#030712] flex flex-col items-center justify-center overflow-hidden select-none"
    >
      {/* Tactical Preview Letterbox Top Bar (Visible when preview container is portrait-shaped) */}
      {isPortraitShape && (
        <div className="w-full max-w-[calc(100dvh*16/9)] flex items-center justify-between px-3 py-1 text-[10px] font-mono text-slate-400 select-none shrink-0 z-30">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>16:9 LANDSCAPE VIEWPORT</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="hidden xs:inline">SECTOR 1 • MAGURA COMBAT LOBBY</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] text-amber-300 font-bold">
              PREVIEW MODE
            </span>
          </div>
        </div>
      )}

      {/* Responsive 16:9 Landscape Game Viewport Frame */}
      <div 
        id="battlezone-viewport-frame"
        className={`relative flex flex-col justify-between overflow-hidden bg-slate-950 transition-all duration-200 ${
          isPortraitShape
            ? 'w-full aspect-video max-w-[calc(100dvh*16/9)] max-h-[calc(100vw*9/16)] rounded-xl border border-slate-800/80 shadow-[0_0_50px_rgba(0,0,0,0.9)] ring-1 ring-amber-500/25 shrink-0'
            : 'w-full h-full'
        }`}
        style={{
          aspectRatio: isPortraitShape ? '16 / 9' : undefined,
          width: isPortraitShape ? 'min(100vw, calc(100dvh * 16 / 9))' : '100%',
          height: isPortraitShape ? 'min(100dvh, calc(100vw * 9 / 16))' : '100%',
        }}
      >
        {/* Existing Persistent Gameplay Container (Preserved completely) */}
        <GameContainer
          mode={selectedModeId}
          map={selectedMapId}
          matchId={matchSession}
          isVisible={isPlaying}
          onExitToLobby={handleExitToLobby}
        />

        {/* Main Lobby UI Shell (Native Mobile Landscape PUBG/BGMI Style) */}
        <div 
          id="lobby-screen-root"
          className={`absolute inset-0 w-full h-full overflow-hidden bg-slate-950 text-slate-100 flex flex-col justify-between font-sans select-none z-10 ${
            isPlaying ? 'hidden pointer-events-none' : 'flex'
          }`}
        >
          {/* ================= BACKGROUND AESTHETICS ================= */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0" />
          
          {/* Tactical Grid Pattern */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.06] z-0"
            style={{
              backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />

          {/* Tactical Holographic Radar Rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] border border-amber-500/10 rounded-full pointer-events-none z-0">
            <div className="absolute inset-10 border border-sky-500/10 rounded-full" />
            <div className="absolute inset-24 border border-slate-700/20 rounded-full" />
          </div>

          {/* Vignette Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-black/60 z-0" />

          {/* ================= TOP: HEADER BAR ================= */}
          <HeaderBar
            player={INITIAL_PLAYER}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
          />

          {/* ================= CENTER: FOUR GAME MODES (HORIZONTAL LANDSCAPE SPREAD) ================= */}
          <main 
            className="relative flex-1 min-h-0 w-full px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 z-10 overflow-hidden flex flex-col justify-center items-center"
            style={{
              paddingLeft: 'max(env(safe-area-inset-left), 0.5rem)',
              paddingRight: 'max(env(safe-area-inset-right), 0.5rem)'
            }}
          >
            {/* Subtle Staging Callout Watermark */}
            <div className="absolute top-1 left-4 sm:left-6 pointer-events-none hidden md:flex items-center gap-2 opacity-30 text-[9px] font-mono uppercase tracking-widest text-slate-400">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>OPERATION MAGURA LIBERATION • SELECT MISSION MODE</span>
            </div>

            {/* 4 Game Mode Cards Arranged Horizontally across the screen */}
            <div className="w-full h-full min-h-0 flex items-center justify-center">
              <ModeCards
                modes={GAME_MODES}
                selectedMode={selectedModeId}
                selectedMapId={selectedMapId}
                onSelectMode={setSelectedModeId}
                onStartMatch={handleStartMatch}
              />
            </div>
          </main>

          {/* ================= BOTTOM BAR WITH PLAY & NAV ================= */}
          <BottomBar
            selectedMode={selectedMode}
            selectedMapId={selectedMapId}
            onSelectMap={setSelectedMapId}
            onPlay={handlePlay}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenLoadout={() => setIsLoadoutOpen(true)}
            onOpenInventory={() => setIsInventoryOpen(true)}
          />
        </div>
      </div>

      {/* Tactical Preview Letterbox Bottom Bar (Visible when preview container is portrait-shaped) */}
      {isPortraitShape && (
        <div className="w-full max-w-[calc(100dvh*16/9)] flex items-center justify-between px-3 py-1 text-[9px] font-mono text-slate-400 select-none shrink-0 z-30">
          <span className="truncate">TOUCH / CLICK ANY MODE CARD TO SELECT • TAP START TO DEPLOY</span>
          <span className="text-slate-400">16:9 NATIVE HD</span>
        </div>
      )}

      {/* ================= MODALS ================= */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        player={INITIAL_PLAYER}
      />

      <LoadoutModal
        isOpen={isLoadoutOpen}
        onClose={() => setIsLoadoutOpen(false)}
      />

      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
      />
    </div>
  );
}
