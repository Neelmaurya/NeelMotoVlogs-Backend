'use client';

const sections = ['Overview', 'Specs', 'Review', 'Rivals', 'FAQs'];

export default function StickyNav() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur border-b border-zinc-900 overflow-x-auto">
      <div className="max-w-7xl mx-auto flex">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => scrollTo(s.toLowerCase())}
            className="px-6 py-3.5 text-xs font-black uppercase tracking-widest whitespace-nowrap text-zinc-500 hover:text-orange-500 hover:border-b-2 hover:border-orange-500 transition-all"
          >
            {s}
          </button>
        ))}
      </div>
    </nav>
  );
}
