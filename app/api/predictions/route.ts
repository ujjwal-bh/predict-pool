import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth-options';
import { supabaseServer } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import type { Prediction, PredictionRequest, PredictionResponse } from '@/app/lib/database.type';

// ── Raw Supabase row shapes ───────────────────────────────────────────────────

interface MatchRow {
  id: string;
  match_date: string;
  status: 'pending' | 'live' | 'completed';
}

interface PoolMemberRow {
  id: string;
}

// ── POST — create or update a prediction ─────────────────────────────────────

export async function POST(
  req: NextRequest
): Promise<NextResponse<PredictionResponse | { error: string }>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: PredictionRequest & {
      // also accept camelCase from frontend
      predictedHomeScore?: number;
      predictedAwayScore?: number;
    } = await req.json();

    const {
      poolId,
      matchId,
      predicted_winner,
      predictedHomeScore,
      predictedAwayScore,
    } = body;

    // Support both camelCase and snake_case
    const homeScore = predictedHomeScore ?? body.predicted_home_score;
    const awayScore = predictedAwayScore ?? body.predicted_away_score;

    // ── Validate required fields ──────────────────────────────────────────
    if (!poolId || !matchId) {
      return NextResponse.json(
        { error: 'poolId and matchId are required' },
        { status: 400 }
      );
    }

    if (homeScore === undefined || homeScore === null || awayScore === undefined || awayScore === null) {
      return NextResponse.json(
        { error: 'Both home and away scores are required' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore)) {
      return NextResponse.json(
        { error: 'Scores must be whole numbers' },
        { status: 400 }
      );
    }

    if (homeScore < 0 || awayScore < 0) {
      return NextResponse.json(
        { error: 'Scores cannot be negative' },
        { status: 400 }
      );
    }

    if (homeScore > 99 || awayScore > 99) {
      return NextResponse.json(
        { error: 'Scores cannot exceed 99' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    // ── Membership + match checks in parallel ─────────────────────────────
    const [
      { data: rawMember, error: memberError },
      { data: rawMatch, error: matchError },
    ] = await Promise.all([
      supabase
        .from('pool_members')
        .select('id')
        .eq('pool_id', poolId)
        .eq('user_id', session.user.id)
        .single(),

      supabase
        .from('matches')
        .select('id, match_date, status')
        .eq('id', matchId)
        .single(),
    ]);

    if (memberError || !rawMember) {
      return NextResponse.json(
        { error: 'You are not a member of this pool' },
        { status: 403 }
      );
    }

    if (matchError || !rawMatch) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Cast after confirming no error
    const member = rawMember as PoolMemberRow;
    const match = rawMatch as MatchRow;

    // ── Lock predictions once match has started ───────────────────────────
    if (match.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot predict on a completed match' },
        { status: 403 }
      );
    }

    if (new Date(match.match_date) <= new Date()) {
      return NextResponse.json(
        { error: 'Predictions are locked — this match has already started' },
        { status: 403 }
      );
    }

    // ── Derive winner from scores if not supplied ─────────────────────────
    const winner: Prediction['predicted_winner'] =
      predicted_winner ??
      (homeScore > awayScore ? 'home' : awayScore > homeScore ? 'away' : 'draw');

    // ── Upsert ────────────────────────────────────────────────────────────
    const { data: rawData, error: upsertError } = await supabase
      .from('predictions')
      .upsert(
        {
          pool_id: poolId,
          user_id: session.user.id,
          match_id: matchId,
          predicted_home_score: homeScore,
          predicted_away_score: awayScore,
          predicted_winner: winner,
          points: 0,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'pool_id,user_id,match_id',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (upsertError || !rawData) {
      console.error('[predictions POST] upsert error:', upsertError);
      return NextResponse.json(
        { error: 'Failed to save prediction' },
        { status: 500 }
      );
    }

    const data = rawData as Prediction;

    return NextResponse.json(
      { success: true, message: 'Prediction saved', data },
      { status: 201 }
    );
  } catch (err) {
    console.error('[predictions POST] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── GET — fetch current user's predictions for a pool ────────────────────────

export async function GET(
  req: NextRequest
): Promise<NextResponse<Prediction[] | { error: string }>> {
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

    const { data: rawData, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('pool_id', poolId)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[predictions GET] error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch predictions' },
        { status: 500 }
      );
    }

    const data = (rawData ?? []) as Prediction[];

    return NextResponse.json(data);
  } catch (err) {
    console.error('[predictions GET] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}