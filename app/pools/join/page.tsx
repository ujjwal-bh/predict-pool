'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/app/components/header';
import Link from 'next/link';

export default function JoinPoolPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/pools/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode: joinCode.toUpperCase() }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      const data = await res.json();
      router.push(`/pools/${data.poolId}`);
    } catch (err) {
      setError((err as Error).message || 'Failed to join pool');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-6 inline-block">
            ← Back to Dashboard
          </Link>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Join Private Pool</h1>
            <p className="text-slate-600 mb-8">Enter the invite code to join a private pool</p>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-2">
                  Pool Code
                </label>
                <input
                  id="code"
                  type="text"
                  placeholder="e.g., ABC123"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  required
                  maxLength={10}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest font-semibold"
                />
                <p className="text-slate-500 text-sm mt-2">Ask the pool creator for the code</p>
              </div>

              <button
                type="submit"
                disabled={loading || !joinCode}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition"
              >
                {loading ? 'Joining...' : 'Join Pool'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">Looking for public pools?</h3>
              <Link href="/pools" className="text-blue-600 hover:text-blue-700 font-medium">
                Browse public pools →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
