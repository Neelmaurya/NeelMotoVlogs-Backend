'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { MapPin, ChevronRight, Globe } from 'lucide-react';
import Link from 'next/link';

const COUNTRIES = [
  {
    id: 1,
    name: "India",
    slug: "india",
    image: "https://images.unsplash.com/photo-1524492707943-5da36597c836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    statesCount: 28,
    citiesCount: 150,
  },
  {
    id: 2,
    name: "Vietnam",
    slug: "vietnam",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    statesCount: 58,
    citiesCount: 45,
  },
  {
    id: 3,
    name: "Thailand",
    slug: "thailand",
    image: "https://images.unsplash.com/photo-1528181304800-2f17382d1403?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    statesCount: 76,
    citiesCount: 60,
  },
  {
    id: 4,
    name: "Indonesia",
    slug: "indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    statesCount: 38,
    citiesCount: 80,
  }
];

export default function DestinationsPage() {
  return (
    <>
      <Header />
      <main className="flex-grow bg-zinc-950 pt-24 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Explore Destinations</h1>
            <p className="text-zinc-400 text-lg">
              Journey through the countries I've explored on my motorcycle. From the snowy peaks of the Himalayas to the tropical forests of Southeast Asia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {COUNTRIES.map((country, index) => (
              <motion.div
                key={country.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer"
              >
                <Link href={`/destinations/${country.slug}`}>
                  <img 
                    src={country.image} 
                    alt={country.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
                  
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex items-center space-x-2 text-orange-500 mb-2">
                      <Globe size={18} />
                      <span className="text-xs font-bold uppercase tracking-widest">Country Guide</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">{country.name}</h3>
                    
                    <div className="flex items-center space-x-6 text-sm text-zinc-300">
                      <span className="flex items-center space-x-2">
                        <MapPin size={14} className="text-zinc-500" />
                        <span>{country.statesCount} States</span>
                      </span>
                      <span className="flex items-center space-x-2">
                        <ChevronRight size={14} className="text-zinc-500" />
                        <span>{country.citiesCount} Cities</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="absolute top-8 right-8 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
                    <ChevronRight size={24} />
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
