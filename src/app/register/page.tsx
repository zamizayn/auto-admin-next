'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import { UserPlus, Mail, Lock, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { email, password });
      router.push('/login');
    } catch (err) {
      setError('Registration failed. The email might already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex gradient-mesh">
      {/* Left: Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface-950">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-600/20 via-transparent to-primary-900/30" />
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-16 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 backdrop-blur-sm border border-primary-400/20 flex items-center justify-center">
              <Sparkles className="text-primary-300" size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight">AutoAdmin</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
              Start building{' '}
              <span className="bg-gradient-to-r from-primary-300 to-primary-100 bg-clip-text text-transparent">
                in seconds.
              </span>
            </h1>
            <p className="mt-6 text-lg text-surface-300 leading-relaxed">
              Create your free account and instantly generate powerful admin dashboards from your existing databases.
            </p>
          </div>

          <p className="text-surface-500 text-sm">
            © 2026 AutoAdmin. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right: Register Form */}
      <div className="flex-1 flex-col flex items-center justify-center p-6 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-3 mb-12 lg:hidden">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-surface-900">AutoAdmin</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-surface-900 tracking-tight">Create your account</h2>
            <p className="text-surface-500 mt-2 text-base">Get started with AutoAdmin for free</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                <input
                  id="register-email"
                  type="email"
                  required
                  className="input-with-icon"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                <input
                  id="register-password"
                  type="password"
                  required
                  className="input-with-icon"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-surface-500">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
