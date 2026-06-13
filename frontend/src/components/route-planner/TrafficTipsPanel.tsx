"use client";

import { Clock, AlertTriangle, Calendar, Navigation } from "lucide-react";

interface TrafficTipsProps {
  tips: {
    source_city_exit: string;
    destination_entry: string;
    avoid_times: string[];
    best_travel_days: string[];
    toll_rush_hours: string;
    seasonal_congestion: string;
  };
}

export function TrafficTipsPanel({ tips }: TrafficTipsProps) {
  if (!tips) return null;

  return (
    <div className="bg-zinc-950/60 border border-zinc-900 rounded-[32px] p-6 shadow-2xl backdrop-blur-xl hover:border-zinc-800 transition-all flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            Traffic & Congestion Advisory
          </p>
          <span className="text-xl">🚦</span>
        </div>

        <div className="space-y-4">
          {/* Depart/Arrival Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-zinc-900/50 rounded-2xl border border-zinc-900">
              <div className="flex items-center gap-1.5 mb-1.5 text-orange-500">
                <Navigation size={13} className="rotate-45" />
                <span className="text-[9px] font-black uppercase tracking-widest">City Exit</span>
              </div>
              <p className="text-xs text-white font-bold">{tips.source_city_exit}</p>
            </div>
            <div className="p-3 bg-zinc-900/50 rounded-2xl border border-zinc-900">
              <div className="flex items-center gap-1.5 mb-1.5 text-orange-500">
                <Navigation size={13} className="rotate-180" />
                <span className="text-[9px] font-black uppercase tracking-widest">City Entry</span>
              </div>
              <p className="text-xs text-white font-bold">{tips.destination_entry}</p>
            </div>
          </div>

          {/* Avoid times */}
          {tips.avoid_times && tips.avoid_times.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1 text-red-500">
                <Clock size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">Peak Rush Hours</span>
              </div>
              <ul className="list-disc pl-4 text-xs text-zinc-400 space-y-1 font-semibold">
                {tips.avoid_times.map((time, idx) => (
                  <li key={idx}>{time}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Best days */}
          {tips.best_travel_days && tips.best_travel_days.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1 text-emerald-500">
                <Calendar size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">Recommended Travel Days</span>
              </div>
              <p className="text-xs text-zinc-300 font-bold">
                {tips.best_travel_days.join(", ")}
              </p>
            </div>
          )}

          {/* Seasonal / Toll warning */}
          {(tips.toll_rush_hours || tips.seasonal_congestion) && (
            <div className="border-t border-zinc-900/50 pt-3 mt-3">
              <div className="flex items-start gap-2 text-zinc-500">
                <AlertTriangle size={14} className="shrink-0 mt-0.5 text-orange-500/80" />
                <div className="text-[11px] font-semibold leading-relaxed">
                  {tips.toll_rush_hours && <p className="mb-1"><span className="text-zinc-400">Tolls:</span> {tips.toll_rush_hours}</p>}
                  {tips.seasonal_congestion && <p><span className="text-zinc-400">Seasonal:</span> {tips.seasonal_congestion}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
