'use client';
import { motion } from 'framer-motion';

export default function ScoreCircle({ label, score }: { label: string; score: number }) {
  const s = Number(score) || 0;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#18181b" strokeWidth="2.5" />
          <motion.circle
            cx="18" cy="18" r="15.9" fill="none"
            stroke="#ea580c" strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ strokeDasharray: '0, 100' }}
            animate={{ strokeDasharray: `${s * 10}, 100` }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-white">{s}</span>
      </div>
      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">{label}</p>
    </div>
  );
}
