'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/app/components/header';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface MatchInfo {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  home_score: number | null;
  away_score: number | null;
  status: 'pending' | 'live' | 'completed';
  winner: 'home' | 'away' | 'draw' | null;
  stage: string | null;
  group_name: string | null;
}

interface PredictionEntry {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_winner: 'home' | 'away' | 'draw';
  points: number;
  is_correct: boolean;
  is_exact: boolean;
}

interface GroupedPredictions {
  [matchId: string]: {
    match: MatchInfo;
    predictions: PredictionEntry[];
  };
}

interface Pool {
  id: string;
  name: string;
}

export default function PoolPredictionsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [pool, setPool] = useState<Pool | null>(null);
  const [groupedPredictions, setGroupedPredictions] = useState<GroupedPredictions>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'points' | 'accuracy'>('points');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'live' | 'completed'>('all');
  const [filterAccuracy, setFilterAccuracy] = useState<'all' | 'exact' | 'correct' | 'incorrect'>('all');
  const [filterUsers, setFilterUsers] = useState<string[]>([]);
  const [searchTeam, setSearchTeam] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [worldCupPredictions, setWorldCupPredictions] = useState<
    Array<{ user_id: string; user_name: string; predicted_country: string }>
  >([]);

  useEffect(() => {
    const fetchPool = async () => {
      try {
        const res = await fetch(`/api/pools?id=${params.id}`);
        if (!res.ok) throw new Error('Pool not found');
        setPool(await res.json());
      } catch (err) {
        setError((err as Error).message);
      }
    };
    fetchPool();
  }, [params.id]);

  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/pools/${params.id}/predictions`);
        if (!res.ok) throw new Error('Failed to fetch predictions');
        setGroupedPredictions(await res.json());
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, [params.id]);

  useEffect(() => {
    const fetchWorldCupPredictions = async () => {
      try {
        const res = await fetch(`/api/pools/${params.id}/worldcup-predictions`);
        if (res.ok) {
          const data = await res.json();
          setWorldCupPredictions(data);
        }
      } catch (err) {
        console.error('Failed to fetch world cup predictions:', err);
      }
    };
    fetchWorldCupPredictions();
  }, [params.id]);

  const getPredictionStatus = (pred: PredictionEntry) => {
    if (pred.points === 5) return { label: 'Exact', color: 'bg-green-100 text-green-800 border-green-300' };
    if (pred.points === 3) return { label: 'Correct', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    return { label: 'Incorrect', color: 'bg-red-100 text-red-800 border-red-300' };
  };

  const sortPredictions = (predictions: PredictionEntry[]) => {
    const sorted = [...predictions];
    if (sortBy === 'points') {
      sorted.sort((a, b) => b.points - a.points);
    } else {
      sorted.sort((a, b) => {
        if (a.is_exact && !b.is_exact) return -1;
        if (!a.is_exact && b.is_exact) return 1;
        if (a.is_correct && !b.is_correct) return -1;
        if (!a.is_correct && b.is_correct) return 1;
        return 0;
      });
    }
    return sorted;
  };

  const getUniqueUsers = () => {
    const users = new Set<string>();
    Object.values(groupedPredictions).forEach(({ predictions }) => {
      predictions.forEach(pred => users.add(pred.user_id));
    });
    return Array.from(users);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filterStatus !== 'all') count++;
    if (filterAccuracy !== 'all') count++;
    if (searchTeam !== '') count++;
    if (filterUsers.length > 0) count++;
    return count;
  };

  const resetFilters = () => {
    setFilterStatus('all');
    setFilterAccuracy('all');
    setFilterUsers([]);
    setSearchTeam('');
  };

  const toggleUserFilter = (userId: string) => {
    setFilterUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const getPredictionAccuracy = (pred: PredictionEntry) => {
    if (pred.is_exact) return 'exact';
    if (pred.is_correct) return 'correct';
    return 'incorrect';
  };

  const matches = Object.values(groupedPredictions)
    .filter(({ match }) => {
      const statusMatch = filterStatus === 'all' || match.status === filterStatus;
      const teamMatch = searchTeam === '' ||
        match.home_team.toLowerCase().includes(searchTeam.toLowerCase()) ||
        match.away_team.toLowerCase().includes(searchTeam.toLowerCase());
      return statusMatch && teamMatch;
    })
    .map(({ match, predictions }) => ({
      match,
      predictions: predictions.filter(pred => {
        const userMatch = filterUsers.length === 0 || filterUsers.includes(pred.user_id);
        const accuracyMatch = filterAccuracy === 'all' || getPredictionAccuracy(pred) === filterAccuracy;
        return userMatch && accuracyMatch;
      })
    }))
    .sort(
      (a, b) =>
        new Date(b.match.match_date).getTime() -
        new Date(a.match.match_date).getTime()
    );

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
            <Spinner label="Loading predictions…" />
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
              href={`/pools/${params.id}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 mb-6 transition-colors"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Back to Pool
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
            href={`/pools/${params.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 mb-8 transition-colors"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to Pool
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              {pool.name}
            </h1>
            <p className="text-base text-slate-600">View all members' predictions and their accuracy</p>
          </div>

          {/* Control bar */}
          <div className="mb-8 flex items-center justify-between gap-4">
            {/* Sort controls */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">Sort by:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('points')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'points'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Points
                </button>
                <button
                  onClick={() => setSortBy('accuracy')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'accuracy'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Accuracy
                </button>
              </div>
            </div>

            {/* Filter button */}
            <button
              onClick={() => setShowFilterModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Filters
              {getActiveFilterCount() > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>
          </div>

          {/* Filter Modal */}
          {showFilterModal && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setShowFilterModal(false)}
              />
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl z-50 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
                  <h2 className="text-lg font-bold text-slate-900">Filters</h2>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Match Status Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                      Match Status
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {(['all', 'pending', 'live', 'completed'] as const).map(status => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                            filterStatus === status
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accuracy Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                      Prediction Accuracy
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {(['all', 'exact', 'correct', 'incorrect'] as const).map(accuracy => (
                        <button
                          key={accuracy}
                          onClick={() => setFilterAccuracy(accuracy)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                            filterAccuracy === accuracy
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {accuracy === 'all' ? 'All' : accuracy.charAt(0).toUpperCase() + accuracy.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Team Search */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                      Search Team
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Brazil, Germany..."
                      value={searchTeam}
                      onChange={(e) => setSearchTeam(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* User Filter */}
                  {getUniqueUsers().length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-3">
                        Members
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {getUniqueUsers().map(userId => {
                          const userName = Object.values(groupedPredictions)
                            .flatMap(({ predictions }) => predictions)
                            .find(p => p.user_id === userId)?.user_name || '';

                          return (
                            <button
                              key={userId}
                              onClick={() => toggleUserFilter(userId)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filterUsers.includes(userId)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {userName}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-slate-200 flex gap-3 sticky bottom-0 bg-white">
                  <button
                    onClick={resetFilters}
                    className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium text-sm transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </>
          )}

          {/* World Cup Winner Predictions */}
          {worldCupPredictions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">World Cup Winner Predictions</h2>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {worldCupPredictions.map(pred => (
                    <div key={`${pred.user_id}-wc`} className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                      <p className="text-sm text-slate-600 mb-1">{pred.user_name}</p>
                      <p className="text-lg font-bold text-blue-600">{pred.predicted_country}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Predictions list */}
          {matches.length === 0 ? (
            <div className="bg-slate-50 rounded-lg p-12 text-center border border-slate-200">
              <p className="text-2xl mb-3">📊</p>
              <p className="font-semibold text-slate-900 mb-1">No predictions yet</p>
              <p className="text-sm text-slate-600">Members will appear here once they start making predictions</p>
            </div>
          ) : (
            <div className="space-y-8">
              {matches.map(({ match, predictions }) => {
                const sortedPreds = sortPredictions(predictions);
                const matchDate = new Date(match.match_date);
                const isCompleted = match.status === 'completed';

                return (
                  <div key={match.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    {/* Match header */}
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              {match.group_name || match.stage || 'Match'}
                            </p>
                            {isCompleted && (
                              <span className="text-xs font-bold text-white bg-slate-700 px-2 py-0.5 rounded">
                                Final
                              </span>
                            )}
                            {match.status === 'live' && (
                              <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                                Live
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="text-lg font-bold text-slate-900">{match.home_team}</p>
                              {isCompleted && (
                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                  {match.home_score}
                                </p>
                              )}
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-slate-500 font-medium">vs</p>
                              {isCompleted && (
                                <p className="text-sm text-slate-500">
                                  {matchDate.toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-slate-900">{match.away_team}</p>
                              {isCompleted && (
                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                  {match.away_score}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Predictions list */}
                    <div className="divide-y divide-slate-200">
                      {sortedPreds.length === 0 ? (
                        <div className="px-6 py-8 text-center">
                          <p className="text-sm text-slate-500">No predictions for this match</p>
                        </div>
                      ) : (
                        sortedPreds.map((pred) => {
                          const status = getPredictionStatus(pred);
                          const isCurrentUser = session?.user?.id === pred.user_id;

                          return (
                            <div
                              key={pred.id}
                              className={`px-6 py-4 flex items-center justify-between gap-4 transition-colors ${
                                isCurrentUser ? 'bg-blue-50' : 'hover:bg-slate-50'
                              }`}
                            >
                              {/* User info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                  {pred.user_name}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-xs font-bold bg-blue-200 text-blue-800 px-2 py-0.5 rounded inline">
                                      you
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-slate-500 truncate">{pred.user_email}</p>
                              </div>

                              {/* Prediction */}
                              <div className="flex-1 flex items-center justify-center gap-2">
                                <span className="text-sm font-bold text-slate-900">
                                  {pred.predicted_home_score}–{pred.predicted_away_score}
                                </span>
                              </div>

                              {/* Status badge */}
                              {isCompleted && (
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`text-xs font-bold px-3 py-1.5 rounded border ${status.color}`}
                                  >
                                    {status.label}
                                  </span>
                                  <div className="text-right w-16">
                                    <p className="text-sm font-bold text-blue-600">
                                      {pred.points}
                                    </p>
                                    <p className="text-xs text-slate-500">pts</p>
                                  </div>
                                </div>
                              )}

                              {/* Pending state */}
                              {!isCompleted && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-500">Pending</span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
