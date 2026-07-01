'use client';

import { useState, useEffect } from 'react';
import { WORLD_CUP_TEAMS } from '@/app/lib/teams';

interface WorldCupSelectorProps {
  poolId: string;
  onPredictionChange?: (country: string | null) => void;
}



export function WorldCupSelector({ poolId, onPredictionChange }: WorldCupSelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/world-cup-predictions?poolId=${poolId}`);
        if (!res.ok) throw new Error('Failed to fetch prediction');
        const data = await res.json();
        if (data) {
          setSelectedCountry(data.predicted_country);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, [poolId]);

  const handleSelectCountry = async (country: string) => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/world-cup-predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId, predicted_country: country }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save prediction');
      }

      const data = await res.json();
      setSelectedCountry(data.data.predicted_country);
      setIsOpen(false);
      onPredictionChange?.(data.data.predicted_country);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
          <span className="ml-2 text-sm text-slate-600">Loading prediction…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8">
      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        🌍 World Cup Winner
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={saving}
          className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-left font-medium text-slate-900 hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center justify-between"
        >
          <span className={selectedCountry ? 'text-slate-900' : 'text-slate-500'}>
            {selectedCountry || 'Select a country…'}
          </span>
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7-7m0 0L5 14m7-7v12" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
            {WORLD_CUP_TEAMS.map(country => (
              <button
                key={country}
                onClick={() => handleSelectCountry(country)}
                disabled={saving}
                className={`w-full px-4 py-3 text-left text-sm font-medium border-b border-slate-100 transition-colors hover:bg-blue-50 disabled:opacity-50 ${
                  selectedCountry === country ? 'bg-blue-100 text-blue-900' : 'text-slate-900 hover:bg-slate-50'
                }`}
              >
                {country}
                {selectedCountry === country && (
                  <span className="ml-2 text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedCountry && (
        <p className="mt-4 text-sm text-slate-600">
          You predicted <strong>{selectedCountry}</strong> will win the World Cup
        </p>
      )}
    </div>
  );
}
