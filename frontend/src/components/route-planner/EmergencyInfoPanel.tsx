"use client";

import { Phone, Shield, ShieldAlert, Truck, Eye } from "lucide-react";

interface ContactInfo {
  name: string;
  type?: string;
  lat: number;
  lng: number;
  phone?: string;
  emergency?: string;
}

interface EmergencyInfoProps {
  emergency: {
    hospitals: ContactInfo[];
    police_stations: ContactInfo[];
    emergency_numbers: Record<string, string>;
  };
}

const HELPLINE_ICONS: Record<string, any> = {
  police: Shield,
  ambulance: Truck,
  fire: ShieldAlert,
  national_emergency: ShieldAlert,
  highway_helpline: Eye,
};

export function EmergencyInfoPanel({ emergency }: EmergencyInfoProps) {
  if (!emergency) return null;

  const numbers = emergency.emergency_numbers || {};

  return (
    <div className="bg-red-950/10 border border-red-900/30 rounded-[32px] p-6 md:p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xl">🚨</span>
        <h3 className="text-lg font-black uppercase tracking-tight text-red-500">
          Emergency Response & Safety
        </h3>
      </div>

      {/* Primary helpline quick dials */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {Object.entries(numbers).map(([key, num]) => {
          const Icon = HELPLINE_ICONS[key] || Phone;
          return (
            <a
              key={key}
              href={`tel:${num}`}
              className="flex flex-col items-center justify-center p-3 bg-red-950/40 hover:bg-red-950/70 border border-red-900/30 rounded-2xl text-center group transition-all"
            >
              <Icon className="text-red-500 mb-2 group-hover:scale-110 transition-transform" size={18} />
              <p className="text-base font-black text-white">{num}</p>
              <p className="text-[8px] font-black uppercase tracking-widest text-red-400/70 mt-0.5 whitespace-nowrap">
                {key.replace(/_/g, " ")}
              </p>
            </a>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Nearest hospitals */}
        <div>
          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            🏥 Nearby Hospitals & Clinics
          </h4>
          {emergency.hospitals && emergency.hospitals.length > 0 ? (
            <div className="space-y-3">
              {emergency.hospitals.map((h, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-950/40 border border-zinc-900/80 rounded-2xl p-4 flex justify-between items-center hover:border-zinc-800 transition-colors"
                >
                  <div>
                    <h5 className="text-sm font-bold text-white leading-tight">{h.name}</h5>
                    <p className="text-[9px] font-bold uppercase text-red-500/80 mt-1">
                      {h.type} {h.emergency === "yes" && "• 24/7 Trauma"}
                    </p>
                  </div>
                  {h.phone && h.phone !== "N/A" && h.phone !== "102" && (
                    <a
                      href={`tel:${h.phone}`}
                      className="bg-red-950/50 hover:bg-red-900/50 border border-red-900/40 text-red-400 p-2.5 rounded-xl transition-colors shrink-0"
                    >
                      <Phone size={14} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic">No hospitals indexed. Contact National Ambulance at 108.</p>
          )}
        </div>

        {/* Police stations */}
        <div>
          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            🚔 Regional Police Stations
          </h4>
          {emergency.police_stations && emergency.police_stations.length > 0 ? (
            <div className="space-y-3">
              {emergency.police_stations.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-950/40 border border-zinc-900/80 rounded-2xl p-4 flex justify-between items-center hover:border-zinc-800 transition-colors"
                >
                  <div>
                    <h5 className="text-sm font-bold text-white leading-tight">{p.name}</h5>
                    <p className="text-[9px] font-bold uppercase text-zinc-500 mt-1">
                      Law Enforcement Unit
                    </p>
                  </div>
                  <a
                    href={`tel:${p.phone || "100"}`}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white p-2.5 rounded-xl transition-colors shrink-0"
                  >
                    <Phone size={14} />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic">No local stations indexed. Contact Police Control at 100.</p>
          )}
        </div>
      </div>
    </div>
  );
}
