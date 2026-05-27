'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SpecSection { title: string; icon: React.ElementType; data: Record<string, any> }

export default function SpecsAccordion({ sections }: { sections: SpecSection[] }) {
  const [open, setOpen] = useState<string | null>(sections[0]?.title ?? null);
  return (
    <div className="space-y-3">
      {sections.map(({ title, icon: Icon, data }) => (
        <div key={title} className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950">
          <button
            onClick={() => setOpen(open === title ? null : title)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-zinc-900 transition-colors"
          >
            <span className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-white">
              <Icon size={15} className="text-orange-500" />{title}
            </span>
            <ChevronDown size={16} className={`text-zinc-500 transition-transform ${open === title ? 'rotate-180' : ''}`} />
          </button>
          {open === title && (
            <div className="px-6 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              {Object.entries(data || {}).map(([k, v]) => (
                <div key={k} className="flex justify-between items-center border-b border-zinc-900 py-2">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tight">{k.replace(/_/g, ' ')}</span>
                  <span className="text-xs font-black text-zinc-300 text-right max-w-[55%]">{String(v || '—')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
