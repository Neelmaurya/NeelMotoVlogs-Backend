"use client";

import { 
  Wind, 
  Smile, 
  Meh, 
  Frown, 
  AlertTriangle, 
  AlertOctagon, 
  Skull, 
  MapPin, 
  Globe,
  ShieldAlert,
  ShieldCheck,
  Activity
} from "lucide-react";

interface AQIPanelProps {
  aqi: {
    station?: string;
    pm25?: number;
    aqi_category: string;
    aqi_color: string;
    riding_advice: string;
    source?: string;
    measurements?: Record<string, { value: number; unit: string }>;
  };
}

const POLLUTANTS_MAP: Record<string, { name: string; label: string; limit: number; unit: string }> = {
  pm25: { name: "PM2.5", label: "Fine Particles", limit: 35, unit: "µg/m³" },
  pm10: { name: "PM10", label: "Coarse Particles", limit: 150, unit: "µg/m³" },
  no2: { name: "NO₂", label: "Nitrogen Dioxide", limit: 100, unit: "ppb" },
  o3: { name: "O₃", label: "Ozone", limit: 70, unit: "ppb" },
  co: { name: "CO", label: "Carbon Monoxide", limit: 9, unit: "ppm" },
  so2: { name: "SO₂", label: "Sulfur Dioxide", limit: 75, unit: "ppb" },
};

const getCategoryDetails = (category: string) => {
  const normalized = (category || "").toLowerCase();
  if (normalized.includes("good")) {
    return {
      icon: Smile,
      label: "Good",
      badgeBg: "bg-emerald-500/10 border-emerald-500/20",
      badgeText: "text-emerald-400",
      glowColor: "rgba(34, 197, 94, 0.15)",
    };
  }
  if (normalized.includes("fair") || normalized.includes("moderate")) {
    return {
      icon: Meh,
      label: "Moderate",
      badgeBg: "bg-yellow-500/10 border-yellow-500/20",
      badgeText: "text-yellow-400",
      glowColor: "rgba(234, 179, 8, 0.15)",
    };
  }
  if (normalized.includes("sensitive")) {
    return {
      icon: ShieldAlert,
      label: "Sensitive Groups",
      badgeBg: "bg-orange-500/10 border-orange-500/20",
      badgeText: "text-orange-400",
      glowColor: "rgba(249, 115, 22, 0.15)",
    };
  }
  if (normalized.includes("very unhealthy") || normalized.includes("very poor")) {
    return {
      icon: AlertOctagon,
      label: "Very Unhealthy",
      badgeBg: "bg-purple-500/10 border-purple-500/20",
      badgeText: "text-purple-400",
      glowColor: "rgba(124, 58, 237, 0.15)",
    };
  }
  if (normalized.includes("unhealthy") || normalized.includes("poor")) {
    return {
      icon: Frown,
      label: normalized.includes("poor") ? "Poor" : "Unhealthy",
      badgeBg: "bg-red-500/10 border-red-500/20",
      badgeText: "text-red-400",
      glowColor: "rgba(239, 68, 68, 0.15)",
    };
  }
  if (normalized.includes("hazardous")) {
    return {
      icon: Skull,
      label: "Hazardous",
      badgeBg: "bg-rose-950/20 border-rose-900/40",
      badgeText: "text-rose-500",
      glowColor: "rgba(131, 24, 67, 0.2)",
    };
  }
  return {
    icon: Wind,
    label: category || "Unknown",
    badgeBg: "bg-zinc-500/10 border-zinc-500/20",
    badgeText: "text-zinc-400",
    glowColor: "rgba(107, 114, 128, 0.1)",
  };
};

const getAqiPercentage = (pm25: number) => {
  if (pm25 <= 0) return 0;
  if (pm25 <= 12) {
    return (pm25 / 12) * 16.66;
  }
  if (pm25 <= 35) {
    return 16.66 + ((pm25 - 12) / (35 - 12)) * 16.66;
  }
  if (pm25 <= 55) {
    return 33.32 + ((pm25 - 35) / (55 - 35)) * 16.66;
  }
  if (pm25 <= 150) {
    return 49.98 + ((pm25 - 55) / (150 - 55)) * 16.66;
  }
  if (pm25 <= 250) {
    return 66.64 + ((pm25 - 150) / (250 - 150)) * 16.66;
  }
  return Math.min(83.3 + ((pm25 - 250) / 250) * 16.66, 100);
};

