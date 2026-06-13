"use client";

import { useState } from "react";
import { CloudSun, Wind, Droplets, MapPin } from "lucide-react";

interface WeatherDay {
  date: string;
  temp: number;
  min_temp: number;
  max_temp: number;
  description: string;
  icon: string; // OpenWeather icon code e.g. "01d", "03n"
}

interface WaypointWeather {
  lat: number;
  lng: number;
  temp: number;
  description: string;
  humidity?: number;
  wind_speed?: number;
  location_name?: string; // optional reverse-geocoded name
}

interface WeatherWidgetProps {
  liveWeather: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    description: string;
    icon: string;
    forecast: WeatherDay[];
    source?: string;
  };
  weatherStops: WaypointWeather[];
}

/** Returns a full OpenWeather icon URL, or null if code looks like a fallback emoji/text */
function owIcon(code: string): string | null {
  if (!code || code.length < 3) return null;
  // OW codes are always 3 chars like "01d", "10n" etc.
  if (!/^\d{2}[dn]$/.test(code)) return null;
  return `https://openweathermap.org/img/wn/${code}@2x.png`;
}

/** Map condition description to an emoji fallback when no OW icon is available */
function conditionEmoji(desc: string): string {
  const d = (desc || "").toLowerCase();
  if (d.includes("clear") || d.includes("sunny")) return "☀️";
  if (d.includes("cloud")) return "🌤️";
  if (d.includes("rain") || d.includes("drizzle")) return "🌧️";
  if (d.includes("snow")) return "❄️";
  if (d.includes("thunder") || d.includes("storm")) return "⛈️";
  if (d.includes("fog") || d.includes("mist") || d.includes("haze")) return "🌫️";
  if (d.includes("wind")) return "💨";
  return "🌡️";
}

/** Produce a readable stop label. Uses location_name if present, else cardinal label */
const STOP_LABELS = ["Source", "¼ Route", "Midpoint", "¾ Route", "Near Dest", "Destination"];
function stopLabel(idx: number, total: number, stop: WaypointWeather): string {
  if (stop.location_name) return stop.location_name;
  // evenly spaced labels
  const labelIdx = total <= 1 ? 0 : Math.round((idx / (total - 1)) * (STOP_LABELS.length - 1));
  return STOP_LABELS[labelIdx] ?? `Stop ${idx + 1}`;
}

