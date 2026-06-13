"use client";

import { useState } from "react";
import { UserPrefs } from "@/hooks/useUserPreferences";

interface UserPreferencesFormProps {
  initialPrefs: UserPrefs;
  onChange: (prefs: UserPrefs) => void;
}

const INTERESTS_OPTIONS = [
  { id: "nature", label: "🌿 Nature" },
  { id: "culture", label: "🕌 Culture" },
  { id: "food", label: "🍽️ Local Food" },
  { id: "photography", label: "📸 Photography" },
  { id: "adventure", label: "⚡ Adventure" },
  { id: "spiritual", label: "🙏 Spiritual" },
  { id: "wildlife", label: "🐯 Wildlife" },
];

export function UserPreferencesForm({ initialPrefs, onChange }: UserPreferencesFormProps) {
  const [prefs, setPrefs] = useState<UserPrefs>(initialPrefs);

  const update = (key: keyof UserPrefs, value: any) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    onChange(updated);
  };

  const toggleInterest = (interestId: string) => {
    const activeInterests = prefs.interests.includes(interestId)
      ? prefs.interests.filter((i) => i !== interestId)
      : [...prefs.interests, interestId];
    // Ensure at least one interest is active
    if (activeInterests.length > 0) {
      update("interests", activeInterests);
    }
  };

  return (
    <div className="bg-zinc-950/60 border border-zinc-900 rounded-[32px] p-6 md:p-8 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xl">🎯</span>
        <h3 className="text-lg font-black uppercase tracking-tight text-white">
          Personalize Your Route
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Riding Style */}
        <div>
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
            Riding / Travel Style
          </label>
          <select
            value={prefs.riding_style}
            onChange={(e) => update("riding_style", e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-orange-500/50 transition-colors cursor-pointer appearance-none"
          >
            <option value="balanced">⚖️ Balanced Style</option>
            <option value="adventure">🏔️ Adventure Explorer</option>
            <option value="sport">⚡ Sport Performance</option>
            <option value="touring">🗺️ Highway Cruiser</option>
            <option value="casual">😌 Casual Sightseeing</option>
          </select>
        </div>

        {/* Budget */}
        <div>
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
            Trip Budget Tier
          </label>
          <select
            value={prefs.budget}
            onChange={(e) => update("budget", e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-orange-500/50 transition-colors cursor-pointer appearance-none"
          >
            <option value="budget">💰 Budget (Backpacker)</option>
            <option value="moderate">💳 Moderate (Standard)</option>
            <option value="premium">✨ Premium (Luxury Lodge)</option>
          </select>
        </div>

        {/* Pace */}
        <div>
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
            Travel Pace
          </label>
          <select
            value={prefs.pace}
            onChange={(e) => update("pace", e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-orange-500/50 transition-colors cursor-pointer appearance-none"
          >
            <option value="relaxed">🌿 Relaxed (Explore stops)</option>
            <option value="fast">🚀 Fast (Cover max distance)</option>
            <option value="slow">🐢 Slow (Fully immersive)</option>
          </select>
        </div>
      </div>

      {/* Interests selection */}
      <div>
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-3">
          Road Trip Interests (Select multiple)
        </label>
        <div className="flex flex-wrap gap-2.5">
          {INTERESTS_OPTIONS.map((opt) => {
            const isSelected = prefs.interests.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleInterest(opt.id)}
                className={`px-4 py-2 rounded-full text-xs font-black tracking-wide border transition-all ${
                  isSelected
                    ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/10"
                    : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
