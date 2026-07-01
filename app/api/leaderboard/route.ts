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
  points: number | null;
}

interface CompletedMatchRow {
  id: string;
  status: 'completed';
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
        .select('user_id, match_id, points')
        .eq('pool_id', poolId),

      supabase
        .from('matches')
        .select('id, status')
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

    const completedMatchIds = new Set(matches.map(m => m.id));

    const predsByUser = new Map<string, PredictionRow[]>();
    for (const pred of predictions) {
      const bucket = predsByUser.get(pred.user_id) ?? [];
      bucket.push(pred);
      predsByUser.set(pred.user_id, bucket);
    }

    // ── Score each member (points read directly from predictions table) ───

    const leaderboard: LeaderboardEntry[] = members.map(member => {
      const userPreds = predsByUser.get(member.user_id) ?? [];
      let totalPoints = 0;
      let correctPredictions = 0; // exact score
      let correctWinners = 0; // correct winner only (not exact)
      let scoredCount = 0;

      for (const pred of userPreds) {
        // Only count predictions for matches that have actually completed
        if (!completedMatchIds.has(pred.match_id) || pred.points == null) continue;

        totalPoints += pred.points;
        scoredCount += 1;

        if (pred.points === 5) correctPredictions += 1;
        else if (pred.points === 3) correctWinners += 1;
      }

      return {
        userId: member.user_id,
        name: member.users?.name ?? 'Unknown',
        email: member.users?.email ?? '',
        totalPoints,
        correctPredictions,
        correctWinners,
        totalPredictions: scoredCount,
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