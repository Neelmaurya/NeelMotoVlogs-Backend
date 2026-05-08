'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { setCredentials } from '@/store/slices/authSlice';
import { useLoginMutation, useGetMeQuery } from '@/store/services/authApi';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, Lock, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const dispatch = useDispatch();
  const router = useRouter();
  const [loginMutation] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      // 1. Perform Login
      const result = await loginMutation({ email, password }).unwrap();
      const { access, refresh } = result;
      
      // 2. Fetch User Data (we need this for the Redux state)
      // Since we just got the token, we can use the regular axios instance or wait for the layout to fetch it.
      // But it's better to fetch it here to ensure immediate state update before redirect.
      const userResponse = await api.get('users/me/', {
        headers: { Authorization: `Bearer ${access}` }
      });
      
      // 3. Update Redux State
      dispatch(setCredentials({ 
        user: userResponse.data, 
        access, 
        refresh 
      }));
      
      // 4. Redirect to Dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.data?.detail || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-zinc-800/20 rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-3xl relative z-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold tracking-tighter text-white mb-2 inline-block">
            NEEL<span className="text-orange-500">MOTO</span>
          </Link>
          <h2 className="text-xl font-semibold text-zinc-100 mt-4">Welcome Back</h2>
          <p className="text-zinc-400 text-sm mt-2">Manage your travel stories and videos.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@neelmotovlogs.com"
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <p className="text-center text-zinc-500 text-sm mt-8">
          Not a creator? <Link href="/" className="text-orange-500 hover:underline">Back to Home</Link>
        </p>
      </motion.div>
    </div>
  );
}
