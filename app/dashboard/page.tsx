'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/app/components/header';

interface Pool {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  pool_members: any[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [createdPools, setCreatedPools] = useState<Pool[]>([]);
  const [joinedPools, setJoinedPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchMyPools = async () => {
      try {
        const res = await fetch('/api/pools/my-pools');
        if (!res.ok) throw new Error('Failed to fetch pools');
        const data = await res.json();
        setCreatedPools(data.created || []);
        setJoinedPools(data.joined || []);
      } catch (error) {
        console.error('Error fetching pools:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchMyPools();
    }
  }, [session?.user?.id]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-slate-900 mb-2">Welcome, {session?.user?.name}!</h2>
            <p className="text-slate-600">Make your World Cup predictions and compete with friends</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/pools/create">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition cursor-pointer">
                <div className="text-4xl mb-3">➕</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Create Pool</h3>
                <p className="text-slate-600 text-sm">Start a new prediction pool with friends</p>
              </div>
            </Link>

            <Link href="/pools">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition cursor-pointer">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Public Pools</h3>
                <p className="text-slate-600 text-sm">Join public prediction pools</p>
              </div>
            </Link>

            <Link href="/pools/join">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition cursor-pointer">
                <div className="text-4xl mb-3">🔐</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Join with Code</h3>
                <p className="text-slate-600 text-sm">Join private pool using code</p>
              </div>
            </Link>
          </div>

          {/* My Pools Section */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">My Pools</h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-slate-600 text-sm">Loading pools...</p>
              </div>
            ) : createdPools.length === 0 && joinedPools.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
                <div className="text-4xl mb-3">🏜️</div>
                <p className="text-slate-600 mb-4">You haven't joined any pools yet</p>
                <div className="space-x-3">
                  <Link href="/pools/create" className="inline-block text-blue-600 hover:text-blue-700 font-medium">
                    Create pool →
                  </Link>
                  <Link href="/pools" className="inline-block text-blue-600 hover:text-blue-700 font-medium">
                    Join public pool →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Created Pools */}
                {createdPools.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-4">Created by You</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {createdPools.map((pool: any) => (
                        <Link key={pool.id} href={`/pools/${pool.id}`}>
                          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition cursor-pointer h-full">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="text-lg font-semibold text-slate-900 flex-1">{pool.name}</h5>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                                {pool.is_public ? 'Public' : 'Private'}
                              </span>
                            </div>
                            <p className="text-slate-600 text-sm mb-4 line-clamp-2">{pool.description || 'No description'}</p>
                            <div className="flex items-center text-sm text-slate-500">
                              <span>👥</span>
                              <span className="ml-2">{pool.pool_members?.length || 0} members</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Joined Pools */}
                {joinedPools.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-4">Joined</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {joinedPools.map((pool: any) => (
                        <Link key={pool.id} href={`/pools/${pool.id}`}>
                          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition cursor-pointer h-full">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="text-lg font-semibold text-slate-900 flex-1">{pool.name}</h5>
                              <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded font-medium">
                                {pool.is_public ? 'Public' : 'Private'}
                              </span>
                            </div>
                            <p className="text-slate-600 text-sm mb-4 line-clamp-2">{pool.description || 'No description'}</p>
                            <div className="flex items-center text-sm text-slate-500">
                              <span>👥</span>
                              <span className="ml-2">{pool.pool_members?.length || 0} members</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-12 bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">How it works</h3>
            <ol className="space-y-4 text-slate-700">
              <li className="flex items-start space-x-4">
                <span className="font-semibold text-blue-600 min-w-8">1</span>
                <span>Create or join a prediction pool</span>
              </li>
              <li className="flex items-start space-x-4">
                <span className="font-semibold text-blue-600 min-w-8">2</span>
                <span>Make predictions for each World Cup match (score & winner)</span>
              </li>
              <li className="flex items-start space-x-4">
                <span className="font-semibold text-blue-600 min-w-8">3</span>
                <span>Earn 2 points for correct score predictions</span>
              </li>
              <li className="flex items-start space-x-4">
                <span className="font-semibold text-blue-600 min-w-8">4</span>
                <span>Compete on the leaderboard and win the pool</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
