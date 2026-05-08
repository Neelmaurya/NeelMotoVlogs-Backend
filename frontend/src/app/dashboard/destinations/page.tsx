'use client';

import { useState } from 'react';
import { useGetDestinationsQuery } from '@/store/services/destinationApi';
import { 
  MapPin, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Globe,
  Navigation,
  ChevronRight,
  FileText,
  Video
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DestinationManagement() {
  const { data: destinations = [], isLoading } = useGetDestinationsQuery();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDestinations = destinations.filter(dest => 
    dest.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Destination Manager</h1>
          <p className="text-zinc-400 mt-1">Organize your travel content by location.</p>
        </div>
        <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center space-x-2">
          <Plus size={18} />
          <span>Add Destination</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-600/10 rounded-lg text-blue-500">
              <Globe size={20} />
            </div>
            <h3 className="font-bold text-white">Countries</h3>
          </div>
          <p className="text-3xl font-bold text-white">4</p>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">Active Locations</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-600/10 rounded-lg text-orange-500">
              <MapPin size={20} />
            </div>
            <h3 className="font-bold text-white">States</h3>
          </div>
          <p className="text-3xl font-bold text-white">12</p>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">Regions Explored</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-emerald-600/10 rounded-lg text-emerald-500">
              <Navigation size={20} />
            </div>
            <h3 className="font-bold text-white">Cities</h3>
          </div>
          <p className="text-3xl font-bold text-white">45</p>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">Points of Interest</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Search locations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-zinc-500 text-xs uppercase tracking-widest border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Parent</th>
                <th className="px-6 py-4 font-semibold text-center">Content</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500">Loading...</td></tr>
              ) : filteredDestinations.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500">No destinations defined.</td></tr>
              ) : (
                filteredDestinations.map((dest) => (
                  <tr key={dest.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-white">{dest.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-500 font-bold uppercase tracking-wider">
                        {dest.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {dest.parent?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-3 text-xs text-zinc-500">
                        <span className="flex items-center space-x-1"><FileText size={12} /> <span>{dest.blogs_count}</span></span>
                        <span className="flex items-center space-x-1"><Video size={12} /> <span>{dest.videos_count}</span></span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-all"><Edit size={16} /></button>
                        <button className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
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
