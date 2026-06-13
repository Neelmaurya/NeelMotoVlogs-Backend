"use client";

import { Leaf, RefreshCw, Handshake, Globe, Award } from "lucide-react";

interface EcoTip {
  category: string;
  tip: string;
  impact: string;
}

interface SustainableTipsProps {
  tips: EcoTip[];
}

const CATEGORY_ICONS: Record<string, any> = {
  Fuel: Leaf,
  Waste: RefreshCw,
  "Local Economy": Handshake,
  Wildlife: Globe,
  Water: RefreshCw,
  Culture: Handshake,
};

const CATEGORY_COLORS: Record<string, string> = {
  Fuel: "text-emerald-500 bg-emerald-950/40 border-emerald-900/30",
  Waste: "text-cyan-500 bg-cyan-950/40 border-cyan-900/30",
  "Local Economy": "text-orange-500 bg-orange-950/40 border-orange-900/30",
  Wildlife: "text-amber-500 bg-amber-950/40 border-amber-900/30",
  Water: "text-blue-500 bg-blue-950/40 border-blue-900/30",
};

export function SustainableTips({ tips }: SustainableTipsProps) {
  if (!tips || tips.length === 0) return null;

  return (
    <div className="bg-zinc-950/40 border border-zinc-900 rounded-[36px] p-6 md:p-8 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Eco-Conscious Exploration</p>
          <h3 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
            🌿 Sustainable Travel Tips
          </h3>
        </div>
        <span className="text-[9px] bg-emerald-950/30 border border-emerald-900/30 text-emerald-500 px-3 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1">
          <Award size={10} /> Carbon Mindful
        </span>
      </div>

      <div className="space-y-4.5">
        {tips.map((tip, idx) => {
          const Icon = CATEGORY_ICONS[tip.category] || Leaf;
          const colorClass = CATEGORY_COLORS[tip.category] || "text-emerald-500 bg-emerald-950/40 border-emerald-900/30";

          return (
            <div
              key={idx}
              className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 hover:border-zinc-800 transition-colors flex gap-4 items-start"
            >
              <div className={`p-2.5 border rounded-2xl shrink-0 ${colorClass}`}>
                <Icon size={16} />
              </div>
              <div className="space-y-1">
                <span className={`text-[9px] border px-2 py-0.5 rounded-full font-black uppercase tracking-wider inline-block ${colorClass}`}>
                  {tip.category}
                </span>
                <p className="text-sm font-bold text-white leading-snug pt-1">
                  {tip.tip}
                </p>
                <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                  <span className="text-emerald-500/80 font-bold uppercase tracking-wider text-[9px] mr-1 block sm:inline">Impact:</span>
                  {tip.impact}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
