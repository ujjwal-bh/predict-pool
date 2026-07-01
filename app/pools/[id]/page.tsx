'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/app/components/header';
import { MatchPredictionCard } from '@/app/components/match-prediction-card';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Pool {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  join_code: string;
  pool_members: any[];
  creator_id: string;
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  email: string;
  totalPoints: number;
  correctPredictions: number;
  totalPredictions: number;
}

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  stage: string;
  group_name: string | null;
}

interface Prediction {
  id: string;
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_winner: string;
}

export default function PoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [pool, setPool] = useState<Pool | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Map<string, Prediction>>(new Map());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeMatchTab, setActiveMatchTab] = useState<'live' | 'upcoming' | 'completed'>('upcoming');

  useEffect(() => {
    const fetchPool = async () => {
      try {
        const res = await fetch(`/api/pools?id=${params.id}`);
        if (!res.ok) throw new Error('Pool not found');
        setPool(await res.json());
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchPool();
  }, [params.id]);

  useEffect(() => {
    const fetchMatches = async () => {
      setMatchesLoading(true);
      try {
        const res = await fetch('/api/matches');
        if (!res.ok) throw new Error('Failed to fetch matches');
        const data = await res.json();
        setMatches(data.sort((a: Match, b: Match) => +new Date(a.match_date) - +new Date(b.match_date)));
      } catch (err) {
        console.error(err);
      } finally {
        setMatchesLoading(false);
      }
    };
    fetchMatches();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchPredictions = async () => {
      try {
        const res = await fetch(`/api/predictions?poolId=${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch predictions');
        const data: Prediction[] = await res.json();
        setPredictions(new Map(data.map((p: any) => [p.match_id, p])));
      } catch (err) {
        console.error(err);
      }
    };
    fetchPredictions();
  }, [params.id, session?.user?.id]);

  useEffect(() => {
    if (!params.id) return;
    const fetchLeaderboard = async () => {
      setLeaderboardLoading(true);
      try {
        const res = await fetch(`/api/leaderboard?poolId=${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        setLeaderboard(await res.json());
      } catch (err) {
        console.error(err);
        setLeaderboard([]);
      } finally {
        setLeaderboardLoading(false);
      }
    };
    fetchLeaderboard();
  }, [params.id]);

  const handleCopyCode = () => {
    if (!pool?.join_code) return;
    navigator.clipboard.writeText(pool.join_code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDeletePool = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/pools/${params.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error);
      router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message);
      setShowDeleteModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeavePool = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/pools/${params.id}/leave`, { method: 'POST' });
      if (!res.ok) throw new Error((await res.json()).error);
      router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message);
      setShowLeaveModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePredictionSubmit = async (
    matchId: string,
    prediction: { predicted_home_score: number; predicted_away_score: number; predicted_winner: string }
  ) => {
    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId: params.id, matchId, ...prediction }),
      });
      if (!res.ok) throw new Error('Failed to save prediction');
      const data = await res.json();
      predictions.set(matchId, data);
      setPredictions(new Map(predictions));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const isCreator = session?.user?.id === pool?.creator_id;
  const now = new Date();
  const liveMatches = matches
    .filter(m => m.status === 'pending' && new Date(m.match_date) <= now)
    .sort((a, b) => +new Date(a.match_date) - +new Date(b.match_date));
  const upcomingMatches = matches
    .filter(m => m.status === 'pending' && new Date(m.match_date) > now)
    .sort((a, b) => +new Date(a.match_date) - +new Date(b.match_date));
  const completedMatches = matches
    .filter(m => m.status === 'completed')
    .sort((a, b) => +new Date(b.match_date) - +new Date(a.match_date));

  const Spinner = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Spinner label="Loading pool…" />
          </div>
        </div>
      </>
    );
  }

  if (error || !pool) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 mb-6 transition-colors"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Dashboard
            </Link>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
              {error || 'Pool not found'}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 mb-8 transition-colors"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Dashboard
          </Link>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-6">
              {error}
            </div>
          )}

          {/* Hero section */}
          <div className="mb-12">
            <div className="flex items-start justify-between gap-8 mb-6">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Prediction Pool
                </p>
                <h1 className="text-4xl font-bold text-slate-900 mb-3">{pool.name}</h1>
                {pool.description && (
                  <p className="text-base text-slate-600 max-w-lg">{pool.description}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-4xl font-bold text-slate-900">{pool.pool_members?.length || 0}</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Members</p>
              </div>
            </div>

            {/* Invite code section */}
            {!pool.is_public && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Invite Code</p>
                    <p className="text-xs text-slate-500 mt-1">Share with friends to join</p>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      copySuccess
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {copySuccess ? (
                      <>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="9" y="9" width="13" height="13" rx="2" />
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </svg>
                        {pool.join_code}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              {isCreator ? (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Delete Pool
                </button>
              ) : (
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Leave Pool
                </button>
              )}
            </div>
          </div>

 <div className="md:hidden mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                🏆 Leaderboard
              </h2>

              {leaderboardLoading ? (
                <Spinner label="Loading standings…" />
              ) : leaderboard.length === 0 ? (
                <div className="bg-slate-50 rounded-lg p-8 text-center border border-slate-200">
                  <p className="text-xl mb-2">📊</p>
                  <p className="font-semibold text-slate-900 mb-1">No standings yet</p>
                  <p className="text-sm text-slate-600">Appears once members predict</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="grid grid-cols-12 gap-2 bg-slate-50 px-4 py-3 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <div className="col-span-2">#</div>
                    <div className="col-span-7">Player</div>
                    <div className="col-span-3 text-right">Pts</div>
                  </div>
                  {leaderboard.map((e: any, i: number) => (
                    <div
                      key={e.userId}
                      className={`grid grid-cols-12 gap-2 px-4 py-3 border-b border-slate-100 items-center transition-colors ${
                        e.userId === session?.user?.id ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="col-span-2 text-sm font-bold">
                        {i === 0 && '🥇'}
                        {i === 1 && '🥈'}
                        {i === 2 && '🥉'}
                        {i > 2 && <span className="text-slate-600">#{i + 1}</span>}
                      </div>
                      <div className="col-span-7 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {e.name}
                          {e.userId === session?.user?.id && (
                            <span className="ml-2 text-xs font-bold bg-blue-200 text-blue-800 px-2 py-0.5 rounded inline">
                              you
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{e.email}</p>
                      </div>
                      <div className="col-span-3 text-right text-sm font-bold text-blue-600">
                        {e.totalPoints}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          {/* Main content area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Matches */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="flex gap-2 mb-8 border-b border-slate-200">
                {(
                  [
                    ['live', 'Live', liveMatches.length],
                    ['upcoming', 'Upcoming', upcomingMatches.length],
                    ['completed', 'Completed', completedMatches.length],
                  ] as const
                ).map(([key, label, count]) => (
                  <button
                    key={key}
                    onClick={() => setActiveMatchTab(key)}
                    className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                      activeMatchTab === key
                        ? 'border-blue-600 text-slate-900'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {label}
                    <span className="ml-2 text-xs font-medium text-slate-500">
                      ({count})
                    </span>
                  </button>
                ))}
              </div>

              {matchesLoading ? (
                <Spinner label="Loading matches…" />
              ) : activeMatchTab === 'live' ? (
                liveMatches.length === 0 ? (
                  <div className="bg-slate-50 rounded-lg p-12 text-center border border-slate-200">
                    <p className="text-2xl mb-3">📡</p>
                    <p className="font-semibold text-slate-900 mb-1">No live matches</p>
                    <p className="text-sm text-slate-600">Check back when a match is in progress</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {liveMatches.map((m: any) => (
                      <div
                        key={m.id}
                        className="bg-white border border-red-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="bg-red-50 px-4 py-3 flex items-center gap-2 border-b border-red-200">
                          <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                          <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">Live</span>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="font-semibold text-slate-900 text-sm">{m.home_team}</p>
                            <p className="text-2xl font-bold text-slate-900">{m.home_score ?? '–'}</p>
                          </div>
                          <p className="text-center text-xs text-slate-500 font-medium mb-3">vs</p>
                          <div className="flex items-center justify-between mb-3">
                            <p className="font-semibold text-slate-900 text-sm">{m.away_team}</p>
                            <p className="text-2xl font-bold text-slate-900">{m.away_score ?? '–'}</p>
                          </div>
                          <p className="text-xs text-slate-500 text-center pt-3 border-t border-slate-200">
                            {new Date(m.match_date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : activeMatchTab === 'upcoming' ? (
                upcomingMatches.length === 0 ? (
                  <div className="bg-slate-50 rounded-lg p-12 text-center border border-slate-200">
                    <p className="text-2xl mb-3">📅</p>
                    <p className="font-semibold text-slate-900 mb-1">No upcoming matches</p>
                    <p className="text-sm text-slate-600">All matches have started or finished</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
                      <span className="text-lg shrink-0">💡</span>
                      <p className="text-sm text-blue-900">
                        <strong>How to predict:</strong> Use + / − to set scores and hit Save. Edit any time before kick-off.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {upcomingMatches.map((m: any) => (
                        <MatchPredictionCard
                          key={m.id}
                          match={m}
                          initialPrediction={predictions.get(m.id) as any}
                          onSubmit={(p: any) => handlePredictionSubmit(m.id, p)}
                        />
                      ))}
                    </div>
                  </>
                )
              ) : (
                completedMatches.length === 0 ? (
                  <div className="bg-slate-50 rounded-lg p-12 text-center border border-slate-200">
                    <p className="text-2xl mb-3">✅</p>
                    <p className="font-semibold text-slate-900 mb-1">No completed matches</p>
                    <p className="text-sm text-slate-600">Results will show up here as matches finish</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {completedMatches.map((m: any) => {
                      const pred = predictions.get(m.id);
                      return (
                        <div
                          key={m.id}
                          className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                              {m.group_name || m.stage}
                            </p>
                            <span className={`text-xs font-bold  text-white px-2.5 py-1 rounded ${(pred &&(pred?.predicted_home_score > pred?.predicted_away_score && m.home_score > m.away_score) || (pred && pred?.predicted_away_score > pred?.predicted_home_score && m.away_score > m.home_score) || (pred && pred?.predicted_home_score === pred?.predicted_away_score && m.home_score === m.away_score)) ? ' bg-green-700' : pred ? 'bg-red-700' : 'bg-slate-400'}`}>
                              Final
                            </span>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3"> 
                              <p className="font-semibold text-slate-900 text-sm">{m.home_team}</p>
                              <p className="text-2xl font-bold text-slate-900">{m.home_score ?? '–'}</p>
                            </div>
                            <p className="text-center text-xs text-slate-500 font-medium mb-3">vs</p>
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-slate-900 text-sm">{m.away_team}</p>
                              <p className="text-2xl font-bold text-slate-900">{m.away_score ?? '–'}</p>
                            </div>
                            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200">
                              <p className="text-xs text-slate-500">
                                {new Date(m.match_date).toLocaleDateString()}
                              </p>
                              {pred && (
                                <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded border border-blue-200">
                                  {pred.predicted_home_score}–{pred.predicted_away_score}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>

            {/* Leaderboard */}
            <div className="hidden md:block lg:col-span-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                🏆 Leaderboard
              </h2>

              {leaderboardLoading ? (
                <Spinner label="Loading standings…" />
              ) : leaderboard.length === 0 ? (
                <div className="bg-slate-50 rounded-lg p-8 text-center border border-slate-200">
                  <p className="text-xl mb-2">📊</p>
                  <p className="font-semibold text-slate-900 mb-1">No standings yet</p>
                  <p className="text-sm text-slate-600">Appears once members predict</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="grid grid-cols-12 gap-2 bg-slate-50 px-4 py-3 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <div className="col-span-2">#</div>
                    <div className="col-span-7">Player</div>
                    <div className="col-span-3 text-right">Pts</div>
                  </div>
                  {leaderboard.map((e: any, i: number) => (
                    <div
                      key={e.userId}
                      className={`grid grid-cols-12 gap-2 px-4 py-3 border-b border-slate-100 items-center transition-colors ${
                        e.userId === session?.user?.id ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="col-span-2 text-sm font-bold">
                        {i === 0 && '🥇'}
                        {i === 1 && '🥈'}
                        {i === 2 && '🥉'}
                        {i > 2 && <span className="text-slate-600">#{i + 1}</span>}
                      </div>
                      <div className="col-span-7 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {e.name}
                          {e.userId === session?.user?.id && (
                            <span className="ml-2 text-xs font-bold bg-blue-200 text-blue-800 px-2 py-0.5 rounded inline">
                              you
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{e.email}</p>
                      </div>
                      <div className="col-span-3 text-right text-sm font-bold text-blue-600">
                        {e.totalPoints}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete modal */}
        {showDeleteModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          >
            <div
              className="bg-white rounded-lg max-w-sm w-full p-8 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-3xl mb-4">🗑️</p>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Delete "{pool.name}"?</h2>
              <p className="text-sm text-slate-600 mb-8">
                This permanently removes the pool and every prediction inside it. There's no undo.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePool}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Deleting…' : 'Delete pool'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leave modal */}
        {showLeaveModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={() => setShowLeaveModal(false)}
          >
            <div
              className="bg-white rounded-lg max-w-sm w-full p-8 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-3xl mb-4">🚪</p>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Leave "{pool.name}"?</h2>
              <p className="text-sm text-slate-600 mb-8">
                You'll be removed and your predictions will be deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLeaveModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Stay
                </button>
                <button
                  onClick={handleLeavePool}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Leaving…' : 'Leave pool'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}