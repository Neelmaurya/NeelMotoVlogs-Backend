'use client';

import { motion } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const LATEST_BLOGS = [
  {
    id: 1,
    title: "10 Essential Gear Items for Long Distance Motorcycle Touring",
    excerpt: "Packing for a month-long trip on a bike is an art. Here's what I've learned after 50,000kms...",
    category: "Guides",
    image: "https://images.unsplash.com/photo-1471450364516-0c6f43f2999e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    readTime: "8 min read",
    date: "Oct 24, 2023",
  },
  {
    id: 2,
    title: "Why I Decided to Quit My Job and Travel Full-Time",
    excerpt: "It wasn't an easy decision, but it was the right one. Let's talk about the reality of being a travel creator...",
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    readTime: "5 min read",
    date: "Oct 20, 2023",
  },
  {
    id: 3,
    title: "Finding Peace in the Mountains of Spiti Valley",
    excerpt: "The high-altitude desert of Spiti is unlike anywhere else on Earth. Here's my emotional journey...",
    category: "Adventures",
    image: "https://images.unsplash.com/photo-1544621100-2c32ae6aa480?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    readTime: "12 min read",
    date: "Oct 15, 2023",
  }
];

const LatestBlogs = () => {
  return (
    <section className="py-24 bg-zinc-900/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Latest Stories</h2>
            <p className="text-zinc-400 mt-2">Deep dives, travel guides, and personal reflections.</p>
          </div>
          <Link href="/blogs" className="text-orange-500 hover:text-orange-400 font-semibold flex items-center space-x-1 transition-colors">
            <span>Read all blogs</span>
            <ChevronRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {LATEST_BLOGS.map((blog, index) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all group"
            >
              <div className="relative h-56 overflow-hidden">
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
              
              <div className="p-6">
                <div className="flex items-center text-xs text-zinc-500 mb-3 space-x-4">
                  <span>{blog.date}</span>
                  <span className="flex items-center space-x-1">
                    <Clock size={12} />
                    <span>{blog.readTime}</span>
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-500 transition-colors">
                  {blog.title}
                </h3>
                <p className="text-zinc-400 text-sm line-clamp-2 mb-6">
                  {blog.excerpt}
                </p>
                <Link 
                  href={`/blogs/${blog.id}`}
                  className="inline-flex items-center text-sm font-bold text-white group-hover:text-orange-500 transition-colors"
                >
                  <span>Read Article</span>
                  <ChevronRight size={16} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestBlogs;
