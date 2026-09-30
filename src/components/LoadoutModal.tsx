import React, { useState } from 'react';
import { X, Crosshair, Shield, Zap, Target, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/audio';

interface LoadoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoadoutModal: React.FC<LoadoutModalProps> = ({ isOpen, onClose }) => {
  const [activeSlot, setActiveSlot] = useState<'primary' | 'secondary' | 'tactical' | 'armor'>('primary');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-black tracking-wider text-slate-100 uppercase">
              TACTICAL LOADOUT • অস্ত্রাগার
            </h2>
          </div>
          <button
            onClick={() => {
              sounds.playHover();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loadout Slots Nav */}
        <div className="grid grid-cols-4 border-b border-slate-800 bg-slate-950/80 text-xs font-bold">
          {[
            { id: 'primary', label: 'Primary Weapon' },
            { id: 'secondary', label: 'Secondary Sidearm' },
            { id: 'tactical', label: 'Tactical Gear' },
            { id: 'armor', label: 'Body Armor' }
          ].map((slot) => (
            <button
              key={slot.id}
              onClick={() => {
                sounds.playSelect();
                setActiveSlot(slot.id as any);
              }}
              className={`py-2.5 text-center transition-all ${
                activeSlot === slot.id
                  ? 'bg-slate-900 text-amber-400 border-b-2 border-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {slot.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {activeSlot === 'primary' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-amber-500/30">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase">
                      Assault Rifle • 5.56×45MM
                    </span>
                    <h3 className="text-lg font-black text-white mt-1">BD-08 TACTICAL RIFLE</h3>
                    <p className="text-xs text-slate-400">Bangladesh Army Standard Issue Assault Rifle</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> EQUIPPED
                  </span>
                </div>

                {/* Weapon Stats Bars */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                      <span>DAMAGE</span>
                      <span className="text-amber-400 font-mono">35 HP</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: '70%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                      <span>FIRE RATE</span>
                      <span className="text-amber-400 font-mono">600 RPM</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: '75%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                      <span>ACCURACY</span>
                      <span className="text-amber-400 font-mono">82%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-400" style={{ width: '82%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                      <span>MAGAZINE</span>
                      <span className="text-amber-400 font-mono">30 / 120</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: '85%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Mounted Attachments (মাউন্টেড এক্সেসরিজ)
                </h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    <span className="text-[10px] text-slate-500 block">OPTICS</span>
                    <span className="font-bold text-amber-300">Holo Sight 1.5x</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    <span className="text-[10px] text-slate-500 block">MUZZLE</span>
                    <span className="font-bold text-amber-300">Flash Compensator</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    <span className="text-[10px] text-slate-500 block">MAGAZINE</span>
                    <span className="font-bold text-amber-300">Extended 30R Mag</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSlot === 'secondary' && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 uppercase">
                Semi-Auto 9×19MM Sidearm
              </span>
              <h3 className="text-base font-bold text-white">Magura SpecOps 9MM Pistol</h3>
              <p className="text-xs text-slate-400">High mobility, quick draw sidearm with 15-round clip.</p>
            </div>
          )}

          {activeSlot === 'tactical' && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase">
                Deployable Tactical
              </span>
              <h3 className="text-base font-bold text-white">M18 High-Density Smoke Canister</h3>
              <p className="text-xs text-slate-400">Instant visual concealment for bridge and street crossings in Magura.</p>
            </div>
          )}

          {activeSlot === 'armor' && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase">
                Ballistic Protection
              </span>
              <h3 className="text-base font-bold text-white">Level 3 Kevlar Tactical Vest</h3>
              <p className="text-xs text-slate-400">Absorbs 45% incoming projectile kinetic damage with lightweight ceramic plates.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sounds.playHover();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
