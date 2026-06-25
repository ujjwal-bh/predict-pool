import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth-options';
import { supabaseServer } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import type { LeaderboardEntry } from '@/app/lib/database.type';

// ── Raw Supabase row shapes ───────────────────────────────────────────────────

interface MemberRow {
  user_id: string;
  users: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface PredictionRow {
  user_id: string;
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_winner: 'home' | 'away' | 'draw';
}

interface CompletedMatchRow {
  id: string;
  home_score: number;
  away_score: number;
  status: 'completed';
}

// ── Scoring helper ────────────────────────────────────────────────────────────

function scorePrediction(
  pred: PredictionRow,
  match: CompletedMatchRow
): { points: number; isExact: boolean; isCorrectWinner: boolean } {
  const { home_score, away_score } = match;

  const isExact =
    pred.predicted_home_score === home_score &&
    pred.predicted_away_score === away_score;

  const isCorrectWinner =
    !isExact &&
    ((pred.predicted_winner === 'home' && home_score > away_score) ||
      (pred.predicted_winner === 'away' && away_score > home_score) ||
      (pred.predicted_winner === 'draw' && home_score === away_score));

  return {
    points: isExact ? 2 : isCorrectWinner ? 1 : 0,
    isExact,
    isCorrectWinner,
  };
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest
): Promise<NextResponse<LeaderboardEntry[] | { error: string }>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const poolId = searchParams.get('poolId');

    if (!poolId) {
      return NextResponse.json({ error: 'poolId is required' }, { status: 400 });
    }

    const supabase = supabaseServer();

    // ── All three queries in parallel ─────────────────────────────────────
    const [
      { data: rawMembers, error: membersError },
      { data: rawPredictions, error: predictionsError },
      { data: rawMatches, error: matchesError },
    ] = await Promise.all([
      supabase
        .from('pool_members')
        .select('user_id, users(id, name, email)')
        .eq('pool_id', poolId),

      supabase
        .from('predictions')
        .select('user_id, match_id, predicted_home_score, predicted_away_score, predicted_winner')
        .eq('pool_id', poolId),

      supabase
        .from('matches')
        .select('id, home_score, away_score, status')
        .eq('status', 'completed'),
    ]);

    if (membersError) {
      console.error('[leaderboard] members error:', membersError);
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
    }
    if (predictionsError) {
      console.error('[leaderboard] predictions error:', predictionsError);
      return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 });
    }
    if (matchesError) {
      console.error('[leaderboard] matches error:', matchesError);
      return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
    }

    // Cast after confirming no error
    const members = (rawMembers ?? []) as MemberRow[];
    const predictions = (rawPredictions ?? []) as PredictionRow[];
    const matches = (rawMatches ?? []) as CompletedMatchRow[];

    if (!members.length) {
      return NextResponse.json([]);
    }

    // ── O(1) lookup maps ──────────────────────────────────────────────────

    const matchMap = new Map<string, CompletedMatchRow>(
      matches.map(m => [m.id, m])
    );

    const predsByUser = new Map<string, PredictionRow[]>();
    for (const pred of predictions) {
      const bucket = predsByUser.get(pred.user_id) ?? [];
      bucket.push(pred);
      predsByUser.set(pred.user_id, bucket);
    }

    // ── Score each member ─────────────────────────────────────────────────

    const leaderboard: LeaderboardEntry[] = members.map(member => {
      const userPreds = predsByUser.get(member.user_id) ?? [];
      let totalPoints = 0;
      let correctPredictions = 0;
      let correctWinners = 0;

      for (const pred of userPreds) {
        const match = matchMap.get(pred.match_id);
        if (!match) continue;

        const { points, isExact, isCorrectWinner } = scorePrediction(pred, match);
        totalPoints += points;
        if (isExact) correctPredictions += 1;
        if (isCorrectWinner) correctWinners += 1;
      }

      return {
        userId: member.user_id,
        name: member.users?.name ?? 'Unknown',
        email: member.users?.email ?? '',
        totalPoints,
        correctPredictions,
        correctWinners,
        totalPredictions: userPreds.length,
      };
    });

    leaderboard.sort(
      (a, b) =>
        b.totalPoints - a.totalPoints ||
        b.correctPredictions - a.correctPredictions
    );

    return NextResponse.json(leaderboard);
  } catch (err) {
    console.error('[leaderboard] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}