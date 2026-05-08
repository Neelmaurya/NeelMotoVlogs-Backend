'use client';

import { useState } from 'react';
import { useGetBlogsQuery } from '@/store/services/blogApi';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function BlogManagement() {
  const { data: blogs = [], isLoading } = useGetBlogsQuery();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Blog Management</h1>
          <p className="text-zinc-400 mt-1">Create, edit, and manage your travel stories.</p>
        </div>
        <Link 
          href="/dashboard/blogs/new" 
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>New Post</span>
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Search blogs..." 
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
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Views</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                      <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No blogs found. Start by creating a new post.
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                          <FileText size={20} className="text-zinc-500" />
                        </div>
                        <span className="text-sm font-bold text-white group-hover:text-orange-500 transition-colors truncate max-w-xs">{blog.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 font-medium">
                        {blog.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5">
                        {blog.status === 'PUBLISHED' ? (
                          <>
                            <CheckCircle size={14} className="text-emerald-500" />
                            <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Published</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={14} className="text-zinc-500" />
                            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Draft</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400 font-medium">{blog.views_count}</td>
                    <td className="px-6 py-4 text-xs text-zinc-500 font-medium">
                      {new Date(blog.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
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
