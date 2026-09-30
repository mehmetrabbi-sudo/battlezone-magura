import React, { useState, useEffect } from 'react';
import { X, Award, Target, Trophy, CheckCircle2, Lock, Play, RotateCcw, MapPin, ChevronRight, ShieldAlert } from 'lucide-react';
import { sounds } from '../utils/audio';
import { MapId } from '../types';

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMission: (missionId: string, mapId: MapId) => void;
}

interface TacticalMission {
  id: string;
  number: number;
  name: string;
  nameBn: string;
  mapId: MapId;
  mapName: string;
  badgeColor: string;
  description: string;
  reward: number;
  rewardXp: number;
  objectives: string[];
}

const TACTICAL_MISSIONS: TacticalMission[] = [
  {
    id: 'mission_1_factory_assault',
    number: 1,
    name: 'Factory Assault',
    nameBn: 'ফ্যাক্টরি অ্যাসল্ট',
    mapId: 'magura_river_port',
    mapName: 'Magura River Port',
    badgeColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40',
    description: 'Infiltrate the river port industrial zone, secure the Agro-Industrial factory, clear warehouse hostiles, and reach extraction.',
    reward: 1000,
    rewardXp: 150,
    objectives: [
      'Reach the Factory area',
      'Secure the Factory (eliminate hostiles)',
      'Clear the Warehouse',
      'Reach extraction point'
    ]
  },
  {
    id: 'mission_2_river_strike',
    number: 2,
    name: 'River Strike',
    nameBn: 'রিভার স্ট্রাইক',
    mapId: 'magura_river_port',
    mapName: 'Magura River Port',
    badgeColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40',
    description: 'Assault the Nabaganga riverfront, secure the cargo ghat and boat piers, eliminate hostile forces, and hold the bridge checkpoint.',
    reward: 1500,
    rewardXp: 200,
    objectives: [
      'Reach the River Ghat',
      'Secure the Riverside area',
      'Eliminate required hostiles',
      'Secure the Bridge checkpoint',
      'Reach extraction point'
    ]
  },
  {
    id: 'mission_3_abalpur_operation',
    number: 3,
    name: 'Abalpur Operation',
    nameBn: 'আবালপুর অপারেশন',
    mapId: 'abalpur_village',
    mapName: 'Abalpur Village',
    badgeColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
    description: 'Deploy into rural Abalpur Village, neutralize insurgent militia across the village crossroad, and secure the medical clinic.',
    reward: 2000,
    rewardXp: 250,
    objectives: [
      'Enter Abalpur Village',
      'Secure the village area',
      'Clear hostile positions',
      'Secure the main target area',
      'Reach extraction point'
    ]
  },
  {
    id: 'mission_4_magura_town_operation',
    number: 4,
    name: 'Magura Town Operation',
    nameBn: 'মাগুরা টাউন অপারেশন',
    mapId: 'magura_town',
    mapName: 'Magura Town',
    badgeColor: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
    description: 'Counter-terror operation in urban Magura Town. Secure the Vaynar Mor roundabout, advance to Police Lines, and eliminate commanders.',
    reward: 3000,
    rewardXp: 350,
    objectives: [
      'Reach Vaynar Mor',
      'Secure the area',
      'Move toward Police Lines',
      'Eliminate required hostiles',
      'Reach extraction point'
    ]
  }
];

export const MissionsModal: React.FC<MissionsModalProps> = ({ isOpen, onClose, onStartMission }) => {
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('battlezone_missions_progression_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setCompletedMissions(parsed);
          }
        }
      } catch (e) {
        console.warn('Failed to load mission progress', e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getMissionStatus = (index: number, id: string): 'COMPLETED' | 'AVAILABLE' | 'LOCKED' => {
    if (completedMissions.includes(id)) return 'COMPLETED';
    if (index === 0) return 'AVAILABLE';
    const prevMission = TACTICAL_MISSIONS[index - 1];
    if (prevMission && completedMissions.includes(prevMission.id)) return 'AVAILABLE';
    return 'LOCKED';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-wider text-slate-100 uppercase">
                OPERATIONAL MISSIONS • মিশন ও লক্ষ্যসমূহ
              </h2>
              <span className="text-[9px] font-mono text-slate-400 block -mt-0.5">
                BANGLADESH COMBAT THEATER • CAMPAIGN PROGRESSION
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playHover();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-slate-300">
              Complete tactical mission objectives in sequence across Magura sectors to earn rewards and unlock next operations.
            </p>
            <div className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded shrink-0">
              {completedMissions.length} / {TACTICAL_MISSIONS.length} COMPLETED
            </div>
          </div>
          
          <div className="space-y-3">
            {TACTICAL_MISSIONS.map((mission, index) => {
              const status = getMissionStatus(index, mission.id);
              const isLocked = status === 'LOCKED';
              const isCompleted = status === 'COMPLETED';

              return (
                <div 
                  key={mission.id}
                  className={`p-4 rounded-xl border flex flex-col gap-2.5 transition-all ${
                    isCompleted 
                      ? 'bg-slate-950/80 border-emerald-500/30' 
                      : isLocked 
                      ? 'bg-slate-950/40 border-slate-800/50 opacity-60' 
                      : 'bg-slate-950/90 border-cyan-500/40 shadow-lg shadow-cyan-950/20'
                  }`}
                >
                  {/* Top Bar: Mission Number, Status & Map */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        MISSION 0{mission.number}
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-slate-100 uppercase tracking-wide">
                        {mission.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 hidden sm:inline">
                        • {mission.nameBn}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[8px] sm:text-[9px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${mission.badgeColor}`}>
                        <MapPin className="w-2.5 h-2.5" />
                        <span>{mission.mapName}</span>
                      </span>

                      {isCompleted ? (
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>COMPLETED</span>
                        </span>
                      ) : isLocked ? (
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>LOCKED</span>
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 animate-pulse">
                          AVAILABLE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {mission.description}
                  </p>

                  {/* Objectives Checklist Preview */}
                  <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800/80">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      TACTICAL OBJECTIVES SEQUENCE:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {mission.objectives.map((obj, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-1.5 text-[10px] text-slate-300">
                          <span className={`text-[9px] font-mono font-bold w-3.5 h-3.5 rounded flex items-center justify-center ${
                            isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {oIdx + 1}
                          </span>
                          <span className="truncate">{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Bar: Rewards & Launch Button */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>+৳{mission.reward}</span>
                      </div>
                      <div className="text-[10px] font-mono text-cyan-400 font-bold">
                        +{mission.rewardXp} XP
                      </div>
                    </div>

                    {isLocked ? (
                      <button
                        disabled
                        className="px-4 py-1.5 rounded-lg bg-slate-800/60 text-slate-500 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-not-allowed border border-slate-700/40"
                      >
                        <Lock className="w-3 h-3" />
                        <span>COMPLETE MISSION 0{mission.number - 1} FIRST</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          sounds.playSelect();
                          onStartMission(mission.id, mission.mapId);
                        }}
                        className={`px-5 py-2 rounded-lg font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                          isCompleted
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 hover:shadow-cyan-500/40'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>REPLAY MISSION</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>START MISSION</span>
                          </>
                        )}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={() => {
              if (window.confirm('Reset all mission campaign progression?')) {
                localStorage.removeItem('battlezone_missions_progression_v1');
                setCompletedMissions([]);
                sounds.playSelect();
              }
            }}
            className="text-[9px] font-mono text-slate-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>RESET PROGRESS</span>
          </button>
          <button
            onClick={() => {
              sounds.playHover();
              onClose();
            }}
            className="px-5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
