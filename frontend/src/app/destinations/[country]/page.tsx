'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const STATES = [
  { id: 1, name: "Himachal Pradesh", slug: "himachal-pradesh", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 2, name: "Ladakh", slug: "ladakh", image: "https://images.unsplash.com/photo-1581791534721-e599df4417f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 3, name: "Rajasthan", slug: "rajasthan", image: "https://images.unsplash.com/photo-1524230507669-e29a01763f05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 4, name: "Kerala", slug: "kerala", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
];

export default function CountryDetailPage() {
  const params = useParams();
  const countrySlug = params.country as string;
  const countryName = countrySlug.charAt(0).toUpperCase() + countrySlug.slice(1);

  return (
    <>
      <Header />
      <main className="flex-grow bg-zinc-950 pt-24 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/destinations" className="inline-flex items-center space-x-2 text-zinc-500 hover:text-white mb-12 transition-colors">
            <ArrowLeft size={16} />
            <span>Back to Destinations</span>
          </Link>

          <div className="max-w-3xl mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Explore {countryName}</h1>
            <p className="text-zinc-400 text-lg">
              Discover the diverse regions and states of {countryName}. Each with its own unique culture, landscapes, and riding experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STATES.map((state, index) => (
              <motion.div
                key={state.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer border border-zinc-800"
              >
                <Link href={`/destinations/${countrySlug}/${state.slug}`}>
                  <img 
                    src={state.image} 
                    alt={state.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
                  
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-xl font-bold text-white mb-2">{state.name}</h3>
                    <div className="flex items-center text-xs text-orange-500 font-bold uppercase tracking-widest">
                      <span>Explore Cities</span>
                      <ChevronRight size={14} className="ml-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
