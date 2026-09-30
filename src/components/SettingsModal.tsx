import React, { useState } from 'react';
import { X, Sliders, Volume2, Monitor, Crosshair, Check } from 'lucide-react';
import { sounds } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [sensitivity, setSensitivity] = useState(3.5);
  const [masterVolume, setMasterVolume] = useState(85);
  const [sfxVolume, setSfxVolume] = useState(90);
  const [graphicsTier, setGraphicsTier] = useState<'Low' | 'Medium' | 'High'>('High');
  const [crosshairColor, setCrosshairColor] = useState('#38bdf8');
  const [showFps, setShowFps] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-black tracking-wider text-slate-100 uppercase">
              GAME SETTINGS • সেটিংস
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

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Controls Sensitivity */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                ক্যামেরা সংবেদনশীলতা (Look Sensitivity)
              </span>
              <span className="font-mono text-amber-400 font-black">{sensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="7.0"
              step="0.5"
              value={sensitivity}
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Slow</span>
              <span>Default</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="space-y-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Volume2 className="w-3.5 h-3.5 text-sky-400" />
              শব্দ ও ইফেক্ট (Audio Settings)
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Master Volume</span>
                <span className="font-mono text-sky-400">{masterVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseInt(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Gunfire & SFX</span>
                <span className="font-mono text-sky-400">{sfxVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sfxVolume}
                onChange={(e) => setSfxVolume(parseInt(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Graphics Tier */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Monitor className="w-3.5 h-3.5 text-emerald-400" />
              গ্রাফিক্স কোয়ালিটি (Graphics Quality)
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['Low', 'Medium', 'High'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => {
                    sounds.playSelect();
                    setGraphicsTier(tier);
                  }}
                  className={`py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                    graphicsTier === tier
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* HUD Crosshair Color */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 font-bold">
            <span>ক্রসহায়ার কালার (Crosshair Reticle)</span>
            <div className="flex items-center gap-2">
              {['#38bdf8', '#22c55e', '#ef4444', '#f59e0b', '#ffffff'].map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    sounds.playSelect();
                    setCrosshairColor(color);
                  }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    crosshairColor === color ? 'scale-110 border-white ring-2 ring-amber-400' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sounds.playSelect();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors"
          >
            Apply & Save
          </button>
        </div>
      </div>
    </div>
  );
};
