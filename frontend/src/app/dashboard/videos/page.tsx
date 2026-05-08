'use client';

import { useState } from 'react';
import { useGetVideosQuery } from '@/store/services/videoApi';
import { 
  Video, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Play, 
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function VideoManagement() {
  const { data: videos = [], isLoading } = useGetVideosQuery();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Video Management</h1>
          <p className="text-zinc-400 mt-1">Manage your YouTube integrations and vlogs.</p>
        </div>
        <Link 
          href="/dashboard/videos/new" 
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Add Video</span>
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Search videos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-zinc-500 text-xs uppercase tracking-widest border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-6 py-4 font-semibold">Video</th>
                <th className="px-6 py-4 font-semibold">YouTube ID</th>
                <th className="px-6 py-4 font-semibold">Views</th>
                <th className="px-6 py-4 font-semibold">Date Added</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    Loading videos...
                  </td>
                </tr>
              ) : filteredVideos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No videos found. Sync your YouTube channel to get started.
                  </td>
                </tr>
              ) : (
                filteredVideos.map((video) => (
                  <tr key={video.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-16 h-10 rounded bg-zinc-800 overflow-hidden shrink-0">
                          <img 
                            src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`} 
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Play size={12} className="text-white" fill="white" />
                          </div>
                        </div>
                        <span className="text-sm font-bold text-white group-hover:text-orange-500 transition-colors truncate max-w-xs">{video.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-xs font-mono text-zinc-500">
                        <Play size={14} className="text-red-500" />
                        <span>{video.youtube_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400 font-medium">{video.views_count}</td>
                    <td className="px-6 py-4 text-xs text-zinc-500 font-medium">
                      {new Date(video.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <a 
                          href={`https://youtube.com/watch?v=${video.youtube_id}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-all"
                        >
                          <ExternalLink size={18} />
                        </a>
                        <button className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-all">
                          <Edit size={18} />
                        </button>
                        <button className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
