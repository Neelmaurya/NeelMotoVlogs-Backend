'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Play, FileText, ArrowLeft, Clock, Eye, Calendar, Video } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const CITY_CONTENT = {
  blogs: [
    {
      id: 1,
      title: "10 Essential Gear Items for Long Distance Motorcycle Touring",
      excerpt: "Packing for a month-long trip on a bike is an art...",
      image: "https://images.unsplash.com/photo-1471450364516-0c6f43f2999e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      readTime: "8 min read",
      date: "Oct 24, 2023",
    }
  ],
  videos: [
    {
      id: 1,
      title: "Solo Motorcycle Trip Across the Himalayas",
      thumbnail: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      views: "1.2M",
      date: "2 weeks ago",
      duration: "18:24",
    }
  ]
};

export default function CityDetailPage() {
  const params = useParams();
  const { country, state, city } = params;
  
  const formatSlug = (slug: string) => slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <>
      <Header />
      <main className="flex-grow bg-zinc-950 pt-24 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={`/destinations/${country}/${state}`} className="inline-flex items-center space-x-2 text-zinc-500 hover:text-white mb-12 transition-colors">
            <ArrowLeft size={16} />
            <span>Back to {formatSlug(state as string)}</span>
          </Link>

          <div className="max-w-3xl mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">{formatSlug(city as string)}</h1>
            <p className="text-zinc-400 text-lg">
              Explore all vlogs and travel stories from {formatSlug(city as string)}.
            </p>
          </div>

          <div className="space-y-16">
            {/* Related Videos */}
            <section>
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-orange-600/20 rounded-lg">
                  <Video size={20} className="text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Related Vlogs</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {CITY_CONTENT.videos.map((video) => (
                  <motion.div key={video.id} className="group cursor-pointer">
                    <div className="relative aspect-video overflow-hidden rounded-2xl border border-zinc-800">
                      <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center text-white"><Play fill="white" size={24} /></div>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-4 group-hover:text-orange-500 transition-colors">{video.title}</h3>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Related Blogs */}
            <section>
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <FileText size={20} className="text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Related Blogs</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {CITY_CONTENT.blogs.map((blog) => (
                  <motion.div key={blog.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all">
                    <div className="flex items-center text-xs text-zinc-500 mb-3 space-x-4">
                      <span>{blog.date}</span>
                      <span className="flex items-center space-x-1"><Clock size={12} /><span>{blog.readTime}</span></span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 hover:text-orange-500 transition-colors cursor-pointer">{blog.title}</h3>
                    <p className="text-zinc-400 text-sm line-clamp-2">{blog.excerpt}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

