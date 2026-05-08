'use client';

import { useState } from 'react';
import { useGetMessagesQuery } from '@/store/services/contactApi';
import { 
  MessageSquare, 
  Search, 
  Trash2, 
  Mail,
  User,
  Clock
} from 'lucide-react';

export default function MessageCenter() {
  const { data: messages = [], isLoading } = useGetMessagesQuery();
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Message Center</h1>
        <p className="text-zinc-400 mt-1">Direct inquiries from your travel community.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Message List */}
        <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-9 pr-4 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto no-scrollbar">
            {isLoading ? (
              <div className="p-8 text-center text-zinc-500 text-sm">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">No messages yet.</div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {messages.map((msg) => (
                  <button 
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`w-full text-left p-4 hover:bg-zinc-800/50 transition-all flex flex-col gap-1 ${selectedMessage?.id === msg.id ? 'bg-orange-600/5 border-l-2 border-orange-600' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-xs font-bold uppercase tracking-wider ${msg.is_read ? 'text-zinc-500' : 'text-orange-500'}`}>
                        {msg.is_read ? 'Read' : 'New Inquiry'}
                      </span>
                      <span className="text-[10px] text-zinc-500">{new Date(msg.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className="text-sm font-bold text-white truncate">{msg.full_name}</span>
                    <span className="text-xs text-zinc-400 truncate">{msg.subject}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col h-[600px]">
          {selectedMessage ? (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-8 pb-8 border-b border-zinc-800">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-orange-500">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedMessage.full_name}</h3>
                    <p className="text-sm text-zinc-500">{selectedMessage.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-500 transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-grow">
                <div className="mb-6">
                  <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold block mb-2">Subject</span>
                  <p className="text-lg font-bold text-zinc-100">{selectedMessage.subject}</p>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold block mb-2">Message</span>
                  <div className="bg-zinc-800/30 border border-zinc-800 p-6 rounded-xl text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-zinc-800 flex justify-between items-center">
                <div className="flex items-center space-x-2 text-xs text-zinc-500">
                  <Clock size={14} />
                  <span>Received on {new Date(selectedMessage.created_at).toLocaleString()}</span>
                </div>
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center space-x-2">
                  <Mail size={16} />
                  <span>Reply via Email</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-zinc-600">
              <MessageSquare size={64} className="mb-4 opacity-10" />
              <p>Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
