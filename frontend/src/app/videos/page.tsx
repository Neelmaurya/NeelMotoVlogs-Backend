'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Search, Play, Calendar, Eye, Clock } from 'lucide-react';
import Link from 'next/link';

const VIDEOS = [
  {
    id: 1,
    title: "Solo Motorcycle Trip Across the Himalayas",
    thumbnail: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    views: "1.2M",
    date: "2 weeks ago",
    duration: "18:24",
    type: "Long Form"
  },
  {
    id: 2,
    title: "Hidden Gems of Bali: Exploring Remote Villages",
    thumbnail: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    views: "850K",
    date: "1 month ago",
    duration: "12:15",
    type: "Long Form"
  },
  {
    id: 3,
    title: "Survival Challenge: 48 Hours in the Thar Desert",
    thumbnail: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    views: "2.5M",
    date: "3 months ago",
    duration: "24:00",
    type: "Long Form"
  },
  {
    id: 4,
    title: "The Ultimate Guide to Leh-Ladakh Preparation",
    thumbnail: "https://images.unsplash.com/photo-1544621100-2c32ae6aa480?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    views: "500K",
    date: "4 months ago",
    duration: "15:45",
    type: "Guide"
  },
  {
    id: 5,
    title: "Exploring the Ancient Streets of Varanasi - Short",
    thumbnail: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    views: "3.2M",
    date: "1 week ago",
    duration: "0:58",
    type: "Short"
  },
  {
    id: 6,
    title: "My New Riding Gear for the 2024 Season",
    thumbnail: "https://images.unsplash.com/photo-1558981852-426c6c22a060?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    views: "300K",
    date: "2 months ago",
    duration: "10:20",
    type: "Gear"
  }
];

export default function VideoGalleryPage() {
  return (
    <>
      <Header />
      <main className="flex-grow bg-zinc-950 pt-24 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Video Gallery</h1>
            <p className="text-zinc-400 text-lg">
              Cinematic adventures, moto vlogs, and shorts. Experience the journey in high definition.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 mb-12">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
              <input 
                type="text" 
                placeholder="Search videos..." 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-4 pl-12 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {['All', 'Long Form', 'Shorts', 'Guides', 'Gear'].map((type) => (
                <button 
                  key={type}
                  className={`px-6 py-4 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${type === 'All' ? 'bg-orange-600 border-orange-600 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {VIDEOS.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-video overflow-hidden rounded-2xl border border-zinc-800">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-2xl transform scale-0 group-hover:scale-100 transition-transform duration-300">
                      <Play size={32} fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/80 px-3 py-1.5 rounded-lg text-xs font-bold text-white tracking-wider uppercase">
                    {video.duration}
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-widest rounded border border-zinc-700">
                      {video.type}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors line-clamp-2 leading-tight">
                    {video.title}
                  </h3>
                  <div className="flex items-center space-x-6 mt-4 text-xs text-zinc-500 font-medium">
                    <span className="flex items-center space-x-2">
                      <Eye size={14} className="text-zinc-600" />
                      <span>{video.views} views</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <Calendar size={14} className="text-zinc-600" />
                      <span>{video.date}</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
