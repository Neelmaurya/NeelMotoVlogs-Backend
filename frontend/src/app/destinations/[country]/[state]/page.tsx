'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const CITIES = [
  { id: 1, name: "Manali", slug: "manali", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 2, name: "Shimla", slug: "shimla", image: "https://images.unsplash.com/photo-1597079910443-60c43fc4f729?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 3, name: "Kasol", slug: "kasol", image: "https://images.unsplash.com/photo-1617469165786-8007eda3caa7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 4, name: "Spiti Valley", slug: "spiti-valley", image: "https://images.unsplash.com/photo-1544621100-2c32ae6aa480?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
];

export default function StateDetailPage() {
  const params = useParams();
  const { country, state } = params;
  
  const formatSlug = (slug: string) => slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <>
      <Header />
      <main className="flex-grow bg-zinc-950 pt-24 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={`/destinations/${country}`} className="inline-flex items-center space-x-2 text-zinc-500 hover:text-white mb-12 transition-colors">
            <ArrowLeft size={16} />
            <span>Back to {formatSlug(country as string)}</span>
          </Link>

          <div className="max-w-3xl mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">{formatSlug(state as string)}</h1>
            <p className="text-zinc-400 text-lg">
              Explore the iconic cities and hidden gems of {formatSlug(state as string)}. Each destination offers unique stories and adventures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CITIES.map((city, index) => (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer border border-zinc-800"
              >
                <Link href={`/destinations/${country}/${state}/${city.slug}`}>
                  <img 
                    src={city.image} 
                    alt={city.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40"></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-2xl font-bold text-white group-hover:text-orange-500 transition-colors">{city.name}</h3>
                  </div>
                  
                  <div className="absolute bottom-4 right-4 text-xs font-bold text-zinc-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    View Content
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
