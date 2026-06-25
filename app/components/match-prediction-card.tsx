'use client';

import { useEffect, useState } from 'react';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  stage: string;
  group_name?: string | null;
}

interface Prediction {
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_winner: string;
}

interface MatchPredictionCardProps {
  match: Match;
  initialPrediction?: Prediction;
  onSubmit: (prediction: Prediction) => Promise<void>;
  loading?: boolean;
}

export function MatchPredictionCard({
  match,
  initialPrediction,
  onSubmit,
  loading = false,
}: MatchPredictionCardProps) {
  const hasPrediction = !!initialPrediction;
  const [homeScore, setHomeScore] = useState(initialPrediction?.predicted_home_score || 0);
  const [awayScore, setAwayScore] = useState(initialPrediction?.predicted_away_score || 0);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const predictedWinner =
    homeScore > awayScore ? 'home' : awayScore > homeScore ? 'away' : 'draw';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      await onSubmit({
        predicted_home_score: homeScore,
        predicted_away_score: awayScore,
        predicted_winner: predictedWinner,
      });

      setSuccessMessage('✓ Prediction saved!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const errorMsg = (error as Error).message || 'Failed to save prediction';
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const matchDateTime = new Date(match.match_date);
  const isUpcoming = matchDateTime > new Date();

  useEffect(() => {
    if (initialPrediction) {
      setHomeScore(initialPrediction.predicted_home_score);
      setAwayScore(initialPrediction.predicted_away_score);
    }
  }, [initialPrediction]);

  return (
    <div className={`rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all border ${
      hasPrediction
        ? 'border-purple-300'
        : 'border-[var(--border-color)]'
    }`}>
      {/* Header with group */}
      <div className={`px-4 py-3 ${
        hasPrediction
          ? 'bg-gradient-to-r from-purple-100 to-purple-50'
          : 'bg-gradient-to-r from-blue-50 to-blue-50/50'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-blue-600 uppercase">
            {match.group_name || match.stage}
          </span>
          {hasPrediction && (
            <span className="text-xs font-bold px-2 py-1 rounded bg-purple-300 text-purple-900">
              ✓ Predicted
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-[var(--bg-primary)] p-4">
        {/* Teams and Scores */}
        <div className="space-y-3">
          {/* Home Team */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-[var(--text-primary)] text-sm">{match.home_team}</p>
            </div>
            {isUpcoming ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                  className="px-2 py-1 hover:bg-gray-100 text-gray-900 font-bold text-lg rounded"
                >
                  −
                </button>
                <input
                  type="number"
                  value={homeScore}
                  onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                  className="flex-1 text-center font-bold text-lg bg-gray-100 text-gray-900 border-0 outline-none rounded py-1"
                  min="0"
                  max="99"
                />
                <button
                  type="button"
                  onClick={() => setHomeScore(homeScore + 1)}
                  className="px-2 py-1 hover:bg-gray-100 text-gray-900 font-bold text-lg rounded"
                >
                  +
                </button>
              </div>
            ) : (
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                {match.home_score}
              </div>
            )}
          </div>

          {/* VS */}
          <div className="text-center">
            <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase">vs</p>
          </div>

          {/* Away Team */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-[var(--text-primary)] text-sm">{match.away_team}</p>
            </div>
            {isUpcoming ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                  className="px-2 py-1 hover:bg-gray-100 text-gray-900 font-bold text-lg rounded"
                >
                  −
                </button>
                <input
                  type="number"
                  value={awayScore}
                  onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                  className="flex-1 text-center font-bold text-lg bg-gray-100 text-gray-900 border-0 outline-none rounded py-1"
                  min="0"
                  max="99"
                />
                <button
                  type="button"
                  onClick={() => setAwayScore(awayScore + 1)}
                  className="px-2 py-1 hover:bg-gray-100 text-gray-900 font-bold text-lg rounded"
                >
                  +
                </button>
              </div>
            ) : (
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                {match.away_score}
              </div>
            )}
          </div>
        </div>

        {/* Match Date */}
        <div className="mt-3 pt-3 border-t border-[var(--border-color)] text-xs text-[var(--text-tertiary)]">
          {new Date(match.match_date).toLocaleString()}
        </div>

        {/* Predicted Winner */}
        {isUpcoming && (
          <div className="mt-3 flex gap-1">
            <span
              className={`text-xs font-semibold px-2 py-1 rounded text-center flex-1 ${
                predictedWinner === 'home'
                  ? 'bg-blue-200 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {match.home_team}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded text-center flex-1 ${
                predictedWinner === 'draw'
                  ? 'bg-amber-200 text-amber-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Draw
            </span>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded text-center flex-1 ${
                predictedWinner === 'away'
                  ? 'bg-green-200 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {match.away_team}
            </span>
          </div>
        )}

        {/* Messages */}
        {successMessage && (
          <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded text-green-700 text-xs font-medium text-center">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs font-medium text-center">
            {errorMessage}
          </div>
        )}

        {/* Submit Button */}
        {isUpcoming && (
          <button
            onClick={handleSubmit}
            disabled={submitting || loading}
            className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
          >
            {submitting ? '💾 Saving...' : hasPrediction ? '✏️ Edit Prediction' : '✓ Save Prediction'}
          </button>
        )}
      </div>
    </div>
  );
}
