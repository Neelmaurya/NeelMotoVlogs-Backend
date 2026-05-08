'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Search, Filter, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const BLOGS = [
  {
    id: 1,
    title: "10 Essential Gear Items for Long Distance Motorcycle Touring",
    excerpt: "Packing for a month-long trip on a bike is an art. Here's what I've learned after 50,000kms of riding through various terrains...",
    category: "Guides",
    image: "https://images.unsplash.com/photo-1471450364516-0c6f43f2999e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    readTime: "8 min read",
    date: "Oct 24, 2023",
  },
  {
    id: 2,
    title: "Why I Decided to Quit My Job and Travel Full-Time",
    excerpt: "It wasn't an easy decision, but it was the right one. Let's talk about the financial reality and emotional weight of being a full-time creator...",
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    readTime: "5 min read",
    date: "Oct 20, 2023",
  },
  {
    id: 3,
    title: "Finding Peace in the Mountains of Spiti Valley",
    excerpt: "The high-altitude desert of Spiti is unlike anywhere else on Earth. Here's my journey through the treacherous roads and stunning vistas...",
    category: "Adventures",
    image: "https://images.unsplash.com/photo-1544621100-2c32ae6aa480?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    readTime: "12 min read",
    date: "Oct 15, 2023",
  },
  {
    id: 4,
    title: "Exploring the Ancient Streets of Varanasi",
    excerpt: "Varanasi is the spiritual heart of India. In this blog, I share my experience witnessing the evening Ganga Aarti and exploring the ghats...",
    category: "Culture",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    readTime: "10 min read",
    date: "Sep 28, 2023",
  },
  {
    id: 5,
    title: "The Ultimate Guide to Budget Traveling in Southeast Asia",
    excerpt: "Southeast Asia is a backpacker's paradise. Learn how to travel comfortably for under $30 a day in Thailand, Vietnam, and Cambodia...",
    category: "Budget",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    readTime: "15 min read",
    date: "Sep 12, 2023",
  },
  {
    id: 6,
    title: "Top 5 Scenic Routes for Motorcyclists in India",
    excerpt: "From the Manali-Leh highway to the coastal roads of Kerala, these are the routes every rider must experience at least once...",
    category: "Moto Vlogs",
    image: "https://images.unsplash.com/photo-1558981852-426c6c22a060?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    readTime: "7 min read",
    date: "Aug 30, 2023",
  }
];

export default function BlogListPage() {
  return (
    <>
      <Header />
      <main className="flex-grow bg-zinc-950 pt-24 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Travel Stories</h1>
            <p className="text-zinc-400 text-lg">
              Deep dives, travel guides, and personal reflections from the road. Filter by category to find exactly what you're looking for.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 mb-12">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
              <input 
                type="text" 
                placeholder="Search stories..." 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-4 pl-12 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {['All', 'Adventures', 'Guides', 'Moto Vlogs', 'Lifestyle'].map((cat) => (
                <button 
                  key={cat}
                  className={`px-6 py-4 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${cat === 'All' ? 'bg-orange-600 border-orange-600 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BLOGS.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all group"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={blog.image} 
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                      {blog.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="flex items-center text-xs text-zinc-500 mb-4 space-x-4">
                    <span>{blog.date}</span>
                    <span className="flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{blog.readTime}</span>
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-orange-500 transition-colors leading-tight">
                    {blog.title}
                  </h3>
                  <p className="text-zinc-400 text-sm line-clamp-3 mb-8 leading-relaxed">
                    {blog.excerpt}
                  </p>
                  <Link 
                    href={`/blogs/${blog.id}`}
                    className="inline-flex items-center text-sm font-bold text-white group-hover:text-orange-500 transition-colors"
                  >
                    <span>Read Article</span>
                    <ChevronRight size={18} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
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
