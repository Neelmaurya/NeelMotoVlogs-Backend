'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Play, ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative h-[90vh] w-full overflow-hidden flex items-center">
      {/* Background with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url("/hero-bike.png")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-orange-600/20 text-orange-500 text-xs font-bold tracking-widest uppercase mb-6 border border-orange-600/30">
              New Adventure Live
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
              Explore the <span className="text-orange-500">Unseen</span> Road.
            </h1>
            <p className="mt-6 text-lg text-zinc-300 leading-relaxed max-w-lg">
              Join Neel as he travels across continents on two wheels. Capturing raw adventures, cultures, and the spirit of freedom.
            </p>
            
            <div className="mt-10 flex flex-wrap gap-4">
              <Link 
                href="/videos"
                className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(234,88,12,0.4)]"
              >
                <Play size={18} fill="white" />
                <span>Watch Latest Vlog</span>
              </Link>
              <Link 
                href="/blogs"
                className="flex items-center space-x-2 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 hover:bg-zinc-700 text-white px-8 py-4 rounded-full font-bold transition-all"
              >
                <span>Read Stories</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-16 flex items-center space-x-8 text-zinc-500"
          >
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">50+</span>
              <span className="text-xs uppercase tracking-wider">Countries</span>
            </div>
            <div className="h-8 w-px bg-zinc-800"></div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">200k+</span>
              <span className="text-xs uppercase tracking-wider">Subscribers</span>
            </div>
            <div className="h-8 w-px bg-zinc-800"></div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">10M+</span>
              <span className="text-xs uppercase tracking-wider">Views</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
