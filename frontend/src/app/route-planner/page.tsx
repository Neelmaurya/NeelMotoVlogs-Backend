"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  AlertTriangle,
  FileText,
  MapPin,
  Utensils,
  Backpack,
  Compass,
  DollarSign,
  Info,
} from "lucide-react";
import Link from "next/link";

// Hooks & Services
import { useRoutePlanner } from "@/hooks/useRoutePlanner";
import { useUserPreferences } from "@/hooks/useUserPreferences";

// UI Components
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { UserPreferencesForm } from "@/components/route-planner/UserPreferencesForm";
import RouteMap from "@/components/route-planner/RouteMap";
import { StatsSummary } from "@/components/route-planner/StatsSummary";
import { WeatherWidget } from "@/components/route-planner/WeatherWidget";
import { AQIPanel } from "@/components/route-planner/AQIPanel";
import { TrafficTipsPanel } from "@/components/route-planner/TrafficTipsPanel";
import { EmergencyInfoPanel } from "@/components/route-planner/EmergencyInfoPanel";
import { PhotographySpots } from "@/components/route-planner/PhotographySpots";
import { SilentReflectionPoints } from "@/components/route-planner/SilentReflectionPoints";
import { SustainableTips } from "@/components/route-planner/SustainableTips";
import { LoadingScreen } from "../bike-review/components/LoadingScreen";

// Section Delimiter Helper
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-6 mb-8 mt-12">
    <h3 className="text-2xl font-black uppercase tracking-tighter text-white shrink-0">
      {children}
    </h3>
    <div className="h-px bg-zinc-900 flex-grow" />
  </div>
);

