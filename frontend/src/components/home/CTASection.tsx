'use client';

import { motion } from 'framer-motion';
import { Mail, Send } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-orange-600 z-0">
        <div className="absolute inset-0 bg-zinc-950/20 backdrop-blur-[2px]"></div>
        {/* Abstract shapes for design */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready for your next adventure?
            </h2>
            <p className="text-orange-100 text-lg mb-10 max-w-2xl mx-auto">
              Join 10,000+ travel enthusiasts who receive my weekly newsletter with exclusive travel tips, route maps, and gear discounts.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <div className="relative flex-grow">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-white text-zinc-900 rounded-full py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                  required
                />
              </div>
              <button 
                type="submit"
                className="bg-zinc-950 hover:bg-zinc-900 text-white px-8 py-4 rounded-full font-bold transition-all flex items-center justify-center space-x-2 shrink-0 shadow-xl"
              >
                <span>Subscribe</span>
                <Send size={18} />
              </button>
            </form>
            <p className="mt-4 text-xs text-orange-200">
              No spam, ever. Unsubscribe anytime with one click.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
