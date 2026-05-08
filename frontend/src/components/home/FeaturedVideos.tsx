'use client';

import { motion } from 'framer-motion';
import { Play, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';

const FEATURED_VIDEOS = [
  {
    id: 1,
    title: "Solo Motorcycle Trip Across the Himalayas",
    thumbnail: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    views: "1.2M",
    date: "2 weeks ago",
    duration: "18:24",
  },
  {
    id: 2,
    title: "Hidden Gems of Bali: Exploring Remote Villages",
    thumbnail: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    views: "850K",
    date: "1 month ago",
    duration: "12:15",
  },
  {
    id: 3,
    title: "Survival Challenge: 48 Hours in the Thar Desert",
    thumbnail: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    views: "2.5M",
    date: "3 months ago",
    duration: "24:00",
  }
];

const FeaturedVideos = () => {
  return (
    <section className="py-24 bg-zinc-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Featured Vlogs</h2>
            <p className="text-zinc-400 mt-2">The most popular adventures from the channel.</p>
          </div>
          <Link href="/videos" className="text-orange-500 hover:text-orange-400 font-semibold flex items-center space-x-1 transition-colors">
            <span>View all videos</span>
            <Play size={14} className="fill-current" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURED_VIDEOS.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative cursor-pointer"
            >
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-zinc-800">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-xl transform scale-0 group-hover:scale-100 transition-transform duration-300">
                    <Play size={24} fill="currentColor" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-white uppercase">
                  {video.duration}
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-lg font-bold text-white group-hover:text-orange-500 transition-colors line-clamp-2">
                  {video.title}
                </h3>
                <div className="flex items-center space-x-4 mt-2 text-xs text-zinc-500">
                  <span className="flex items-center space-x-1">
                    <Eye size={14} />
                    <span>{video.views} views</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>{video.date}</span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedVideos;