export default function RoutePlannerPage() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [mode, setMode] = useState("car");

  const { preferences, updatePreferences } = useUserPreferences();
  const { generate, status, data: plan, error, loadingStep } = useRoutePlanner();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim() || !destination.trim()) return;
    await generate(source, destination, mode, preferences, true);
  };

  const handlePopularSelect = async (pop: any) => {
    setSource(pop.source);
    setDestination(pop.destination);
    setMode(pop.transport_mode);
    if (pop.preferences) {
      updatePreferences(pop.preferences);
    }
    await generate(pop.source, pop.destination, pop.transport_mode, pop.preferences || preferences, false);
  };

  const ai = plan?.ai_plan ?? {};

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-orange-500/30 flex flex-col">
      <Header />

      {/* Editorial Search Header */}
      <div className="relative pt-28 pb-16 px-6 border-b border-zinc-900 bg-zinc-950">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-orange-600 font-black mb-4">
            NEELMOTO TRAVEL JOURNAL
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-8">
            AI Route <span className="font-black italic">Diagnostics</span>
          </h1>

          <form onSubmit={handleGenerate} className="space-y-6 max-w-2xl mx-auto">
            {/* Input inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-2xl">
              <div className="relative flex items-center border-b sm:border-b-0 sm:border-r border-zinc-800 pb-2 sm:pb-0 sm:pr-2">
                <MapPin className="ml-3 text-zinc-600 shrink-0" size={16} />
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Starting From (e.g. Delhi)"
                  className="w-full bg-transparent py-3 px-3 text-sm focus:outline-none text-white font-bold placeholder:text-zinc-600"
                  required
                />
              </div>

              <div className="relative flex items-center border-b sm:border-b-0 sm:border-r border-zinc-800 pb-2 sm:pb-0 sm:pr-2">
                <MapPin className="ml-3 text-zinc-600 shrink-0" size={16} />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Destination (e.g. Ladakh)"
                  className="w-full bg-transparent py-3 px-3 text-sm focus:outline-none text-white font-bold placeholder:text-zinc-600"
                  required
                />
              </div>

              <div className="flex items-center justify-between pl-2">
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="bg-transparent border-0 text-zinc-400 font-bold text-xs py-3 px-2 w-full focus:outline-none cursor-pointer"
                >
                  <option value="car">🚗 Driving (Car)</option>
                  <option value="bike">🏍️ Riding (Motorcycle)</option>
                  <option value="cycling">🚴 Cycling</option>
                  <option value="walk">🚶 Walking</option>
                  <option value="transit">🚌 Transit</option>
                </select>
              </div>
            </div>

            {/* Custom Preferences form */}
            <UserPreferencesForm initialPrefs={preferences} onChange={updatePreferences} />

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={status === "generating"}
                className="bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-xs tracking-widest px-10 py-4 rounded-2xl shadow-lg hover:shadow-orange-600/10 transition-all disabled:bg-zinc-800"
              >
                {status === "generating" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={14} /> Generating Plan...
                  </span>
                ) : (
                  "GENERATE DIAGNOSTIC PLAN"
                )}
              </button>
            </div>
          </form>

          {/* Quick popularity shortcuts */}
          {status === "idle" && (
            <div className="max-w-2xl mx-auto mt-10 border-t border-zinc-900 pt-6">
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-3">Popular Expeditions</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { source: "Delhi", destination: "Manali", transport_mode: "bike" },
                  { source: "Manali", destination: "Leh Ladakh", transport_mode: "bike" },
                  { source: "Mumbai", destination: "Goa", transport_mode: "car" }
                ].map((pop, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePopularSelect(pop)}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-white px-4 py-2 rounded-xl transition-all"
                  >
                    🏍️ {pop.source} to {pop.destination}
                  </button>
                ))}
              </div>
            </div>
          )}

          {status === "cached" && (
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-6">
              ⚡ Loaded from Database Cache
            </p>
          )}

          {status === "failed" && (
            <div className="mt-6 p-4 bg-red-950/20 border border-red-900/30 rounded-2xl max-w-xl mx-auto flex items-start gap-3">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
              <p className="text-red-500 text-xs font-bold text-left">{error || "Failed to generate route plan."}</p>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 flex-grow w-full">
        <AnimatePresence mode="wait">
          {/* Loading Screen */}
          {status === "generating" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingScreen step={loadingStep} />
            </motion.div>
          )}

          {/* Generated Plan Output */}
          {plan && (status === "completed" || status === "cached") && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* ── Overview Header ── */}
              <div>
                <p className="text-xs text-zinc-500 mb-2 uppercase font-bold tracking-wider">
                  Road Trips &rsaquo; <span className="text-zinc-300">{plan.source_info.display_name.split(",")[0]} to {plan.destination_info.display_name.split(",")[0]}</span>
                </p>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">
                  {plan.source_info.display_name.split(",")[0]} &rarr; {plan.destination_info.display_name.split(",")[0]}
                </h2>
                {ai.personalized_for?.customization_note && (
                  <p className="text-orange-500/90 font-semibold italic text-sm mt-3 max-w-3xl leading-relaxed">
                    💡 {ai.personalized_for.customization_note}
                  </p>
                )}
              </div>

              {/* ── Stats summary toolbar ── */}
              <StatsSummary
                distance={plan.route_info.distance_km}
                duration={plan.route_info.duration_hours}
                fuelCount={plan.fuel_stops?.length || 0}
                hotelsCount={plan.hotels?.length || 0}
                touristCount={plan.tourist_spots_destination?.length || 0}
              />

              {/* ── Map Grid ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <div className="lg:col-span-8">
                  <RouteMap
                    coordinates={plan.route_info.coordinates}
                    waypoints={plan.route_info.waypoints}
                    fuelStops={plan.fuel_stops || []}
                    hotels={plan.hotels || []}
                    touristSpots={plan.tourist_spots_destination || []}
                    hospitals={plan.emergency_info?.hospitals || []}
                    policeStations={plan.emergency_info?.police_stations || []}
                  />
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                  {/* Weather Diagnostics */}
                  <WeatherWidget liveWeather={plan.live_weather} weatherStops={plan.weather_stops} />
                </div>
              </div>

              {/* ── Environment and Safety Indicators ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AQIPanel aqi={plan.aqi} />
                <TrafficTipsPanel tips={ai.traffic_tips} />
              </div>

              {/* ── Emergency Information ── */}
              <EmergencyInfoPanel emergency={plan.emergency_info} />

              {/* ── Best Time & Traditional Food Guide ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Best Time to Visit */}
                <div className="bg-zinc-950/60 border border-zinc-900 rounded-[32px] p-7 shadow-2xl flex flex-col justify-between md:col-span-1">
                  <div>
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                      <Compass size={12} className="text-orange-500" /> Optimal Seasons
                    </h4>
                    <h5 className="text-lg font-black text-white uppercase tracking-tight mb-3">
                      Best Time to Visit
                    </h5>
                    <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                      {ai.best_time_to_visit}
                    </p>
                  </div>
                  {ai.personalized_for && (
                    <div className="border-t border-zinc-900 pt-4 mt-6 flex justify-between text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                      <span>Style: {ai.personalized_for.riding_style}</span>
                      <span>Pace: {ai.personalized_for.travel_pace}</span>
                    </div>
                  )}
                </div>

                {/* Local Traditional Foods */}
                <div className="bg-zinc-950/60 border border-zinc-900 rounded-[32px] p-7 shadow-2xl md:col-span-2">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <Utensils size={12} className="text-orange-500" /> Local Flavors
                  </h4>
                  <h5 className="text-lg font-black text-white uppercase tracking-tight mb-4">
                    Traditional Foods & Dishes
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ai.traditional_foods?.map((food: any, idx: number) => (
                      <div key={idx} className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 hover:border-zinc-800 transition-colors">
                        <span className="text-xs font-black text-white block mb-1">{food.name}</span>
                        <p className="text-[11px] text-zinc-400 leading-normal font-semibold">{food.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Day-by-day Itinerary ── */}
              <div>
                <SectionTitle>Day-by-Day Expedition Schedule</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ai.day_by_day_plan?.map((day: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-zinc-950 border border-zinc-900 rounded-[32px] p-6 hover:border-orange-500/20 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] bg-orange-600/10 border border-orange-500/20 text-orange-500 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                            Day {day.day}
                          </span>
                          <span className="text-xs text-zinc-500 font-bold">{day.distance}</span>
                        </div>
                        <h4 className="text-base font-black text-white uppercase tracking-tight mb-3">
                          {day.title}
                        </h4>
                        <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                          {day.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Warnings & Permits ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Warnings */}
                <div className="bg-orange-600/5 border border-orange-500/10 rounded-[36px] p-6 md:p-8">
                  <h4 className="text-orange-500 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                    <AlertTriangle size={14} /> Critical Route Warnings
                  </h4>
                  <ul className="space-y-3">
                    {ai.important_warnings?.map((warn: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-xs text-zinc-400 font-semibold leading-relaxed">
                        <span className="text-orange-500 font-black shrink-0 mt-0.5">•</span>
                        {warn}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Permits */}
                <div className="bg-zinc-900/20 border border-zinc-900 rounded-[36px] p-6 md:p-8">
                  <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FileText size={14} /> Permits & Toll requirements
                  </h4>
                  <ul className="space-y-4">
                    {ai.permits_required?.map((permit: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-xs">
                        <span className="text-zinc-500 font-black shrink-0 mt-0.5">•</span>
                        <div>
                          <h5 className="font-bold text-white uppercase text-xs">{permit.name}</h5>
                          <p className="text-zinc-400 font-semibold leading-normal mt-0.5">{permit.details}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ── Budget diagnostics ── */}
              {ai.budget_breakdown && (
                <div className="bg-zinc-950 border border-zinc-900 rounded-[48px] p-8 md:p-12">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-zinc-900">
                    <div>
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Financial Analysis</p>
                      <h4 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <DollarSign className="text-orange-500" size={20} /> Budget Estimator
                      </h4>
                    </div>

                    <div className="flex items-baseline gap-2 bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-2xl">
                      <span className="text-xs font-black uppercase text-zinc-500 tracking-wider">Estimated Total</span>
                      <span className="text-2xl font-black text-orange-500">{ai.budget_breakdown.total_estimated}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                      { l: "Fuel & Lubricants", v: ai.budget_breakdown.fuel_cost },
                      { l: "Meals & Board", v: ai.budget_breakdown.food_cost },
                      { l: "Lodging (Est.)", v: ai.budget_breakdown.lodging_cost },
                      { l: "Tolls & Buffer", v: ai.budget_breakdown.misc_cost },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl">
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">{item.l}</p>
                        <p className="text-sm font-bold text-white">{item.v}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-zinc-400 font-semibold italic flex items-start gap-2 max-w-3xl leading-relaxed">
                    <Info size={14} className="text-orange-500 shrink-0 mt-0.5" />
                    {ai.budget_breakdown.budget_advice}
                  </p>
                </div>
              )}

              {/* ── Packing Checklist ── */}
              {ai.packing_checklist && (
                <div>
                  <SectionTitle>Excursion Packing Checklist</SectionTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { title: "🎒 Essential Gear", list: ai.packing_checklist.essential_gear },
                      { title: "👕 Travel Clothing", list: ai.packing_checklist.clothing },
                      { title: "🔧 Spares & Tools", list: ai.packing_checklist.tools_spares },
                      { title: "🩹 Medical & Permits", list: ai.packing_checklist.medical_permits },
                    ].map((chk, idx) => (
                      <div key={idx} className="bg-zinc-950 border border-zinc-900 rounded-[32px] p-6">
                        <h4 className="text-sm font-black uppercase text-white tracking-tight mb-4 pb-2 border-b border-zinc-900">
                          {chk.title}
                        </h4>
                        <ul className="space-y-2">
                          {chk.list?.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-400 font-semibold leading-snug">
                              <Backpack size={11} className="text-orange-500/80 shrink-0 mt-1" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Scenic & Eco Travel Guides ── */}
              <PhotographySpots spots={ai.photography_highlights || []} />
              <SilentReflectionPoints points={ai.silent_reflection_points || []} />
              <SustainableTips tips={ai.sustainable_travel_tips || []} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="py-16 text-center border-t border-zinc-900 bg-zinc-950 mt-16">
        <Link
          href="/"
          className="text-zinc-600 hover:text-white transition-all text-[9px] font-black uppercase tracking-[0.5em]"
        >
          Exit Diagnostics Hub
        </Link>
      </div>

      <Footer />
    </div>
  );
}
