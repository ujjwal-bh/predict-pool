'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

interface AuthFormProps {
  type: 'login' | 'signup';
  onSubmit: (data: any) => Promise<void>;
}

export function AuthForm({ type, onSubmit }: AuthFormProps) {
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError((err as Error).message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-6 shadow-lg">
            ⚽
          </div>
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">
            {type === 'login' ? '👋 Welcome Back' : '🎉 Let\'s Begin'}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {type === 'login'
              ? 'Sign in to your account'
              : 'Create your account to predict'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-200 text-sm font-medium flex items-start gap-3">
            <span className="text-lg">❌</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {type === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder={type === 'login' ? '••••••••' : 'Min 8 characters'}
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-400 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : type === 'login' ? (
                '🔓 Sign In'
              ) : (
                '✨ Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-[var(--border-color)]">
            {type === 'login' ? (
              <p className="text-center text-[var(--text-secondary)] text-sm">
                Don't have an account?{' '}
                <Link href="/signup" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors">
                  Create one free
                </Link>
              </p>
            ) : (
              <p className="text-center text-[var(--text-secondary)] text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors">
                  Sign in instead
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-xs text-[var(--text-tertiary)]">
          <p>🏆 FIFA World Cup 2026 Prediction Platform</p>
        </div>
      </div>
    </div>
  );
}
