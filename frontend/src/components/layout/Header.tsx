'use client';

import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const Header = () => {
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-white">
              NEEL<span className="text-orange-500">MOTO</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link href="/blogs" className="text-zinc-400 hover:text-white transition-colors">Blogs</Link>
            <Link href="/videos" className="text-zinc-400 hover:text-white transition-colors">Videos</Link>
            <Link href="/destinations" className="text-zinc-400 hover:text-white transition-colors">Destinations</Link>
            <Link href="/contact" className="text-zinc-400 hover:text-white transition-colors">Contact</Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {!mounted ? (
              <div className="w-24 h-8 bg-zinc-800 rounded-full animate-pulse"></div>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors">
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link 
                href="/login"
                className="rounded-full bg-orange-600 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-700 transition-all shadow-[0_0_20px_rgba(234,88,12,0.3)]"
              >
                Sign In
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-400 hover:text-white">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-zinc-900 border-b border-zinc-800"
          >
            <div className="space-y-1 px-4 pb-3 pt-2">
              <Link href="/blogs" className="block rounded-md px-3 py-2 text-base font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white">Blogs</Link>
              <Link href="/videos" className="block rounded-md px-3 py-2 text-base font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white">Videos</Link>
              <Link href="/destinations" className="block rounded-md px-3 py-2 text-base font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white">Destinations</Link>
              <Link href="/contact" className="block rounded-md px-3 py-2 text-base font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white">Contact</Link>
              {isAuthenticated ? (
                <Link href="/dashboard" className="block rounded-md px-3 py-2 text-base font-medium text-orange-500">Dashboard</Link>
              ) : (
                <Link href="/login" className="block rounded-md px-3 py-2 text-base font-medium bg-orange-600 text-white text-center mt-4">Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
