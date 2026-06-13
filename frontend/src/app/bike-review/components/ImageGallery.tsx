'use client';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Strip trailing /api or /api/ so we never get a double /api//api/ path
// when NEXT_PUBLIC_API_URL already ends with /api/ (as in .env.local)
const _RAW_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE = _RAW_BASE.replace(/\/api\/?$/, '');

function proxyUrl(src: string): string {
  if (!src) return src;
  return `${API_BASE}/api/image-proxy/?url=${encodeURIComponent(src)}`;
}

export default function ImageGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const [errors, setErrors] = useState<Record<number, boolean>>({});
  const list = images?.length ? images : [];

  // Reset state whenever a new bike's images arrive
  useEffect(() => {
    setActive(0);
    setErrors({});
  }, [images]);


  const handleError = (i: number) => {
    setErrors(prev => ({ ...prev, [i]: true }));
  };

  return (
    <div className="space-y-3">
      <div className="relative aspect-video rounded-[32px] overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl">
        {list.length > 0 && !errors[active] ? (
          <AnimatePresence mode="wait">
            <motion.img
              key={active}
              src={proxyUrl(list[active])}
              alt="Bike"
              className="w-full h-full object-cover"
              onError={() => handleError(active)}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-4xl">🏍️</span>
            <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Image unavailable</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
        {list.length > 1 && (
          <div className="absolute bottom-5 left-5 flex gap-2">
            {list.map((_, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`h-2 rounded-full transition-all ${active === i ? 'bg-orange-500 w-8' : 'bg-white/30 w-2'}`} />
            ))}
          </div>
        )}
      </div>
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {list.map((src, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`shrink-0 w-16 h-10 rounded-xl overflow-hidden border-2 transition-all ${active === i ? 'border-orange-500' : 'border-zinc-800'}`}>
              {!errors[i] ? (
                <img
                  src={proxyUrl(src)}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={() => handleError(i)}
                />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xs">🏍️</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
