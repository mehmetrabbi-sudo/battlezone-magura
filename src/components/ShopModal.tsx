import React, { useState } from 'react';
import { X, Sparkles, Tag, Shield, CheckCircle2, ShoppingBag } from 'lucide-react';
import { sounds } from '../utils/audio';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerTokens: number;
}

export const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose, playerTokens }) => {
  const [activeTab, setActiveTab] = useState<'weapon_camos' | 'apparel' | 'supply_crates'>('weapon_camos');
  const [purchaseStatus, setPurchaseStatus] = useState<Record<string, boolean>>({
    'camo_urban': true,
    'camo_magura': true,
  });

  if (!isOpen) return null;

  const items = {
    weapon_camos: [
      { id: 'camo_desert', name: 'Sundarban Tiger Gold', rarity: 'Legendary', price: 12000, color: 'from-amber-600 to-yellow-800', desc: 'Premium golden stripes camouflage inspired by Bengal Tigers.' },
      { id: 'camo_midnight', name: 'Midnight SpecOps Black', rarity: 'Rare', price: 4500, color: 'from-zinc-800 to-black', desc: 'Matte black anti-reflective tactical coating for nocturnal urban combat.' },
      { id: 'camo_neon', name: 'Dhaka Cyberpunk Neon', rarity: 'Epic', price: 8500, color: 'from-fuchsia-600 to-violet-900', desc: 'Synthesized digital neon alloy skin featuring retro Dhaka cyber styling.' },
    ],
    apparel: [
      { id: 'apparel_balaclava', name: 'Ghost Commando Balaclava', rarity: 'Rare', price: 3000, color: 'from-slate-800 to-zinc-900', desc: 'Elite lightweight Kevlar balaclava with skull imprint ventilation.' },
      { id: 'apparel_vest_camo', name: 'Digital Forest Plate Carrier', rarity: 'Epic', price: 6000, color: 'from-green-800 to-emerald-950', desc: 'Advanced modular plate carrier in high-density digital foliage camouflage.' },
    ],
    supply_crates: [
      { id: 'crate_gold', name: 'Magura Gold Supply Crate', rarity: 'Legendary', price: 5000, color: 'from-yellow-500 to-amber-700', desc: 'Contains guaranteed Epic or Legendary weapon finishes and custom keychains.' },
      { id: 'crate_tactical', name: 'BD Vanguard Ammo Crate', rarity: 'Epic', price: 2500, color: 'from-blue-600 to-slate-800', desc: 'Supplies random combat outfits, tactical gas masks, and XP boosters.' }
    ]
  };

  const handlePurchase = (id: string, price: number) => {
    if (purchaseStatus[id]) {
      sounds.playSelect();
      return;
    }
    if (playerTokens >= price) {
      sounds.playLaunchGame();
      setPurchaseStatus(prev => ({ ...prev, [id]: true }));
      alert(`Success! Unlocked: ${id.replace(/_/g, ' ').toUpperCase()}`);
    } else {
      sounds.playHover();
      alert(`Insufficient funds! Need ${price} tokens. Play games to earn tokens!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-black tracking-wider text-slate-100 uppercase">
              TACTICAL SHOP • অস্ত্রাগার ও স্কিন স্টোর
            </h2>
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

        {/* Currency summary strip */}
        <div className="bg-slate-950/40 border-b border-slate-800/80 px-5 py-2.5 flex justify-between items-center text-xs">
          <span className="text-slate-400">Earn tokens in Battle Royale or Bot Matches to unlock legendary items.</span>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 font-mono font-bold">
            <span className="font-serif text-sm">৳</span>
            <span>{playerTokens.toLocaleString()} TOKENS</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/80 text-xs font-bold">
          {[
            { id: 'weapon_camos', label: 'Weapon Camos (স্কিন)' },
            { id: 'apparel', label: 'Combat Gear (পোশাক)' },
            { id: 'supply_crates', label: 'Supply Crates (বক্স)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playSelect();
                setActiveTab(tab.id as any);
              }}
              className={`py-3 text-center transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-amber-400 border-b-2 border-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content list */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items[activeTab].map((item) => {
              const isOwned = purchaseStatus[item.id];
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Visual box */}
                    <div className={`w-full h-20 rounded-lg bg-gradient-to-br ${item.color} mb-3 flex flex-col items-center justify-center border border-white/5 relative overflow-hidden`}>
                      <div className="absolute top-1 left-1.5 px-1.5 py-0.2 rounded bg-black/50 text-[7px] font-mono font-black tracking-wider text-amber-400 border border-amber-500/20 uppercase">
                        {item.rarity}
                      </div>
                      <span className="text-[11px] font-mono font-black text-white/80 uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {item.name.split(' ')[0]} SPECIAL
                      </span>
                    </div>

                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <h4 className="text-xs font-black text-slate-100">{item.name}</h4>
                      <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                        item.rarity === 'Legendary' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        item.rarity === 'Epic' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' :
                        'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      }`}>
                        {item.rarity}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-normal mb-3">
                      {item.desc}
                    </p>
                  </div>

                  {/* Purchase/Equip Button */}
                  <button
                    onClick={() => handlePurchase(item.id, item.price)}
                    className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isOwned
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/20 shadow-inner'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black'
                    }`}
                  >
                    {isOwned ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>UNLOCKED & EQUIPPED</span>
                      </>
                    ) : (
                      <>
                        <Tag className="w-3.5 h-3.5" />
                        <span>UNLOCK FOR ৳{item.price.toLocaleString()}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sounds.playHover();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
