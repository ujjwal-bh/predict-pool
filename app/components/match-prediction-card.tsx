'use client';

import { useEffect, useState } from 'react';
import type { Match } from '@/app/lib/database.type';

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

function getTimeUntilMatch(matchDate: Date): { days: number; hours: number; minutes: number } {
  const diff = matchDate.getTime() - Date.now();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes };
}

function StepperInput({
  value,
  onChange,
  align = 'left',
}: {
  value: number;
  onChange: (v: number) => void;
  align?: 'left' | 'right';
}) {
  return (
    <div className={`flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-8 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-lg font-bold hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
      >
        -
      </button>
      <input
        type="number"
        value={value}
        onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        className="w-12 h-9 text-center text-2xl font-black text-slate-800 bg-slate-100 rounded-lg border-0 outline-none focus:ring-2 focus:ring-blue-300 focus:bg-blue-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        min="0"
        max="99"
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-8 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-lg font-bold hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
      >
        +
      </button>
    </div>
  );
}

export function MatchPredictionCard({
  match,
  initialPrediction,
  onSubmit,
  loading = false,
}: MatchPredictionCardProps) {
  const hasPrediction = !!initialPrediction;
  const [homeScore, setHomeScore] = useState(initialPrediction?.predicted_home_score ?? 0);
  const [awayScore, setAwayScore] = useState(initialPrediction?.predicted_away_score ?? 0);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (initialPrediction) {
      setHomeScore(initialPrediction.predicted_home_score);
      setAwayScore(initialPrediction.predicted_away_score);
    }
  }, [initialPrediction]);

  const matchDateTime = new Date(match.match_date);
  const msUntilMatch = matchDateTime.getTime() - now.getTime();
  const isUpcoming = msUntilMatch > 0;
  const isWithin24h = msUntilMatch > 0 && msUntilMatch <= 24 * 60 * 60 * 1000;
  const timeUntil = getTimeUntilMatch(matchDateTime);
  const stageLabel = match.group_name || match.stage || 'Match';

  const predictedWinner =
    homeScore > awayScore ? 'home' : awayScore > homeScore ? 'away' : 'draw';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setSubmitting(true);
    try {
      await onSubmit({ predicted_home_score: homeScore, predicted_away_score: awayScore, predicted_winner: predictedWinner });
      setSuccessMessage('Prediction saved!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage((error as Error).message || 'Failed to save');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── LOCKED: more than 24h before kick-off ───
  if (isUpcoming && !isWithin24h) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-all">
        {/* Stage */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">{stageLabel}</span>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between px-4 pt-4 pb-0 gap-2">
          <span className="text-sm font-bold text-slate-800 flex-1">{match.home_team}</span>
          <span className="text-[10px] font-bold text-slate-300 tracking-widest uppercase flex-shrink-0">vs</span>
          <span className="text-sm font-bold text-slate-800 flex-1 text-right">{match.away_team}</span>
        </div>

        {/* Lock body */}
        <div className="flex flex-col items-center px-4 py-5 gap-3">
          <span className="text-2xl opacity-30">🔒</span>
          <p className="text-xs font-semibold text-slate-400">Predictions open soon</p>

          {/* Countdown */}
          <div className="flex gap-2">
            {timeUntil.days > 0 && (
              <div className="flex flex-col items-center bg-slate-100 rounded-xl px-3 py-2 min-w-[44px]">
                <span className="text-2xl font-black text-slate-700 leading-none">{timeUntil.days}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">days</span>
              </div>
            )}
            <div className="flex flex-col items-center bg-slate-100 rounded-xl px-3 py-2 min-w-[44px]">
              <span className="text-2xl font-black text-slate-700 leading-none">{timeUntil.hours}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">hrs</span>
            </div>
            <div className="flex flex-col items-center bg-slate-100 rounded-xl px-3 py-2 min-w-[44px]">
              <span className="text-2xl font-black text-slate-700 leading-none">{timeUntil.minutes}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">min</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-300 font-medium">Opens 24 hours before kick-off</p>
        </div>

        {/* Kickoff */}
        <div className="text-center text-[11px] text-slate-400 font-medium pb-3 px-4">
          {matchDateTime.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    );
  }

  // ─── OPEN: within 24h of kick-off ───
  if (isUpcoming && isWithin24h) {
    return (
      <div className={`bg-white rounded-2xl overflow-hidden border-2 transition-all hover:shadow-lg ${
        hasPrediction ? 'border-green-300 shadow-green-100 shadow-sm' : 'border-amber-300 shadow-amber-100 shadow-sm'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-2.5 border-b ${
          hasPrediction ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'
        }`}>
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">{stageLabel}</span>
          {hasPrediction
            ? <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-200 text-green-700">✓ Predicted</span>
            : <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-200 text-amber-700 animate-pulse">Predict now</span>
          }
        </div>

        {/* Scoreboard */}
        <div className="flex items-start gap-0 px-4 pt-4 pb-2">
          {/* Home */}
          <div className="flex-1 flex flex-col gap-2">
            <p className="text-sm font-bold text-slate-800 leading-tight">{match.home_team}</p>
            <StepperInput value={homeScore} onChange={setHomeScore} align="left" />
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center w-10 pt-7 flex-shrink-0">
            <span className="text-3xl font-black text-slate-200 leading-none">:</span>
          </div>

          {/* Away */}
          <div className="flex-1 flex flex-col items-end gap-2">
            <p className="text-sm font-bold text-slate-800 leading-tight text-right">{match.away_team}</p>
            <StepperInput value={awayScore} onChange={setAwayScore} align="right" />
          </div>
        </div>

        {/* Winner chips */}
        <div className="flex gap-1.5 px-4 pb-3">
          <span className={`flex-1 text-center text-[10px] font-bold py-1.5 px-1 rounded-lg transition-colors truncate ${
            predictedWinner === 'home' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
          }`}>{match.home_team}</span>
          <span className={`flex-1 text-center text-[10px] font-bold py-1.5 px-1 rounded-lg transition-colors ${
            predictedWinner === 'draw' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'
          }`}>Draw</span>
          <span className={`flex-1 text-center text-[10px] font-bold py-1.5 px-1 rounded-lg transition-colors truncate ${
            predictedWinner === 'away' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
          }`}>{match.away_team}</span>
        </div>

        {/* Urgency bar */}
        <div className="bg-amber-50 border-y border-amber-100 px-4 py-2 text-center text-[11px] font-semibold text-amber-600">
          ⏰ Closes in {timeUntil.hours}h {timeUntil.minutes}m
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mx-4 mt-3 px-3 py-2 bg-green-100 border border-green-200 rounded-lg text-green-700 text-xs font-semibold text-center">
            ✓ {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mx-4 mt-3 px-3 py-2 bg-red-100 border border-red-200 rounded-lg text-red-700 text-xs font-semibold text-center">
            {errorMessage}
          </div>
        )}

        {/* Save button */}
        <div className="px-4 pt-3 pb-1">
          <button
            onClick={handleSubmit}
            disabled={submitting || loading}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold text-sm rounded-xl transition-colors"
          >
            {submitting ? 'Saving…' : hasPrediction ? '✏️ Update Prediction' : '✓ Save Prediction'}
          </button>
        </div>

        {/* Kickoff */}
        <div className="text-center text-[11px] text-slate-400 font-medium py-2.5">
          Kick-off: {matchDateTime.toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    );
  }

  // ─── COMPLETED ───
  const finalHome = match.home_score ?? 0;
  const finalAway = match.away_score ?? 0;
  const actualWinner = finalHome > finalAway ? 'home' : finalAway > finalHome ? 'away' : 'draw';

  let resultType: 'correct' | 'wrong' | 'missed' = 'missed';
  if (hasPrediction) {
    const exactScore =
      initialPrediction!.predicted_home_score === finalHome &&
      initialPrediction!.predicted_away_score === finalAway;
    const correctWinner = initialPrediction!.predicted_winner === actualWinner;
    resultType = exactScore || correctWinner ? 'correct' : 'wrong';
  }

  const resultStyles = {
    correct: {
      card: 'border-green-300',
      headerBg: 'bg-green-50 border-green-100',
      badge: 'bg-green-200 text-green-700',
      badgeText: '🎯 Correct',
      predPill: 'bg-green-100 text-green-700 border border-green-200',
    },
    wrong: {
      card: 'border-red-300',
      headerBg: 'bg-red-50 border-red-100',
      badge: 'bg-red-200 text-red-700',
      badgeText: '✗ Wrong',
      predPill: 'bg-red-100 text-red-700 border border-red-200',
    },
    missed: {
      card: 'border-slate-200',
      headerBg: 'bg-slate-50 border-slate-100',
      badge: 'bg-slate-200 text-slate-500',
      badgeText: '— No pick',
      predPill: 'bg-slate-100 text-slate-400 border border-slate-200',
    },
  }[resultType];

  return (
    <div className={`bg-white rounded-2xl border-2 overflow-hidden hover:shadow-md transition-all ${resultStyles.card}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2.5 border-b ${resultStyles.headerBg}`}>
        <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">{stageLabel}</span>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${resultStyles.badge}`}>
          {resultStyles.badgeText}
        </span>
      </div>

      {/* Final score section */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center mb-2">Final score</p>

        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-slate-800 flex-1 leading-tight">{match.home_team}</span>
          <span className="text-3xl font-black text-slate-800 leading-none flex-shrink-0 tabular-nums">
            {match.home_score ?? '–'} – {match.away_score ?? '–'}
          </span>
          <span className="text-sm font-bold text-slate-800 flex-1 text-right leading-tight">{match.away_team}</span>
        </div>
      </div>

      {/* Prediction comparison */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-400">Your pick</span>
        {hasPrediction ? (
          <span className={`text-xs font-bold px-3 py-1 rounded-lg tabular-nums ${resultStyles.predPill}`}>
            {initialPrediction!.predicted_home_score} – {initialPrediction!.predicted_away_score}
          </span>
        ) : (
          <span className="text-xs font-semibold text-slate-300 italic">No prediction</span>
        )}
      </div>

      {/* Date */}
      <div className="text-center text-[11px] text-slate-400 font-medium pb-3">
        {matchDateTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
    </div>
  );
}
