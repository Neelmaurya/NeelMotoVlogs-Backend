"use client";

import { Compass, Clock, Fuel, Hotel, Eye } from "lucide-react";

interface StatsSummaryProps {
  distance: number;
  duration: number;
  fuelCount: number;
  hotelsCount: number;
  touristCount: number;
}

export function StatsSummary({
  distance,
  duration,
  fuelCount,
  hotelsCount,
  touristCount,
}: StatsSummaryProps) {
  const statsList = [
    { label: "Total Distance", value: `${distance} KM`, icon: Compass, color: "text-orange-500" },
    { label: "Est. Ride Time", value: `${duration} HRS`, icon: Clock, color: "text-amber-500" },
    { label: "Fuel Stations", value: `${fuelCount} Stops`, icon: Fuel, color: "text-yellow-500" },
    { label: "Lodging options", value: `${hotelsCount} Spots`, icon: Hotel, color: "text-blue-500" },
    { label: "Tourist Attractions", value: `${touristCount} Highlights`, icon: Eye, color: "text-pink-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statsList.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="bg-zinc-950/60 border border-zinc-900 rounded-[24px] p-5 hover:border-orange-600/20 transition-all flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none">
                {stat.label}
              </span>
              <Icon size={14} className={stat.color} />
            </div>
            <p className="text-xl font-black text-white leading-none tracking-tight">
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
