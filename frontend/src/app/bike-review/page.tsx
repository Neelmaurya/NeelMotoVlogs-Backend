'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Loader2, Star, CheckCircle2, XCircle,
  Fuel, Zap, Weight, Gauge, Activity,
  ThumbsUp, Settings, Cpu, Maximize2,
  Map, HelpCircle, ChevronDown, Disc, LayoutGrid, Lightbulb,
} from 'lucide-react';
import { useBikeReview } from '@/hooks/useBikeReview';
import Link from 'next/link';
import ScoreCircle from './components/ScoreCircle';
import ImageGallery from './components/ImageGallery';
import SpecsAccordion from './components/SpecsAccordion';
import StickyNav from './components/StickyNav';
import { LoadingScreen } from './components/LoadingScreen';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const Section = ({ id, children, className = '' }: { id: string; children: React.ReactNode; className?: string }) => (
  <section id={id} className={`scroll-mt-14 ${className}`}>{children}</section>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-6 mb-10">
    <h3 className="text-2xl font-black uppercase tracking-tighter text-white shrink-0">{children}</h3>
    <div className="h-px bg-zinc-900 flex-grow" />
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BikeReviewPage() {
  const [bikeName, setBikeName] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { generate, status, data: review, error, loadingStep } = useBikeReview();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bikeName.trim()) return;
    await generate(bikeName);
  };

  const ps = review?.performance_scores ?? {};

  const specSections = review ? [
    { title: 'Engine & Performance', icon: Cpu, data: review.specs?.power_performance },
    { title: 'Brakes', icon: Disc, data: review.specs?.brakes },
    { title: 'Suspension', icon: Activity, data: review.specs?.suspension },
    { title: 'Tyres & Wheels', icon: LayoutGrid, data: review.specs?.tyres_wheels },
    { title: 'Electricals & Features', icon: Lightbulb, data: review.specs?.electricals },
    { title: 'Dimensions & Capacity', icon: Maximize2, data: review.specs?.dimensions },
  ] : [];

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-orange-500/30">

      {/* ── Editorial Header ── */}
      <div className="relative pt-24 pb-16 px-6 border-b border-zinc-900 bg-zinc-950">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-orange-600 font-black mb-4">NEELMOTO JOURNAL</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-10">
            Automotive <span className="font-black italic">Intelligence</span>
          </h1>
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl p-1 focus-within:border-orange-500/50 transition-all shadow-2xl">
              <Search className="ml-5 text-zinc-600 shrink-0" size={18} />
              <input
                type="text"
                value={bikeName}
                onChange={(e) => setBikeName(e.target.value)}
                placeholder="Search bike (e.g. Bajaj Dominar 400)"
                className="w-full bg-transparent py-4 px-4 text-sm focus:outline-none text-white font-bold"
              />
              <button
                type="submit"
                disabled={status === 'generating'}
                className="shrink-0 bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl text-xs font-black transition-all disabled:bg-zinc-800"
              >
                {status === 'generating' ? <Loader2 className="animate-spin" size={16} /> : 'GENERATE'}
              </button>
            </div>
          </form>
          {status === 'cached' && (
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-4">⚡ Loaded from DB Cache</p>
          )}
          {status === 'failed' && (
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-4">❌ {error || 'Failed to generate'}</p>
          )}
        </div>
      </div>

      {/* ── Sticky Nav (only when review loaded) ── */}
      {review && (status === 'completed' || status === 'cached') && <StickyNav />}

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <AnimatePresence mode="wait">

          {/* Loading State */}
          {status === 'generating' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingScreen step={loadingStep} />
            </motion.div>
          )}

          {/* Review Content */}
          {review && (status === 'completed' || status === 'cached') && (
            <motion.div key="review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-20">

              {/* ── HERO ── */}
              <Section id="overview">
                {/* Breadcrumb */}
                <p className="text-xs text-zinc-600 mb-4">
                  Bikes &rsaquo; <span className="text-zinc-400">{review.bike_name}</span>
                </p>

                {/* Name + tagline + rating */}
                <div className="mb-8">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded text-xs font-black flex items-center gap-1">
                      <Star size={11} fill="white" /> {review.overall_rating}
                    </span>
                    <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Expert Verified</span>
                  </div>
                  <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none">{review.bike_name}</h2>
                  <p className="text-orange-500 font-bold italic text-lg mt-2">{review.tagline}</p>
                </div>

                {/* Gallery + Highlights Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* Gallery */}
                  <div className="lg:col-span-7">
                    <ImageGallery images={review.images ?? []} />
                  </div>

                  {/* Key highlights sidebar */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    <div>
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Ex-Showroom Price</p>
                      <p className="text-3xl font-black text-white">{review.price_range}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { l: 'ARAI Mileage', v: review.mileage_arai, i: Fuel },
                        { l: 'Real Mileage', v: review.mileage_owner, i: Activity },
                        { l: 'Max Power', v: review.specs?.power_performance?.max_power, i: Zap },
                        { l: 'Kerb Weight', v: review.specs?.dimensions?.kerb_weight, i: Weight },
                        { l: 'Seat Height', v: review.specs?.dimensions?.seat_height, i: Gauge },
                        { l: 'Fuel Tank', v: review.specs?.dimensions?.fuel_capacity, i: Fuel },
                      ].map((h) => (
                        <div key={h.l} className="p-4 bg-zinc-900/50 border border-zinc-900 rounded-2xl hover:border-orange-600/30 transition-all">
                          <h.i size={18} className="text-orange-500 mb-2" />
                          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{h.l}</p>
                          <p className="font-bold text-sm text-white mt-0.5">{h.v || 'N/A'}</p>
                        </div>
                      ))}
                    </div>

                    {/* Variants quick table */}
                    <div className="p-5 bg-zinc-900/30 border border-zinc-900 rounded-2xl">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Variants & Pricing</p>
                      <div className="space-y-2">
                        {review.variants?.map((v: any, i: number) => (
                          <div key={i} className="flex justify-between items-center text-sm border-b border-zinc-900 pb-2 last:border-0 last:pb-0">
                            <span className="font-bold text-zinc-400">{v.name}</span>
                            <span className="font-black text-orange-500">{v.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Colors */}
                    {review.colors?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Available Colors</p>
                        <div className="flex flex-wrap gap-2">
                          {review.colors.map((c: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-bold text-zinc-300">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Section>

              {/* ── PERFORMANCE SCORES ── */}
              <section className="bg-zinc-950 border border-zinc-900 p-10 md:p-14 rounded-[48px] shadow-2xl">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-600 mb-12 text-center">Professional Scorecard</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-6 md:gap-10">
                  <ScoreCircle label="Engine" score={ps.engine_performance} />
                  <ScoreCircle label="Comfort" score={ps.ride_comfort} />
                  <ScoreCircle label="Value" score={ps.value_for_money} />
                  <ScoreCircle label="Build" score={ps.build_quality} />
                  <ScoreCircle label="Features" score={ps.features} />
                  <ScoreCircle label="Styling" score={ps.styling} />
                </div>
              </section>

              {/* ── SPECS ── */}
              <Section id="specs">
                <SectionTitle>Technical Data Sheet</SectionTitle>
                <SpecsAccordion sections={specSections} />
              </Section>

              {/* ── RIDING EXPERIENCE ── */}
              <section>
                <SectionTitle>The Riding Experience</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { l: 'City Commuting', v: review.riding_experience?.city_riding, i: Map },
                    { l: 'Highway Prowess', v: review.riding_experience?.highway_performance, i: Activity },
                    { l: 'Touring Ability', v: review.riding_experience?.touring_comfort, i: Fuel },
                    { l: 'Handling & Corners', v: review.riding_experience?.handling, i: Gauge },
                  ].map((item) => (
                    <div key={item.l} className="p-7 bg-zinc-900/30 border border-zinc-900 rounded-[28px] hover:bg-zinc-900 transition-all group">
                      <item.i size={22} className="text-orange-600 mb-4 group-hover:scale-110 transition-transform" />
                      <h4 className="text-sm font-black uppercase mb-3 tracking-tight text-white">{item.l}</h4>
                      <p className="text-sm text-zinc-500 leading-relaxed">{item.v}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── EXPERT REVIEW + PROS/CONS ── */}
              <Section id="review">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">
                  <div className="lg:col-span-2 space-y-10">
                    <div>
                      <SectionTitle>Journalist Report</SectionTitle>
                      <div className="text-zinc-400 text-base leading-8 space-y-5">
                        {review.expert_review?.split('\n').filter(Boolean).map((p: string, i: number) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-emerald-600/5 border border-emerald-600/10 p-7 rounded-[32px]">
                        <h4 className="text-emerald-500 text-xs font-black uppercase tracking-widest mb-5 flex items-center gap-2">
                          <ThumbsUp size={14} /> Why to Buy
                        </h4>
                        <ul className="space-y-3">
                          {review.pros?.map((p: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
                              <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />{p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-red-600/5 border border-red-600/10 p-7 rounded-[32px]">
                        <h4 className="text-red-500 text-xs font-black uppercase tracking-widest mb-5 flex items-center gap-2">
                          <XCircle size={14} /> Why to Avoid
                        </h4>
                        <ul className="space-y-3">
                          {review.cons?.map((c: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
                              <XCircle size={15} className="text-red-500 shrink-0 mt-0.5" />{c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-8">
                    {/* Rivals */}
                    <Section id="rivals">
                      <div className="bg-zinc-900/50 border border-zinc-900 p-7 rounded-[36px]">
                        <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-6">Primary Rivals</h4>
                        <div className="space-y-5">
                          {review.rivals?.map((r: any, i: number) => (
                            <div key={i} className="group space-y-1 border-b border-zinc-900 pb-4 last:border-0 last:pb-0">
                              <div className="flex justify-between items-center">
                                <span className="font-black text-white uppercase text-sm group-hover:text-orange-500 transition-colors">{r.name}</span>
                                <span className="text-xs font-bold text-zinc-600">{r.price}</span>
                              </div>
                              <p className="text-[10px] text-zinc-500 italic leading-snug">&ldquo;{r.why_choose}&rdquo;</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Section>

                    {/* Verdict */}
                    <div className="bg-orange-600 p-8 rounded-[36px] shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2" />
                      <h4 className="text-xs font-black uppercase mb-3 text-orange-200">The Verdict</h4>
                      <p className="text-lg font-bold leading-snug text-white">&ldquo;{review.verdict}&rdquo;</p>
                      <div className="mt-5 pt-5 border-t border-white/10">
                        <p className="text-[10px] font-black uppercase text-orange-100 mb-1">Ideal For</p>
                        <p className="text-xs font-bold text-white">{review.who_should_buy}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Section>

              {/* ── REDDIT OWNER QUOTES ── */}
              {review.reddit_highlights?.length > 0 && (
                <section className="bg-zinc-900/20 border border-zinc-900 p-8 md:p-12 rounded-[40px]">
                  <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-8 flex items-center gap-3">
                    <span className="text-2xl">💬</span> What Real Owners Say
                  </h3>
                  <div className="grid md:grid-cols-2 gap-5">
                    {review.reddit_highlights.map((quote: string, i: number) => (
                      <blockquote key={i} className="bg-zinc-950 rounded-2xl p-5 border-l-4 border-orange-500">
                        <p className="text-sm text-zinc-400 italic leading-relaxed">&ldquo;{quote}&rdquo;</p>
                        <cite className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-3 block not-italic">— Reddit Owner</cite>
                      </blockquote>
                    ))}
                  </div>
                </section>
              )}

              {/* ── FAQs ── */}
              <Section id="faqs" className="bg-zinc-900/20 border border-zinc-900 p-8 md:p-12 rounded-[40px]">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                  <HelpCircle className="text-orange-600" size={22} /> Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                  {review.faqs?.map((f: any, i: number) => (
                    <div key={i} className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex justify-between items-center p-5 text-left hover:bg-zinc-900 transition-colors"
                      >
                        <span className="font-bold text-sm text-zinc-300 pr-4">{f.q}</span>
                        <ChevronDown className={`shrink-0 transition-transform text-zinc-500 ${openFaq === i ? 'rotate-180' : ''}`} size={16} />
                      </button>
                      {openFaq === i && (
                        <div className="px-5 pb-5 text-sm text-zinc-500 leading-relaxed border-t border-zinc-900/50 pt-4">
                          {f.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="py-20 text-center border-t border-zinc-900">
        <Link href="/" className="text-zinc-700 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.5em]">
          Exit Catalog
        </Link>
      </div>
    </div>
  );
}
