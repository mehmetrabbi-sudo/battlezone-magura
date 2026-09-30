import React, { useState } from 'react';
import { X, Briefcase, Sparkles, Shield, Tag, Check } from 'lucide-react';
import { sounds } from '../utils/audio';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<'skins' | 'outfits' | 'crates'>('skins');
  const [equippedSkin, setEquippedSkin] = useState<string>('camo_urban');

  if (!isOpen) return null;

  const skins = [
    { id: 'camo_urban', name: 'Urban Digital Slate', rarity: 'Rare', color: 'from-slate-700 to-slate-900', isOwned: true },
    { id: 'camo_magura', name: 'Magura River Moss', rarity: 'Epic', color: 'from-emerald-700 to-teal-900', isOwned: true },
    { id: 'camo_desert', name: 'Sundarban Tiger Gold', rarity: 'Legendary', color: 'from-amber-600 to-yellow-800', isOwned: true },
    { id: 'camo_midnight', name: 'Midnight SpecOps Black', rarity: 'Common', color: 'from-zinc-800 to-black', isOwned: true }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-black tracking-wider text-slate-100 uppercase">
              INVENTORY • ইনভেন্টরি
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

        {/* Categories Tab */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/80 text-xs font-bold">
          {[
            { id: 'skins', label: 'Weapon Camos (স্কিন)' },
            { id: 'outfits', label: 'Tactical Outfits' },
            { id: 'crates', label: 'Supply Crates (বক্স)' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                sounds.playSelect();
                setSelectedCategory(cat.id as any);
              }}
              className={`py-2.5 text-center transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-amber-400 border-b-2 border-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3 overflow-y-auto">
          {selectedCategory === 'skins' && (
            <div className="grid grid-cols-2 gap-3">
              {skins.map((skin) => {
                const isEquipped = equippedSkin === skin.id;
                return (
                  <div
                    key={skin.id}
                    onClick={() => {
                      sounds.playSelect();
                      setEquippedSkin(skin.id);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isEquipped
                        ? 'bg-slate-850 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-full h-16 rounded-lg bg-gradient-to-r ${skin.color} mb-2 flex items-center justify-center border border-white/10`}>
                      <span className="text-[10px] font-mono font-bold text-white/70 uppercase">
                        BD-08 CAMO
                      </span>
                    </div>

                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-black text-white">{skin.name}</h4>
                        <span className="text-[10px] text-amber-400 font-bold">{skin.rarity}</span>
                      </div>
                      {isEquipped && (
                        <span className="p-1 rounded bg-amber-500 text-slate-950">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedCategory === 'outfits' && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center py-8">
              <Shield className="w-10 h-10 text-amber-400 mx-auto opacity-70" />
              <h4 className="text-sm font-bold text-white">Magura Commando Uniform [Equipped]</h4>
              <p className="text-xs text-slate-400">Bangladesh Army Tactical Camouflage BDU Pattern</p>
            </div>
          )}

          {selectedCategory === 'crates' && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center py-8">
              <Sparkles className="w-10 h-10 text-sky-400 mx-auto opacity-70" />
              <h4 className="text-sm font-bold text-white">2x Magura Elite Airdrop Crates Available</h4>
              <p className="text-xs text-slate-400">Contains legendary assault rifle skins and tactical weapon charms.</p>
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
