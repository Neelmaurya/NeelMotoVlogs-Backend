'use client';

export function LoadingScreen({ step }: { step: string }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-20 animate-pulse">
      {/* Status message */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-4 bg-orange-600/10 border border-orange-500/20 rounded-full px-6 py-3">
          <span className="w-3 h-3 bg-orange-500 rounded-full animate-ping" />
          <span className="text-orange-500 font-bold uppercase tracking-widest text-xs">{step}</span>
        </div>
      </div>

      {/* Skeleton hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          <div className="h-[400px] bg-zinc-900 rounded-[32px] w-full" />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <div className="h-10 bg-zinc-900 rounded w-48" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-zinc-900 rounded-2xl" />
            ))}
          </div>
          <div className="h-32 bg-zinc-900 rounded-2xl" />
        </div>
      </div>

      {/* Skeleton content below */}
      <div className="mt-16 space-y-8">
         <div className="h-8 bg-zinc-900 rounded w-64" />
         {[...Array(3)].map((_, i) => (
           <div key={i} className="h-16 bg-zinc-900 rounded-2xl w-full" />
         ))}
      </div>
    </div>
  );
}
