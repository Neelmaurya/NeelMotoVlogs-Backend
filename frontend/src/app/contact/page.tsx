'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Camera, Play } from 'lucide-react';

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="flex-grow bg-zinc-950 pt-24 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Get in Touch</h1>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                Have a question about a route? Want to collaborate? Or just want to say hi? Drop me a message below.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              {/* Contact Info */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
                  <h3 className="text-xl font-bold text-white mb-8">Contact Information</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-orange-600/10 rounded-xl">
                        <Mail size={20} className="text-orange-500" />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Email</p>
                        <p className="text-zinc-100 font-medium">hello@neelmotovlogs.com</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-blue-600/10 rounded-xl">
                        <Camera size={20} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Instagram</p>
                        <p className="text-zinc-100 font-medium">@neel_motovlogs</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-zinc-800 rounded-xl">
                        <MapPin size={20} className="text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Based In</p>
                        <p className="text-zinc-100 font-medium">New Delhi, India</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-12 border-t border-zinc-800">
                    <p className="text-sm text-zinc-400 mb-6 font-medium">Follow the Journey</p>
                    <div className="flex space-x-4">
                      <a href="https://www.instagram.com/neelmotovlogs/?hl=en" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-orange-600 hover:text-white transition-all">
                        <Camera size={18} />
                      </a>
                      <a href="https://www.youtube.com/@neel_MotoVlogs" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-orange-600 hover:text-white transition-all">
                        <Play size={18} />
                      </a>
                      <a href="#" className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-orange-600 hover:text-white transition-all">
                        <Send size={18} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-3">
                <form className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="John Doe"
                        className="w-full bg-zinc-800/50 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="john@example.com"
                        className="w-full bg-zinc-800/50 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Subject</label>
                    <input 
                      type="text" 
                      placeholder="Collaboration inquiry"
                      className="w-full bg-zinc-800/50 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Message</label>
                    <textarea 
                      rows={6}
                      placeholder="Your message here..."
                      className="w-full bg-zinc-800/50 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all resize-none"
                    ></textarea>
                  </div>

                  <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 group">
                    <span>Send Message</span>
                    <Send size={18} className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