export function WeatherWidget({ liveWeather, weatherStops }: WeatherWidgetProps) {
  const [activeTab, setActiveTab] = useState<"destination" | "stops">("destination");

  if (!liveWeather) return null;

  const mainIconUrl  = owIcon(liveWeather.icon);
  const mainEmoji    = conditionEmoji(liveWeather.description);

  return (
    <div className="bg-zinc-950/60 border border-zinc-900 rounded-[32px] p-6 md:p-8 shadow-2xl backdrop-blur-xl hover:border-zinc-800 transition-all flex flex-col h-full">
      <div className="flex-1">
        {/* ── Header & tab switcher ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-zinc-900/50 pb-4">
          <div className="flex items-center gap-2">
            <CloudSun className="text-orange-500" size={18} />
            <h3 className="text-sm font-black uppercase tracking-tight text-white">
              Weather Diagnostics
            </h3>
          </div>

          <div className="flex gap-1 bg-zinc-900/50 border border-zinc-900 rounded-xl p-1">
            {(["destination", "stops"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? "bg-orange-600 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab === "destination" ? "Destination" : "Route Stops"}
              </button>
            ))}
          </div>
        </div>

        {/* ══ Destination tab ══════════════════════════════════════════════ */}
        {activeTab === "destination" ? (
          <div>
            {/* Current conditions */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
                  Current Conditions
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white leading-none tracking-tighter">
                    {liveWeather.temp}°
                  </span>
                  <span className="text-sm text-zinc-400 font-bold">C</span>
                </div>
                <p className="text-xs text-orange-500 font-bold uppercase tracking-wider mt-2">
                  {liveWeather.description}
                </p>
                <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
                  Feels like {liveWeather.feels_like}°C
                </p>
              </div>

              {/* Weather icon + stats */}
              <div className="flex flex-col items-center gap-3">
                {/* OW icon or emoji fallback */}
                {mainIconUrl ? (
                  <img
                    src={mainIconUrl}
                    alt={liveWeather.description}
                    width={72}
                    height={72}
                    className="drop-shadow-[0_0_12px_rgba(234,88,12,0.4)]"
                  />
                ) : (
                  <span className="text-5xl leading-none">{mainEmoji}</span>
                )}

                <div className="flex flex-col gap-1.5 bg-zinc-900/40 border border-zinc-900 px-4 py-3 rounded-2xl min-w-[110px]">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold">
                    <Wind size={12} className="text-zinc-500" />
                    <span>{liveWeather.wind_speed} km/h</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold">
                    <Droplets size={12} className="text-zinc-500" />
                    <span>{liveWeather.humidity}% Hum</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5-Day forecast row */}
            <div>
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-3">
                5-Day Outlook
              </p>
              <div className="grid grid-cols-5 gap-2">
                {liveWeather.forecast?.map((day, idx) => {
                  const dayName = new Date(day.date).toLocaleDateString("en-US", {
                    weekday: "short",
                  });
                  const iconUrl = owIcon(day.icon);
                  const emoji  = conditionEmoji(day.description);

                  return (
                    <div
                      key={idx}
                      className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-2 text-center flex flex-col items-center gap-1 hover:border-zinc-800 transition-colors"
                    >
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                        {dayName}
                      </span>

                      {/* Icon */}
                      {iconUrl ? (
                        <img
                          src={iconUrl}
                          alt={day.description}
                          width={40}
                          height={40}
                          className="mx-auto"
                        />
                      ) : (
                        <span className="text-2xl leading-none my-0.5">{emoji}</span>
                      )}

                      <span className="text-sm font-black text-white">{day.temp}°</span>
                      <span className="text-[8px] font-bold text-zinc-500 uppercase truncate w-full">
                        {day.description.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ══ Route Stops tab ══════════════════════════════════════════════ */
          <div>
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-3">
              Waypoint Temperature Scan
            </p>

            {weatherStops && weatherStops.length > 0 ? (
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                {weatherStops.map((stop, idx) => {
                  const label    = stopLabel(idx, weatherStops.length, stop);
                  const emoji    = conditionEmoji(stop.description);
                  const isFirst  = idx === 0;
                  const isLast   = idx === weatherStops.length - 1;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between bg-zinc-900/30 border rounded-2xl px-4 py-3 hover:border-zinc-700 transition-colors ${
                        isFirst  ? "border-emerald-900/50 bg-emerald-950/10" :
                        isLast   ? "border-orange-900/50 bg-orange-950/10"  :
                                   "border-zinc-900"
                      }`}
                    >
                      {/* Location label */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <MapPin
                          size={12}
                          className={`shrink-0 ${
                            isFirst ? "text-emerald-500" :
                            isLast  ? "text-orange-500"  :
                                      "text-zinc-500"
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{label}</p>
                          <p className="text-[9px] text-zinc-500 font-mono">
                            {stop.lat.toFixed(2)}°N {stop.lng.toFixed(2)}°E
                          </p>
                        </div>
                      </div>

                      {/* Condition + temp */}
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-lg leading-none" title={stop.description}>
                          {emoji}
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-black text-white block">
                            {stop.temp}°C
                          </span>
                          {stop.humidity && (
                            <span className="text-[9px] text-zinc-500 font-bold">
                              {stop.humidity}% hum
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-zinc-500 text-xs italic">
                No waypoint weather data available.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-900 text-right text-[8px] font-black text-zinc-600 uppercase tracking-widest">
        Feed: {liveWeather.source || "OpenWeather API"}
      </div>
    </div>
  );
}
