import { useState, useCallback, useRef } from "react";
import { useGenerateRoutePlanMutation } from "../store/services/routePlannerApi";

export type RoutePlannerStatus = "idle" | "cached" | "generating" | "completed" | "failed";

const STEPS = [
  "Resolving location coordinates...",
  "Calculating optimal route path...",
  "Fetching real-time weather sensors...",
  "Querying nearby hotels & fuel stations...",
  "Analyzing local Air Quality Index (AQI)...",
  "Looking up regional emergency numbers...",
  "Consulting AI travel expert & local logs...",
  "Structuring day-by-day itinerary...",
  "Compiling specialized packing list...",
  "Preparing interactive map markers...",
  "Polishing final details...",
  "Almost ready to ride...",
];

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/$/, "");

export function useRoutePlanner() {
  const [status, setStatus] = useState<RoutePlannerStatus>("idle");
  const [data, setData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState("");
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const stepRef = useRef(0);

  const [generateMutation] = useGenerateRoutePlanMutation();

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = (jobId: string) => {
    stopPolling();
    stepRef.current = 0;
    setLoadingStep(STEPS[0]);

    pollRef.current = setInterval(async () => {
      // Rotate loading messages
      stepRef.current = (stepRef.current + 1) % STEPS.length;
      setLoadingStep(STEPS[stepRef.current]);

      try {
        const res = await fetch(`${BASE_URL}/routes/status/${jobId}`);
        if (!res.ok) throw new Error("Status check failed");
        
        const json = await res.json();

        if (json.status === "completed") {
          stopPolling();
          setData(json.data);
          setStatus("completed");
        } else if (json.status === "failed") {
          stopPolling();
          setErrorMsg(json.error || "Generation failed");
          setStatus("failed");
        }
      } catch (e: any) {
        // network error - continue polling silently
      }
    }, 3000);
  };

  const generate = useCallback(
    async (source: string, destination: string, mode: string, preferences: any, forceRefresh = false) => {
      stopPolling();
      setStatus("generating");
      setData(null);
      setErrorMsg(null);
      setLoadingStep("Checking cache...");

      try {
        const res = await generateMutation({
          source,
          destination,
          transport_mode: mode,
          preferences,
          force_refresh: forceRefresh,
        }).unwrap();

        if (res.status === "cached") {
          setData(res.data);
          setStatus("cached");
          return;
        }

        if (res.status === "generating" && res.job_id) {
          startPolling(res.job_id);
          return;
        }

        // Direct result fallback
        setData(res);
        setStatus("completed");
      } catch (e: any) {
        setErrorMsg(e?.data?.detail || "Failed to start generation pipeline");
        setStatus("failed");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [generateMutation]
  );

  return { generate, status, data, error: errorMsg, loadingStep };
}
