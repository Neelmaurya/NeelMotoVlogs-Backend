'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { 
  Users, 
  Eye, 
  FileText, 
  Video, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Plus,
  ExternalLink,
  Play
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const stats = [
  { label: 'Total Views', value: '4.2K', change: '+2.4%', trend: 'up', icon: Eye },
  { label: 'Blog Posts', value: '4', change: '+1', trend: 'up', icon: FileText },
  { label: 'YouTube Videos', value: '29', change: '+2', trend: 'up', icon: Video },
  { label: 'Subscribers', value: '41', change: '+5', trend: 'up', icon: Users },
];

export default function DashboardOverview() {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-zinc-400 mt-1">Welcome back, {user?.first_name || 'Neel'}. Your community is growing!</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/dashboard/blogs/new" className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-zinc-700">
            Write Blog
          </Link>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 shadow-lg shadow-orange-900/20">
            <Plus size={18} />
            <span>Upload Video</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-all shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-zinc-800 rounded-xl">
                <stat.icon size={24} className="text-orange-500" />
              </div>
              <div className={`flex items-center space-x-1 text-xs font-bold ${stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                <span>{stat.change}</span>
                {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
            </div>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Vlogs */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-white">Latest from YouTube</h3>
              <Link href="/dashboard/videos" className="text-orange-500 text-sm font-bold hover:underline flex items-center space-x-1">
                <span>View All</span>
                <ChevronRight size={16} />
              </Link>
            </div>
            <div className="space-y-4">
              {[
                { title: "Shri Kalpeshwar Mahadev Temple | Panch Kedar Journey", views: "1K", date: "Recently", id: "n1" },
                { title: "Shri Kalpeshwar Track #panchkedar Trekking Guide", views: "383", date: "Recently", id: "n2" },
                { title: "Buda Madhyamaheshwar Track | Spiritual Trekking", views: "176", date: "Recently", id: "n3" },
                { title: "Shri Madmaheshwar Track | Raindrops in Mountains", views: "113", date: "Recently", id: "n4" },
              ].map((vlog) => (
                <div key={vlog.id} className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all group">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-12 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                      <Play size={20} className="text-zinc-600 group-hover:text-orange-500 transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-orange-500 transition-colors line-clamp-1">{vlog.title}</h4>
                      <p className="text-xs text-zinc-500 mt-1">{vlog.views} views • {vlog.date}</p>
                    </div>
                  </div>
                  <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                    <ExternalLink size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Chart Placeholder */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-white">Audience Growth</h3>
              <div className="flex bg-zinc-800 rounded-lg p-1">
                <button className="px-3 py-1 text-xs font-bold bg-zinc-700 text-white rounded-md">7D</button>
                <button className="px-3 py-1 text-xs font-bold text-zinc-500">30D</button>
              </div>
            </div>
            <div className="h-48 flex items-end justify-between px-4 pb-2 border-b border-zinc-800">
              {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                <div key={i} className="w-8 bg-orange-600/20 rounded-t-lg group relative">
                  <div 
                    className="absolute bottom-0 w-full bg-orange-600 rounded-t-lg transition-all duration-1000 group-hover:bg-orange-500" 
                    style={{ height: `${h}%` }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">AI Tools</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all group text-left">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-600/10 rounded-lg">
                    <FileText size={18} className="text-orange-500" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-zinc-200 block">AI Blog Assistant</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">3 Drafts Pending</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-zinc-600 group-hover:text-white transition-colors" />
              </button>
              
              <button className="w-full flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all group text-left">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-600/10 rounded-lg">
                    <Video size={18} className="text-blue-500" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-zinc-200 block">Scene Tagging</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">1 New Upload</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-zinc-600 group-hover:text-white transition-colors" />
              </button>
            </div>
            
            <div className="mt-8 p-6 bg-orange-600/10 rounded-2xl border border-orange-600/20 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-600/10 rounded-full blur-2xl"></div>
              <p className="text-xs text-orange-400 font-bold uppercase tracking-widest mb-2 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                <span>Pro Tip</span>
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Your latest Zanskar vlog is trending! Consider writing a blog post with the specific route map to capture search traffic.
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-2xl p-8 text-white shadow-xl shadow-orange-950/20">
            <h3 className="text-lg font-bold mb-2">Upgrade to Pro</h3>
            <p className="text-orange-100 text-sm mb-6">Get advanced AI features, unlimited storage, and custom domain support.</p>
            <button className="w-full bg-white text-orange-600 py-3 rounded-xl font-bold text-sm hover:bg-orange-50 transition-all">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
