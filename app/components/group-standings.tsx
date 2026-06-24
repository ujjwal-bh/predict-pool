'use client';

import { useState, useEffect, useRef } from 'react';

interface TeamStanding {
  position: number;
  team: string;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalDifference: number;
  goalsFor: number;
  goalsAgainst: number;
}

interface GroupStanding {
  group: string;
  stage: string;
  table: TeamStanding[];
}

export function GroupStandings() {
  const [standings, setStandings] = useState<GroupStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const res = await fetch('/api/standings');
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch standings');
        }
        const data = await res.json();
        console.log(`Loaded ${data.length} groups:`, data.map((g: any) => g.group).join(', '));
        setStandings(data);
      } catch (err) {
        console.error('Standings error:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-[var(--text-secondary)]">Loading standings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-700 dark:text-red-300 text-sm">Failed to load standings: {error}</p>
      </div>
    );
  }

  if (standings.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-8">📊 Group Standings</h2>
      
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
        style={{ scrollBehavior: 'smooth', minWidth: '100%' }}
      >
        {standings.map((group: any) => (
          <div
            key={group.group}
            className="flex-shrink-0 w-80 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] overflow-hidden snap-center"
          >
            {/* Group Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
              <h3 className="text-lg font-bold text-white">{group.group}</h3>
            </div>

            {/* Standings Table */}
            <div className="overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                  <tr>
                    <th className="text-center py-2 px-2 font-semibold text-[var(--text-primary)]">Pos</th>
                    <th className="text-left py-2 px-2 font-semibold text-[var(--text-primary)]">Team</th>
                    <th className="text-center py-2 px-1 font-semibold text-[var(--text-tertiary)]">P</th>
                    <th className="text-center py-2 px-1 font-semibold text-[var(--text-tertiary)]">W</th>
                    <th className="text-center py-2 px-1 font-semibold text-[var(--text-tertiary)]">D</th>
                    <th className="text-center py-2 px-1 font-semibold text-[var(--text-tertiary)]">L</th>
                    <th className="text-center py-2 px-1 font-semibold text-[var(--text-tertiary)]">GD</th>
                    <th className="text-center py-2 px-2 font-bold text-[var(--text-primary)]">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {group.table.map((team: any, idx: number) => (
                    <tr
                      key={team.team}
                      className={`border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition ${
                        idx === 0 ? 'bg-green-50 dark:bg-green-900/20' : ''
                      } ${idx === 1 || idx === 2 ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${
                        idx === 3 ? 'bg-red-50 dark:bg-red-900/20' : ''
                      }`}
                    >
                      <td className="py-2 px-2 text-center font-bold text-[var(--text-primary)]">
                        {team.position === 1 && '🥇'}
                        {team.position === 2 && '🥈'}
                        {team.position === 3 && '🥉'}
                        {team.position > 3 && team.position}
                      </td>
                      <td className="py-2 px-2 font-semibold text-[var(--text-primary)] truncate">
                        {team.team}
                      </td>
                      <td className="py-2 px-1 text-center text-[var(--text-secondary)]">
                        {team.playedGames}
                      </td>
                      <td className="py-2 px-1 text-center text-green-600 dark:text-green-400 font-semibold">
                        {team.won}
                      </td>
                      <td className="py-2 px-1 text-center text-amber-600 dark:text-amber-400 font-semibold">
                        {team.draw}
                      </td>
                      <td className="py-2 px-1 text-center text-red-600 dark:text-red-400 font-semibold">
                        {team.lost}
                      </td>
                      <td className="py-2 px-1 text-center text-[var(--text-secondary)]">
                        {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-blue-600 dark:text-blue-400">
                        {team.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="px-3 py-2 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] text-xs text-[var(--text-tertiary)] leading-tight">
              <p>P: Played • W: Wins • D: Draws</p>
              <p>L: Losses • GD: Goal Diff • Pts: Points</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
