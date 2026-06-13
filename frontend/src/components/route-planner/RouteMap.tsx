"use client";

import { useEffect, useRef, useState } from "react";

interface RouteMapProps {
  coordinates: [number, number][]; // [lat, lng]
  waypoints: { lat: number; lng: number }[];
  fuelStops: any[];
  hotels: any[];
  touristSpots: any[];
  hospitals: any[];
  policeStations: any[];
}

type FilterKey = "fuel" | "hotels" | "attractions" | "hospitals" | "police";

const FILTER_CONFIG: { key: FilterKey; emoji: string; label: string; activeColor: string }[] = [
  { key: "fuel",        emoji: "⛽", label: "Fuel",      activeColor: "#eab308" },
  { key: "hotels",      emoji: "🏨", label: "Lodging",   activeColor: "#3b82f6" },
  { key: "attractions", emoji: "📍", label: "Sights",    activeColor: "#ec4899" },
  { key: "hospitals",   emoji: "🏥", label: "Hospitals", activeColor: "#ef4444" },
  { key: "police",      emoji: "🚔", label: "Police",    activeColor: "#6366f1" },
];

const MARKER_COLORS: Record<FilterKey, string> = {
  fuel:        "#eab308",
  hotels:      "#3b82f6",
  attractions: "#ec4899",
  hospitals:   "#ef4444",
  police:      "#6366f1",
};

