"use client";

import { Camera, Compass, Award } from "lucide-react";

interface PhotoSpot {
  name: string;
  type: string;
  best_time: string;
  km_from_source: number;
  gear_tips?: string;
  what_to_capture: string;
  instagram_worthy: boolean;
}

interface PhotographySpotsProps {
  spots: PhotoSpot[];
}

const TYPE_EMOJIS: Record<string, string> = {
  Sunrise: "🌅",
  Sunset: "🌇",
  Landscape: "🏔️",
  Architecture: "🏛️",
  Wildlife: "🦅",
  Nightsky: "🌌",
};

export function PhotographySpots({ spots }: PhotographySpotsProps) {
  if (!spots || spots.length === 0) return null;

  return (
    <div className="bg-zinc-950/40 border border-zinc-900 rounded-[36px] p-6 md:p-8 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Scenic Travel Photography</p>
          <h3 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
            <Camera className="text-orange-500" size={20} /> Photography Highlights
          </h3>
        </div>
        <span className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-500 px-3 py-1 rounded-full font-bold">
          {spots.length} Vantage Points
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {spots.map((spot, idx) => {
          const emoji = TYPE_EMOJIS[spot.type] || "📸";
          return (
            <div
              key={idx}
              className="bg-zinc-950 border border-zinc-900 hover:border-orange-600/30 transition-all rounded-3xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl shrink-0">{emoji}</span>
                    <div>
                      <h4 className="font-bold text-sm text-white leading-snug">{spot.name}</h4>
                      <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1 inline-block">
                        {spot.type}
                      </span>
                    </div>
                  </div>
                  {spot.instagram_worthy && (
                    <span className="flex items-center gap-1 text-[9px] bg-pink-950/40 border border-pink-900/30 text-pink-400 px-2.5 py-1 rounded-full font-black uppercase tracking-wider shrink-0">
                      <Award size={10} /> Insta-Worthy
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 font-semibold leading-relaxed mb-4">
                  {spot.what_to_capture}
                </p>
              </div>

              <div className="space-y-2 border-t border-zinc-900/50 pt-3">
                <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wide">
                  <span>⏰ {spot.best_time}</span>
                  <span>📍 {spot.km_from_source} KM from source</span>
                </div>
                {spot.gear_tips && (
                  <div className="flex items-center gap-1.5 text-[10px] text-orange-500/80 font-bold leading-normal pt-1">
                    <Compass size={11} className="shrink-0" />
                    <span>Gear: {spot.gear_tips}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
