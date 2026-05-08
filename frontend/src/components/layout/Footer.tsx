import Link from 'next/link';
import { Camera, Play, Send, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-white">
              NEEL<span className="text-orange-500">MOTO</span>
            </Link>
            <p className="mt-4 text-zinc-400 text-sm leading-relaxed">
              Capturing the world through my lens and sharing the adrenaline of the open road. Join the journey.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="https://www.instagram.com/neelmotovlogs/?hl=en" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-orange-500 transition-colors"><Camera size={20} /></a>
              <a href="https://www.youtube.com/@neel_MotoVlogs" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-orange-500 transition-colors"><Play size={20} /></a>
              <a href="#" className="text-zinc-400 hover:text-orange-500 transition-colors"><Send size={20} /></a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><Link href="/blogs" className="hover:text-white transition-colors">Travel Blogs</Link></li>
              <li><Link href="/videos" className="hover:text-white transition-colors">Video Gallery</Link></li>
              <li><Link href="/destinations" className="hover:text-white transition-colors">Destinations</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Neel</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Categories</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><Link href="/category/moto-vlogs" className="hover:text-white transition-colors">Moto Vlogs</Link></li>
              <li><Link href="/category/adventure" className="hover:text-white transition-colors">Adventure</Link></li>
              <li><Link href="/category/budget-travel" className="hover:text-white transition-colors">Budget Travel</Link></li>
              <li><Link href="/category/guides" className="hover:text-white transition-colors">Travel Guides</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Newsletter</h3>
            <p className="text-zinc-400 text-sm mb-4">Subscribe to get the latest adventure updates.</p>
            <form className="flex space-x-2">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-zinc-900 border border-zinc-800 rounded-md px-4 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button className="bg-orange-600 hover:bg-orange-700 text-white rounded-md p-2 transition-colors">
                <Mail size={18} />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center text-zinc-500 text-xs">
          <p>&copy; {new Date().getFullYear()} Neel MotoVlogs. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-zinc-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