export function AQIPanel({ aqi }: AQIPanelProps) {
  if (!aqi) return null;

  const category = aqi.aqi_category || "Unknown";
  const color = aqi.aqi_color || "#6b7280";
  const pm25Value = aqi.pm25 !== undefined ? aqi.pm25 : 0;
  const percentage = getAqiPercentage(pm25Value);
  const details = getCategoryDetails(category);
  const CategoryIcon = details.icon;

  const isAqiNotGood = category.toLowerCase().includes("moderate") || 
                        category.toLowerCase().includes("sensitive") || 
                        category.toLowerCase().includes("unhealthy") || 
                        category.toLowerCase().includes("poor") || 
                        category.toLowerCase().includes("hazardous");

  return (
    <div className="bg-zinc-950/60 border border-zinc-900 rounded-[32px] p-6 shadow-2xl backdrop-blur-xl hover:border-zinc-800 transition-all flex flex-col justify-between h-full relative overflow-hidden group">
      {/* Decorative colored glow in bottom corner */}
      <div 
        className="absolute bottom-0 right-0 w-36 h-36 blur-[70px] opacity-15 rounded-full translate-x-1/3 translate-y-1/3 transition-all duration-500 group-hover:scale-110" 
        style={{ backgroundColor: color }}
      />
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <Wind size={13} className="animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-widest">
              Air Quality Index
            </p>
          </div>
          
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${details.badgeBg} ${details.badgeText}`}>
            <CategoryIcon size={10} className="shrink-0" />
            <span>{details.label}</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <h4 className="text-2xl font-black text-white uppercase tracking-tight">
            {category}
          </h4>
          <span 
            className="w-2.5 h-2.5 rounded-full inline-block animate-pulse" 
            style={{ backgroundColor: color }}
          />
        </div>

        {aqi.pm25 !== undefined && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold mb-4">
            <Activity size={12} className="text-zinc-500" />
            <span>PM2.5 concentration:</span>
            <span className="text-white font-extrabold">{aqi.pm25} µg/m³</span>
          </div>
        )}

        {/* Visual Gauge Track */}
        <div className="relative mt-4 mb-2">
          <div className="h-2 w-full rounded-full overflow-hidden flex bg-zinc-900 border border-zinc-800/40">
            <div className="h-full bg-emerald-500/80" style={{ flex: '0 0 16.66%' }} title="Good" />
            <div className="h-full bg-yellow-500/80" style={{ flex: '0 0 16.66%' }} title="Moderate" />
            <div className="h-full bg-orange-500/80" style={{ flex: '0 0 16.66%' }} title="Sensitive Groups" />
            <div className="h-full bg-red-500/80" style={{ flex: '0 0 16.66%' }} title="Unhealthy" />
            <div className="h-full bg-purple-500/80" style={{ flex: '0 0 16.66%' }} title="Very Unhealthy" />
            <div className="h-full bg-rose-950/80" style={{ flex: '0 0 16.66%' }} title="Hazardous" />
          </div>

          {/* Pointer */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-700 ease-out"
            style={{ left: `${percentage}%` }}
          >
            <div className="w-4 h-4 rounded-full border border-zinc-950 shadow-[0_0_10px_rgba(255,255,255,0.2)] flex items-center justify-center animate-bounce" style={{ backgroundColor: color }}>
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          </div>
        </div>

        {/* Gauge Labels */}
        <div className="flex justify-between text-[8px] font-black text-zinc-600 uppercase tracking-wider mt-1 px-1">
          <span className="text-emerald-500">Good</span>
          <span className="text-yellow-500/80">Moderate</span>
          <span className="text-orange-500/80">Sensitive</span>
          <span className="text-red-500/80">Unhealthy</span>
          <span className="text-purple-500/80">Poor</span>
          <span className="text-rose-600">Hazard</span>
        </div>

        {/* Riding Advice Alert Card */}
        {isAqiNotGood ? (
          <div 
            className="mt-5 p-4 rounded-2xl border flex items-start gap-3 transition-all duration-300" 
            style={{ 
              backgroundColor: `${color}0D`, // ~5% opacity
              borderColor: `${color}25` 
            }}
          >
            <div className="p-2 rounded-xl shrink-0" style={{ backgroundColor: `${color}1A` }}>
              <AlertTriangle size={15} style={{ color }} className="animate-pulse" />
            </div>
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-1">
                Air Quality Advisory
              </h5>
              <p className="text-[11px] text-zinc-400 font-semibold leading-relaxed">
                {aqi.riding_advice}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 p-4 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.04] flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 shrink-0">
              <ShieldCheck size={15} className="text-emerald-400" />
            </div>
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">
                Safe Riding Conditions
              </h5>
              <p className="text-[11px] text-zinc-400 font-semibold leading-relaxed">
                {aqi.riding_advice}
              </p>
            </div>
          </div>
        )}

        {/* Secondary Pollutants Grid */}
        {aqi.measurements && Object.keys(aqi.measurements).length > 0 ? (
          <div className="mt-5 border-t border-zinc-900/50 pt-4">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-3">
              Secondary Pollutants
            </p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(aqi.measurements).map(([key, item]: [string, any]) => {
                const mapped = POLLUTANTS_MAP[key.toLowerCase()] || { name: key.toUpperCase(), label: "Pollutant", unit: item.unit };
                return (
                  <div key={key} className="bg-zinc-900/30 border border-zinc-900/40 p-2 rounded-xl flex flex-col justify-between">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-wider truncate">{mapped.name}</span>
                    <div className="flex items-baseline gap-0.5 mt-1">
                      <span className="text-xs font-black text-white">{item.value}</span>
                      <span className="text-[8px] font-bold text-zinc-500">{item.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-5 border-t border-zinc-900/50 pt-4">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">
              AQI Scale Standards
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-500 font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Good: &le; 12 µg/m³</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                <span>Moderate: 12 - 35 µg/m³</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span>Sensitive: 35 - 55 µg/m³</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>Unhealthy: 55+ µg/m³</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-900 flex justify-between text-[9px] font-black text-zinc-600 uppercase tracking-widest">
        <span className="flex items-center gap-1 truncate max-w-[50%]">
          <MapPin size={10} className="shrink-0 text-zinc-700" />
          <span className="truncate">{aqi.station || "Regional Monitor"}</span>
        </span>
        <span className="flex items-center gap-1 shrink-0">
          <Globe size={10} className="text-zinc-700" />
          <span>{aqi.source || "OpenAQ"}</span>
        </span>
      </div>
    </div>
  );
}