export default function RouteMap({
  coordinates,
  fuelStops,
  hotels,
  touristSpots,
  hospitals,
  policeStations,
}: RouteMapProps) {
  const mapRef        = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [filters, setFilters] = useState<Record<FilterKey, boolean>>({
    fuel: true, hotels: true, attractions: true, hospitals: true, police: true,
  });

  /* ── 1. Load Leaflet from CDN ─────────────────────────────────────────── */
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id   = "leaflet-css";
      link.rel  = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const L = (window as any).L;
    if (L) { setLeafletLoaded(true); return; }

    if (!document.getElementById("leaflet-js")) {
      const script    = document.createElement("script");
      script.id       = "leaflet-js";
      script.src      = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async    = true;
      script.onload   = () => setLeafletLoaded(true);
      document.body.appendChild(script);
    }
  }, []);

  /* ── 2. Build map + route polyline + start/end pins ──────────────────── */
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !coordinates?.length) return;
    const L = (window as any).L;
    if (!L) return;

    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const map = L.map(mapRef.current, { zoomControl: false });
    leafletMapRef.current = map;

    // Dark Matter tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap © CARTO",
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Orange route line
    const polyline = L.polyline(coordinates, {
      color: "#ea580c", weight: 5, opacity: 0.95, lineJoin: "round",
    }).addTo(map);

    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    // Start/end pins using inline styles (Tailwind NOT available inside Leaflet DOM)
    const pinIcon = (emoji: string, bg: string) =>
      L.divIcon({
        html: `<div style="
          width:36px;height:36px;border-radius:50%;
          background:${bg};border:3px solid #fff;
          display:flex;align-items:center;justify-content:center;
          font-size:16px;box-shadow:0 4px 12px rgba(0,0,0,0.5);
          animation:bounce 1s infinite alternate;
        ">${emoji}</div>`,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
      });

    const popupStyle =
      "font-family:sans-serif;font-size:12px;font-weight:700;padding:4px 6px;white-space:nowrap;";

    L.marker(coordinates[0], { icon: pinIcon("🚀", "#22c55e") })
      .addTo(map)
      .bindPopup(`<div style="${popupStyle}">🏁 Starting Point</div>`);

    L.marker(coordinates[coordinates.length - 1], { icon: pinIcon("🏁", "#ef4444") })
      .addTo(map)
      .bindPopup(`<div style="${popupStyle}">🏆 Destination</div>`);

    // Bounce animation keyframe (injected once)
    if (!document.getElementById("leaflet-bounce-css")) {
      const style = document.createElement("style");
      style.id = "leaflet-bounce-css";
      style.textContent = `
        @keyframes bounce {
          from { transform: translateY(0px); }
          to   { transform: translateY(-6px); }
        }
        .leaflet-popup-content-wrapper {
          background: #18181b !important;
          color: #e4e4e7 !important;
          border: 1px solid #3f3f46 !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5) !important;
        }
        .leaflet-popup-tip { background: #18181b !important; }
        .leaflet-popup-close-button { color: #71717a !important; }
      `;
      document.head.appendChild(style);
    }

    // Marker feature group (cleared/rebuilt when filters change)
    markersLayerRef.current = L.featureGroup().addTo(map);
  }, [leafletLoaded, coordinates]);

  /* ── 3. Re-draw category markers whenever filters or data change ──────── */
  useEffect(() => {
    if (!leafletMapRef.current || !markersLayerRef.current || !leafletLoaded) return;
    const L = (window as any).L;
    if (!L) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    const mk = (emoji: string, color: string) =>
      L.divIcon({
        html: `<div style="
          width:32px;height:32px;border-radius:50%;
          background:${color};border:2px solid #09090b;
          display:flex;align-items:center;justify-content:center;
          font-size:14px;box-shadow:0 3px 10px rgba(0,0,0,0.6);
          cursor:pointer;transition:transform .15s;
        ">${emoji}</div>`,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

    const popupHtml = (title: string, subtitle?: string) =>
      `<div style="font-family:sans-serif;font-size:12px;font-weight:700;min-width:140px">
        ${title}
        ${subtitle ? `<div style="font-size:10px;font-weight:400;color:#a1a1aa;margin-top:2px">${subtitle}</div>` : ""}
       </div>`;

    const addMarkers = (
      items: any[],
      key: FilterKey,
      emoji: string,
      titleFn: (i: any) => string,
      subFn: (i: any) => string
    ) => {
      if (!filters[key]) return;
      items?.forEach((item) => {
        if (item.lat && item.lng) {
          L.marker([item.lat, item.lng], { icon: mk(emoji, MARKER_COLORS[key]) })
            .addTo(layer)
            .bindPopup(popupHtml(titleFn(item), subFn(item)));
        }
      });
    };

    addMarkers(fuelStops,      "fuel",        "⛽", f => `⛽ ${f.name}`,   f => f.brand || "Fuel Station");
    addMarkers(hotels,         "hotels",      "🏨", h => `🏨 ${h.name}`,  h => h.type  || "Hotel");
    addMarkers(touristSpots,   "attractions", "📍", s => `📍 ${s.name}`,  s => s.description || "Attraction");
    addMarkers(hospitals,      "hospitals",   "🏥", h => `🏥 ${h.name}`,  h => `📞 ${h.phone || "102"}`);
    addMarkers(policeStations, "police",      "🚔", p => `🚔 ${p.name}`,  p => `📞 ${p.phone || "100"}`);
  }, [leafletLoaded, filters, fuelStops, hotels, touristSpots, hospitals, policeStations]);

  /* ── 4. Render ────────────────────────────────────────────────────────── */
  return (
    <div className="w-full">
      {/* Filter toolbar — OUTSIDE overflow-hidden so it's always visible */}
      <div className="flex flex-wrap gap-2 mb-3">
        {FILTER_CONFIG.map((f) => {
          const active = filters[f.key];
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, [f.key]: !prev[f.key] }))}
              style={active ? { borderColor: f.activeColor, color: f.activeColor } : {}}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide border transition-all ${
                active
                  ? "bg-zinc-950"
                  : "bg-zinc-950/60 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
              }`}
            >
              <span>{f.emoji}</span>
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* Map container */}
      <div className="relative w-full h-[380px] md:h-[460px] rounded-[32px] overflow-hidden border border-zinc-900 shadow-2xl">
        {!leafletLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 gap-3 z-10">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">
              Loading Map…
            </span>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full bg-zinc-950" />
      </div>
    </div>
  );
}
