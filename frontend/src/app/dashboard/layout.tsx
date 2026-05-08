'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { logout, setUser } from '@/store/slices/authSlice';
import { useGetMeQuery } from '@/store/services/authApi';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FileText, 
  Video, 
  MapPin, 
  Users, 
  MessageSquare, 
  Settings,
  LogOut,
  Bell,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: FileText, label: 'Blogs', href: '/dashboard/blogs' },
  { icon: Video, label: 'Videos', href: '/dashboard/videos' },
  { icon: MapPin, label: 'Destinations', href: '/dashboard/destinations' },
  { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
  { icon: Users, label: 'Team', href: '/dashboard/users' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user data if we have a token but no user object
  const { data: userData, isLoading: isUserLoading, isError } = useGetMeQuery(undefined, {
    skip: !token || !!user,
  });

  useEffect(() => {
    if (userData) {
      dispatch(setUser(userData));
    }
  }, [userData, dispatch]);

  useEffect(() => {
    if (!token || (isError && !isUserLoading)) {
      router.push('/login');
    }
  }, [token, isError, isUserLoading, router]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  if (!mounted || isUserLoading || (!user && token)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/50 hidden lg:flex flex-col">
        <div className="p-6">
          <Link href="/" className="text-xl font-bold tracking-tighter text-white">
            NEEL<span className="text-orange-500">MOTO</span> <span className="text-xs text-zinc-500 font-normal ml-2">CMS</span>
          </Link>
        </div>

        <nav className="flex-grow px-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all group"
            >
              <item.icon size={20} className="group-hover:text-orange-500 transition-colors" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-all w-full"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col">
        {/* Topbar */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center space-x-4 flex-grow max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type="text" 
                placeholder="Search analytics, blogs..." 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button className="text-zinc-400 hover:text-white relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-orange-600 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-bold text-white">{user.first_name || 'Admin'}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{user.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-orange-500 font-bold overflow-hidden">
                {user.profile_image ? (
                  <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{user.email[0].toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
