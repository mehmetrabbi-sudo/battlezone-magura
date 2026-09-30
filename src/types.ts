export type GameModeId = 'battle_royale' | 'clash_match' | 'bot_match' | 'free_roam';

export type MapId = 'magura_town' | 'abalpur_village';

export interface GameMap {
  id: MapId;
  title: string;
  nameBn: string;
  subtitle: string;
  tag: string;
  description: string;
  badgeColor: string;
  features: string[];
}

export interface GameMode {
  id: GameModeId;
  title: string;
  tag: string;
  subtitle: string;
  mapName: string;
  players: string;
  iconName: string;
  bgGradient: string;
  badgeColor: string;
}

export interface PlayerProfile {
  name: string;
  title: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  rank: string;
  kdRatio: number;
  accuracy: number;
  matchesPlayed: number;
  wins: number;
  kills: number;
  cp: number;
  tokens: number;
}
