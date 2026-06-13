"use client";

import { Eye, Clock } from "lucide-react";

interface ReflectionPoint {
  name: string;
  why: string;
  best_time: string;
  km_from_source: number;
  vibe: string;
}

interface SilentReflectionPointsProps {
  points: ReflectionPoint[];
}

export function SilentReflectionPoints({ points }: SilentReflectionPointsProps) {
  if (!points || points.length === 0) return null;

  return (
    <div className="bg-zinc-950/40 border border-zinc-900 rounded-[36px] p-6 md:p-8 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Tranquility & Peace</p>
          <h3 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
            🧘 Silent Reflection Points
          </h3>
        </div>
        <span className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-500 px-3 py-1 rounded-full font-bold">
          {points.length} Meditation Stops
        </span>
      </div>

      <div className="space-y-4">
        {points.map((point, idx) => (
          <div
            key={idx}
            className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 hover:border-zinc-800 transition-all flex flex-col md:flex-row justify-between gap-4 items-start md:items-center"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h4 className="font-bold text-base text-white">{point.name}</h4>
                <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-emerald-500 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  ✨ {point.vibe}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-semibold leading-relaxed max-w-2xl">
                {point.why}
              </p>
            </div>

            <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-bold uppercase tracking-wide shrink-0 border-t md:border-t-0 border-zinc-900 pt-3 md:pt-0 w-full md:w-auto">
              <div className="flex items-center gap-1">
                <Clock size={11} />
                <span>{point.best_time}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={11} />
                <span>KM {point.km_from_source}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
