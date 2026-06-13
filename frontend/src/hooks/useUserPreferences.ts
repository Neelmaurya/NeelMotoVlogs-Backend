import { useState, useEffect } from "react";

export interface UserPrefs {
  riding_style: string;
  budget: string;
  pace: string;
  interests: string[];
}

const DEFAULT_PREFS: UserPrefs = {
  riding_style: "balanced",
  budget: "moderate",
  pace: "relaxed",
  interests: ["nature"],
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPrefs>(DEFAULT_PREFS);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("route_preferences");
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    } catch (e) {
      console.error("[Prefs Hook] Failed to load preferences:", e);
    }
  }, []);

  const updatePreferences = (prefs: UserPrefs) => {
    setPreferences(prefs);
    try {
      localStorage.setItem("route_preferences", JSON.stringify(prefs));
    } catch (e) {
      console.error("[Prefs Hook] Failed to write preferences:", e);
    }
  };

  return { preferences, updatePreferences };
}
