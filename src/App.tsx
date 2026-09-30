import React, { useState, useEffect } from 'react';
import { GameModeId, MapId, PlayerProfile } from './types';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { LoadoutModal } from './components/LoadoutModal';
import { InventoryModal } from './components/InventoryModal';
import { ShopModal } from './components/ShopModal';
import { MissionsModal } from './components/MissionsModal';
import { MultiplayerModal } from './components/MultiplayerModal';
import { GameContainer } from './components/GameContainer';
import { sounds } from './utils/audio';
import { 
  Sliders, 
  User, 
  Play, 
  Users, 
  UserPlus, 
  Volume2, 
  VolumeX, 
  Flame, 
  Smartphone, 
  RotateCw,
  Sparkles,
  X,
  Maximize,
  MapPin,
  Target,
  ChevronRight,
  Trophy
} from 'lucide-react';

const INITIAL_PLAYER: PlayerProfile = {
  name: 'RABBI_01',
  title: 'BD-COMMANDO',
  level: 1,
  xp: 120,
  nextLevelXp: 500,
  rank: 'Corporal',
  kdRatio: 3.42,
  accuracy: 48,
  matchesPlayed: 12,
  wins: 4,
  kills: 38,
  cp: 4850,
  tokens: 12200
};

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<MapId>('magura_town');
  const [teamSize, setTeamSize] = useState<'SOLO' | 'DUO' | 'SQUAD'>('SOLO');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<GameModeId>('battle_royale');
  const [player, setPlayer] = useState<PlayerProfile>(INITIAL_PLAYER);

  // Responsive device orientation detection (portrait if height > width)
  const [isPortrait, setIsPortrait] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerHeight > window.innerWidth;
    }
    return false;
  });

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoadoutOpen, setIsLoadoutOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);
  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState(false);
  const [multiplayerSession, setMultiplayerSession] = useState<{
    roomId: string;
    playerId: string;
    isHost: boolean;
    playerSpawns: any;
    roomState: any;
  } | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Auto-dismiss HUD alert after 3 seconds
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const showToast = (msg: string) => {
    sounds.playSelect();
    setToastMessage(msg);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
  };

  // Listen for mission completion events from iframe
  useEffect(() => {
    const handleMsg = (event: MessageEvent) => {
      if (event.data && event.data.type === 'BATTLEZONE_MISSION_COMPLETED') {
        const { reward, rewardXp } = event.data;
        if (reward) {
          setPlayer(prev => ({
            ...prev,
            tokens: prev.tokens + reward,
            xp: prev.xp + (rewardXp || 100),
            wins: prev.wins + 1,
            matchesPlayed: prev.matchesPlayed + 1
          }));
          showToast(`🏆 মিশন সম্পন্ন! +৳${reward} ও +${rewardXp || 100} XP অর্জিত!`);
        }
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  const [matchSession, setMatchSession] = useState(1);

  // Direct Launch when pressing PLAY (Battle Royale mode)
  const handlePlayGame = () => {
    sounds.playLaunchGame();
    setSelectedMissionId(null);
    setMultiplayerSession(null);
    setGameMode('battle_royale');
    setMatchSession((prev) => prev + 1);
    setIsPlaying(true);
  };

  // Launch tactical campaign mission
  const handleStartMission = (missionId: string, mapId: MapId) => {
    sounds.playLaunchGame();
    setSelectedMapId(mapId);
    setSelectedMissionId(missionId);
    setMultiplayerSession(null);
    setGameMode('mission');
    setIsMissionsOpen(false);
    setMatchSession((prev) => prev + 1);
    setIsPlaying(true);
  };

  // Launch online multiplayer match (Step 3: Position + Rotation Sync)
  const handleStartMultiplayerMatch = (
    mapId: MapId,
    roomId: string,
    playerId: string,
    isHost: boolean,
    playerSpawns: any,
    roomState: any
  ) => {
    sounds.playLaunchGame();
    setSelectedMapId(mapId);
    setSelectedMissionId(null);
    setMultiplayerSession({
      roomId,
      playerId,
      isHost,
      playerSpawns,
      roomState
    });
    setGameMode('battle_royale');
    setIsMultiplayerOpen(false);
    setMatchSession((prev) => prev + 1);
    setIsPlaying(true);
  };

  const handleExitToLobby = () => {
    setIsPlaying(false);
    setSelectedMissionId(null);
    setMultiplayerSession(null);
    setGameMode('battle_royale');
  };

  const handleSelectMap = (mapId: MapId) => {
    sounds.playSelect();
    setSelectedMapId(mapId);
  };

  return (
    <div 
      id="battlezone-root-container"
      className="fixed inset-0 w-full h-full min-h-[100dvh] w-[100vw] h-[100dvh] bg-slate-950 overflow-hidden select-none font-sans"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      {/* ========================================================
          PORTRAIT BLOCKER: CLEAN MINIMAL "ROTATE DEVICE" SCREEN
          Shows ONLY when device is in portrait mode (width < height).
          ======================================================== */}
      {isPortrait ? (
        <div 
          id="portrait-rotate-prompt"
          className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950 text-slate-100 z-50 overflow-hidden"
          style={{
            backgroundImage: 'url(/battlezone_lobby_hero.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center center'
          }}
        >
          {/* Dark Glass Overlay */}
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-0" />

          <div className="relative z-10 max-w-xs flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Animated Device Rotation Graphic */}
            <div className="relative w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <Smartphone className="w-10 h-10 text-amber-400 animate-rotate-phone" />
              <RotateCw className="w-5 h-5 text-amber-300 absolute -bottom-1 -right-1 animate-spin" style={{ animationDuration: '4s' }} />
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 className="text-lg font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 font-mono">
                ROTATE DEVICE
              </h2>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Please rotate your phone to <span className="text-amber-400 font-bold">Landscape mode</span> for the tactical FPS experience.
              </p>
            </div>

            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen?.().catch(() => {});
                }
              }}
              className="mt-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <Maximize className="w-3.5 h-3.5" />
              <span>FULLSCREEN LANDSCAPE</span>
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================
            TRUE FULLSCREEN LANDSCAPE VIEWPORT
            Fills 100vw and 100dvh with NO artificial letterboxing or borders.
            ======================================================== */
        <div 
          id="battlezone-viewport-frame"
          className="relative w-full h-full overflow-hidden bg-slate-950 flex flex-col justify-between"
        >
          {/* Existing Persistent Gameplay Container */}
          <GameContainer
            mode={gameMode}
            map={selectedMapId}
            matchId={matchSession}
            missionId={selectedMissionId || undefined}
            isVisible={isPlaying}
            onExitToLobby={handleExitToLobby}
            multiplayerSession={multiplayerSession}
          />

          {/* ========================================================
              CLEAN PROFESSIONAL CINEMATIC MAIN LOBBY
              ======================================================== */}
          <div 
            id="lobby-screen-root"
            className={`absolute inset-0 w-full h-full overflow-hidden text-slate-100 flex flex-col justify-between select-none z-10 ${
              isPlaying ? 'hidden pointer-events-none' : 'flex'
            }`}
            style={{
              backgroundColor: '#020617'
            }}
          >
            {/* Background Ambient Layer: Seamless full-bleed atmosphere filling all aspect ratios */}
            <div 
              className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url(/battlezone_lobby_bg.jpg)',
                filter: 'brightness(0.65) saturate(0.85) blur(3px)',
                transform: 'scale(1.04)'
              }}
            />

            {/* Center Hero Character Showcase: 100% full-body, head to toe, sharp, correctly proportioned */}
            <div 
              className="absolute inset-0 pt-11 sm:pt-12 pb-16 sm:pb-20 flex items-center justify-center pointer-events-none z-15 overflow-hidden"
              style={{
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
                maskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)'
              }}
            >
              <img 
                src="/battlezone_lobby_hero.jpg" 
                alt="Battlezone Magura Operative"
                className="h-full w-auto max-w-full object-contain pointer-events-none select-none drop-shadow-[0_15px_35px_rgba(0,0,0,0.65)]"
              />
            </div>

            {/* Subtle perimeter vignette & ambient depth (kept behind hero at z-10 so face remains 100% bright and clear) */}
            <div 
              className="absolute inset-0 pointer-events-none z-10" 
              style={{
                background: 'radial-gradient(ellipse at center, transparent 65%, rgba(2, 6, 23, 0.45) 100%)'
              }}
            />
            <div className="absolute top-0 left-0 right-0 h-11 pointer-events-none bg-gradient-to-b from-slate-950/70 to-transparent z-10" />
            <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-slate-950/80 to-transparent z-10" />

            {/* In-Game Toast Alert */}
            {toastMessage && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.35)] backdrop-blur-md text-amber-300 text-[11px] font-mono font-bold tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{toastMessage}</span>
                  <button onClick={() => setToastMessage(null)} className="ml-1 text-slate-400 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================
                TOP NAVIGATION:
                BATTLEZONE MAGURA | HOME • PLAY • LOADOUT • SHOP | SFX • PROFILE • SETTINGS
                ======================================================== */}
            <header className="w-full h-11 sm:h-12 flex items-center justify-between px-3 sm:px-6 bg-slate-950/50 backdrop-blur-sm border-b border-slate-800/40 z-30 shrink-0 gap-2">
              {/* Top Left: BATTLEZONE MAGURA (Stacked or cleanly aligned) */}
              <div className="flex flex-col text-left shrink-0 leading-tight">
                <span className="text-[10px] sm:text-xs font-black tracking-widest text-slate-200 uppercase font-mono">
                  BATTLEZONE
                </span>
                <span className="text-[11px] sm:text-sm font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 uppercase font-mono">
                  MAGURA
                </span>
              </div>

              {/* Minimal Center Navigation: HOME • PLAY • LOADOUT • SHOP */}
              <nav className="flex items-center gap-1 sm:gap-3 shrink-0">
                <button
                  onClick={() => { sounds.playSelect(); setIsPlaying(false); }}
                  className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-amber-400 border-b-2 border-amber-400 cursor-pointer transition-all"
                >
                  HOME
                </button>
                <button
                  onClick={handlePlayGame}
                  onMouseEnter={() => sounds.playHover()}
                  className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-slate-300 hover:text-amber-300 cursor-pointer transition-all hover:bg-slate-900/40 rounded"
                >
                  PLAY
                </button>
                <button
                  onClick={() => { sounds.playOpenModal(); setIsMultiplayerOpen(true); }}
                  onMouseEnter={() => sounds.playHover()}
                  className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-emerald-400 hover:text-emerald-300 cursor-pointer transition-all hover:bg-emerald-950/40 border border-emerald-500/40 rounded flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                >
                  <Users className="w-3 h-3 text-emerald-400" />
                  <span>MULTIPLAYER</span>
                </button>
                <button
                  onClick={() => { sounds.playOpenModal(); setIsMissionsOpen(true); }}
                  onMouseEnter={() => sounds.playHover()}
                  className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-cyan-400 hover:text-cyan-300 cursor-pointer transition-all hover:bg-slate-900/40 rounded flex items-center gap-1"
                >
                  <Target className="w-3 h-3 text-cyan-400" />
                  <span>MISSIONS</span>
                </button>
                <button
                  onClick={() => { sounds.playOpenModal(); setIsLoadoutOpen(true); }}
                  onMouseEnter={() => sounds.playHover()}
                  className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-slate-300 hover:text-amber-300 cursor-pointer transition-all hover:bg-slate-900/40 rounded"
                >
                  LOADOUT
                </button>
                <button
                  onClick={() => { sounds.playOpenModal(); setIsShopOpen(true); }}
                  onMouseEnter={() => sounds.playHover()}
                  className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-slate-300 hover:text-amber-300 cursor-pointer transition-all hover:bg-slate-900/40 rounded"
                >
                  SHOP
                </button>
              </nav>

              {/* Right Side: SOUND ICON • PROFILE ICON • SETTINGS ICON */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* SFX Sound Icon */}
                <button
                  onClick={handleToggleSound}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-slate-900/70 hover:bg-slate-800 border border-slate-800/80 text-slate-300 hover:text-amber-400 cursor-pointer transition-colors shadow-sm"
                  title={soundEnabled ? 'Mute SFX' : 'Unmute SFX'}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />}
                </button>

                {/* Profile Icon */}
                <button
                  onClick={() => { sounds.playOpenModal(); setIsProfileOpen(true); }}
                  onMouseEnter={() => sounds.playHover()}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-slate-900/70 hover:bg-slate-800 border border-slate-800/80 text-slate-300 hover:text-amber-400 cursor-pointer transition-colors shadow-sm"
                  title="Profile"
                >
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {/* Settings Icon */}
                <button
                  onClick={() => { sounds.playOpenModal(); setIsSettingsOpen(true); }}
                  onMouseEnter={() => sounds.playHover()}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-slate-900/70 hover:bg-slate-800 border border-slate-800/80 text-slate-300 hover:text-amber-400 cursor-pointer transition-colors shadow-sm"
                  title="Settings"
                >
                  <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </header>

            {/* ========================================================
                MID SECTION:
                - LEFT: ONE SMALL CINEMATIC UPDATE/NEWS CARD
                - CENTER: HERO CHARACTER (OPEN & VISIBLE)
                - RIGHT: PROFILE CARD (RABBI_01 LV. 01) + COMPACT SQUAD PANEL
                ======================================================== */}
            <div className="w-full flex-1 flex justify-between items-center px-3 sm:px-6 py-1 pointer-events-none z-20 min-h-0 overflow-hidden">
              
              {/* LEFT: ONE SMALL CINEMATIC UPDATE/NEWS CARD & MISSION ENTRY */}
              <div className="w-36 sm:w-48 md:w-56 pointer-events-auto self-start pt-2 flex flex-col gap-2">
                <div 
                  onClick={() => showToast('MAGURA EXPANSION ACTIVE • 10 ENEMIES & MEDKITS INCLUDED')}
                  className="p-2.5 sm:p-3 rounded-xl bg-slate-950/60 backdrop-blur-md border border-slate-800/90 hover:border-amber-500/50 transition-all cursor-pointer group shadow-xl"
                >
                  <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400 mb-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>NEW UPDATE</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-black tracking-wide text-slate-100 group-hover:text-amber-300 transition-colors uppercase leading-tight truncate">
                    BATTLEZONE MAGURA
                  </h3>
                  <p className="text-[8px] sm:text-[9px] text-amber-300/90 font-mono mt-1 leading-tight font-semibold">
                    BIGGER MAPS • MORE ACTION
                  </p>
                </div>

                {/* MISSION ENTRY CARD */}
                <div 
                  onClick={() => { sounds.playOpenModal(); setIsMissionsOpen(true); }}
                  className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-cyan-950/70 via-slate-950/80 to-slate-950/90 backdrop-blur-md border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer group shadow-xl flex items-center justify-between"
                  title="Operational Missions"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shrink-0">
                      <Target className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] sm:text-xs font-black tracking-wider text-slate-100 uppercase group-hover:text-cyan-300 transition-colors">
                          MISSION
                        </span>
                        <span className="text-[7px] font-mono px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                          NEW
                        </span>
                      </div>
                      <span className="text-[7px] sm:text-[8px] font-mono text-cyan-400/80 block mt-0.5 truncate">
                        CAMPAIGN OPS
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>
              </div>

              {/* ========================================================
                  CENTER: UNOBSTRUCTED CINEMATIC CHARACTER SHOWCASE
                  Full body hero character: Head, face, torso, arms, weapon, legs, boots.
                  Positioned with generous headroom below top navigation bar.
                  Sharp, correctly proportioned, no stretching, no glitches.
                  ======================================================== */}
              <div className="flex-1 min-h-0 pointer-events-none" />

              {/* RIGHT: PROFILE CARD + COMPACT SQUAD PANEL */}
              <div className="w-36 sm:w-44 md:w-48 flex flex-col gap-2 pointer-events-auto shrink-0 self-start pt-2">
                {/* Profile Card: RABBI_01 LV. 01 */}
                <div 
                  onClick={() => { sounds.playOpenModal(); setIsProfileOpen(true); }}
                  onMouseEnter={() => sounds.playHover()}
                  className="p-2 sm:p-2.5 rounded-xl bg-slate-950/60 backdrop-blur-md border border-slate-800/90 hover:border-amber-500/50 transition-all cursor-pointer group shadow-xl flex items-center justify-between"
                  title="Player Profile"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-xs shadow-inner shrink-0">
                      R
                    </div>
                    <div className="flex flex-col text-left truncate">
                      <span className="text-[10px] sm:text-xs font-black tracking-wider text-slate-100 group-hover:text-amber-400 transition-colors uppercase leading-none truncate">
                        {INITIAL_PLAYER.name}
                      </span>
                      <span className="text-[8px] sm:text-[9px] font-mono text-amber-400 font-bold mt-1 leading-none">
                        LV. 0{INITIAL_PLAYER.level}
                      </span>
                    </div>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0 ml-1" />
                </div>

                {/* Compact SQUAD Panel */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/60 backdrop-blur-md border border-slate-800/90 shadow-xl flex flex-col gap-1.5">
                  <div className="text-[8px] sm:text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Users className="w-3 h-3 text-amber-400" />
                      <span>SQUAD</span>
                    </span>
                    <button
                      onClick={() => { sounds.playOpenModal(); setIsMultiplayerOpen(true); }}
                      className="text-[7px] sm:text-[8px] text-amber-400 hover:text-amber-300 font-bold uppercase cursor-pointer"
                    >
                      + INVITE
                    </button>
                  </div>

                  {/* Slot 1: Host / You */}
                  <div className="px-2 py-1 rounded-lg bg-slate-900/80 border border-amber-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <div className="w-4 h-4 rounded bg-amber-500 flex items-center justify-center text-slate-950 font-black text-[8px] shrink-0">
                        1
                      </div>
                      <span className="text-[9px] font-bold text-slate-200 uppercase truncate">
                        {INITIAL_PLAYER.name}
                      </span>
                    </div>
                    <span className="text-[7px] font-mono text-amber-400 font-bold">READY</span>
                  </div>

                  {/* Slot 2: Empty / Invite */}
                  <button
                    onClick={() => { sounds.playOpenModal(); setIsMultiplayerOpen(true); }}
                    onMouseEnter={() => sounds.playHover()}
                    className="px-2 py-1 rounded-lg bg-slate-950/40 border border-dashed border-slate-700 hover:border-amber-400/80 hover:bg-slate-900/50 text-slate-400 hover:text-amber-300 flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded border border-dashed border-slate-600 group-hover:border-amber-400 flex items-center justify-center shrink-0">
                        <UserPlus className="w-2.5 h-2.5 text-slate-400 group-hover:text-amber-300" />
                      </div>
                      <span className="text-[8px] font-mono font-bold tracking-wider uppercase">+ INVITE</span>
                    </div>
                    <span className="text-[7px] font-mono text-slate-500 group-hover:text-amber-400">EMPTY</span>
                  </button>

                  {/* Slot 3: Empty / Invite */}
                  <button
                    onClick={() => { sounds.playOpenModal(); setIsMultiplayerOpen(true); }}
                    onMouseEnter={() => sounds.playHover()}
                    className="px-2 py-1 rounded-lg bg-slate-950/40 border border-dashed border-slate-700 hover:border-amber-400/80 hover:bg-slate-900/50 text-slate-400 hover:text-amber-300 flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded border border-dashed border-slate-600 group-hover:border-amber-400 flex items-center justify-center shrink-0">
                        <UserPlus className="w-2.5 h-2.5 text-slate-400 group-hover:text-amber-300" />
                      </div>
                      <span className="text-[8px] font-mono font-bold tracking-wider uppercase">+ INVITE</span>
                    </div>
                    <span className="text-[7px] font-mono text-slate-500 group-hover:text-amber-400">EMPTY</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ========================================================
                BOTTOM SECTION:
                - Bottom Left: Clean match panel [ SOLO ] + [ PLAY ]
                - Bottom Center: Small contextual game text only
                - Bottom Right: Quick Map Selector
                ======================================================== */}
            <footer className="w-full flex items-end justify-between px-3 sm:px-6 pb-3 pt-1 z-30 shrink-0 gap-3 overflow-hidden">
              
              {/* BOTTOM LEFT: MATCH PANEL [ SOLO ] + [ PLAY ] */}
              <div className="flex flex-col gap-1.5 shrink-0">
                {/* Team size toggle */}
                <div className="flex items-center gap-1">
                  {(['SOLO', 'DUO', 'SQUAD'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => { sounds.playSelect(); setTeamSize(size); }}
                      className={`px-2.5 py-0.5 rounded text-[8px] sm:text-[9px] font-mono font-black tracking-wider transition-all cursor-pointer ${
                        teamSize === size
                          ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                          : 'bg-slate-950/70 hover:bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {/* PLAY: LARGEST BUTTON */}
                <button
                  id="btn-main-play"
                  onClick={handlePlayGame}
                  onMouseEnter={() => sounds.playHover()}
                  className="w-44 sm:w-52 md:w-60 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:via-yellow-300 hover:to-amber-500 active:scale-95 text-slate-950 font-black tracking-widest uppercase shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:shadow-[0_0_35px_rgba(245,158,11,0.8)] transition-all cursor-pointer border border-amber-200/50 flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                  
                  <Play className="w-5 h-5 fill-slate-950 text-slate-950 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="text-base sm:text-lg font-black tracking-widest leading-none">
                    PLAY
                  </span>
                </button>
              </div>

              {/* BOTTOM CENTER: SMALL CONTEXTUAL GAME TEXT ONLY */}
              <div className="hidden sm:flex flex-col items-center justify-end pb-1 text-center">
                <span className="text-[9px] sm:text-[10px] font-mono text-slate-400/80 tracking-widest uppercase">
                  BATTLEZONE MAGURA • TACTICAL FPS • BANGLADESH
                </span>
                <span className={`text-[8px] font-mono tracking-wider ${
                  selectedMapId === 'magura_river_port' || selectedMapId === 'magura-river-port'
                    ? 'text-cyan-400/90'
                    : selectedMapId === 'abalpur_village'
                    ? 'text-emerald-400/90'
                    : 'text-amber-500/70'
                }`}>
                  {selectedMapId === 'magura_river_port' || selectedMapId === 'magura-river-port'
                    ? 'SECTOR 03 • MAGURA RIVER PORT & INDUSTRIAL ZONE • 10 HOSTILE BOTS'
                    : selectedMapId === 'abalpur_village'
                    ? 'SECTOR 02 • ABALPUR VILLAGE & RURAL GHAT • 10 HOSTILE BOTS'
                    : 'SECTOR 01 • SADAR MORE & BRIDGE • 10 HOSTILE BOTS'}
                </span>
              </div>

              {/* BOTTOM RIGHT: QUICK MAP SELECTOR */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleSelectMap('magura_town')}
                  onMouseEnter={() => sounds.playHover()}
                  className={`px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer backdrop-blur-md ${
                    selectedMapId === 'magura_town'
                      ? 'bg-slate-900/90 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)] ring-1 ring-amber-500/50'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <MapPin className={`w-2.5 h-2.5 ${selectedMapId === 'magura_town' ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className="text-[8px] sm:text-[9px] font-black text-slate-100 uppercase leading-none">MAGURA</span>
                  </div>
                  <span className="text-[6px] sm:text-[7px] font-mono text-slate-400 block mt-0.5 leading-none">TOWN (MAP 1)</span>
                </button>

                <button
                  onClick={() => handleSelectMap('abalpur_village')}
                  onMouseEnter={() => sounds.playHover()}
                  className={`px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer backdrop-blur-md ${
                    selectedMapId === 'abalpur_village'
                      ? 'bg-slate-900/90 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/50'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <MapPin className={`w-2.5 h-2.5 ${selectedMapId === 'abalpur_village' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="text-[8px] sm:text-[9px] font-black text-slate-100 uppercase leading-none">ABALPUR</span>
                  </div>
                  <span className="text-[6px] sm:text-[7px] font-mono text-slate-400 block mt-0.5 leading-none">VILLAGE (MAP 2)</span>
                </button>

                <button
                  onClick={() => handleSelectMap('magura_river_port')}
                  onMouseEnter={() => sounds.playHover()}
                  className={`px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer backdrop-blur-md ${
                    selectedMapId === 'magura_river_port' || selectedMapId === 'magura-river-port'
                      ? 'bg-slate-900/90 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500/50'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <MapPin className={`w-2.5 h-2.5 ${selectedMapId === 'magura_river_port' || selectedMapId === 'magura-river-port' ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="text-[8px] sm:text-[9px] font-black text-slate-100 uppercase leading-none">RIVER PORT</span>
                  </div>
                  <span className="text-[6px] sm:text-[7px] font-mono text-slate-400 block mt-0.5 leading-none">INDUSTRIAL (MAP 3)</span>
                </button>
              </div>

            </footer>
          </div>
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
        player={player}
      />

      <LoadoutModal
        isOpen={isLoadoutOpen}
        onClose={() => setIsLoadoutOpen(false)}
      />

      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
      />

      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        playerTokens={player.tokens}
      />

      <MissionsModal
        isOpen={isMissionsOpen}
        onClose={() => setIsMissionsOpen(false)}
        onStartMission={handleStartMission}
      />

      <MultiplayerModal
        isOpen={isMultiplayerOpen}
        onClose={() => setIsMultiplayerOpen(false)}
        playerName={player.name}
        onStartMultiplayerMatch={handleStartMultiplayerMatch}
      />
    </div>
  );
}
