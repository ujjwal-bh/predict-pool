'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Header } from '@/app/components/header';
import Link from 'next/link';

interface Pool {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  pool_members: any[];
}

export default function PoolsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const res = await fetch('/api/pools');
        if (!res.ok) throw new Error('Failed to fetch pools');
        const data = await res.json();
        setPools(data.filter((p: Pool) => p.is_public));
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchPools();
    }
  }, [session]);

  const handleJoin = async (poolId: string) => {
    try {
      const res = await fetch('/api/pools/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId }),
      });

      if (!res.ok) throw new Error('Failed to join pool');
      router.push(`/pools/${poolId}`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Public Pools</h1>
              <p className="text-slate-600">Join a public pool and start predicting</p>
            </div>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              ← Back to Dashboard
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading pools...</p>
            </div>
          ) : pools.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
              <div className="text-4xl mb-4">🏜️</div>
              <p className="text-slate-600 mb-4">No public pools available yet</p>
              <Link href="/pools/create" className="text-blue-600 hover:text-blue-700 font-medium">
                Create the first pool →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pools.map((pool: any) => (
                <div key={pool.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{pool.name}</h3>
                  <p className="text-slate-600 text-sm mb-4">{pool.description}</p>
                  <div className="mb-6 flex items-center space-x-2 text-sm text-slate-500">
                    <span>👥</span>
                    <span>{pool.pool_members?.length || 0} members</span>
                  </div>
                  <button
                    onClick={() => handleJoin(pool.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
                  >
                    Join Pool
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
