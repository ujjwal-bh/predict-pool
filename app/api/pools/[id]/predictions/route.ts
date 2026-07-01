import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth-options';
import { supabaseServer } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

interface PredictionWithDetails {
  id: string;
  match_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_winner: 'home' | 'away' | 'draw';
  points: number;
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

interface GroupedPredictions {
  [matchId: string]: {
    match: {
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
    };
    predictions: Array<{
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
    }>;
  };
}

function determinePredictionCorrectness(
  prediction: {
    predicted_home_score: number;
    predicted_away_score: number;
    predicted_winner: 'home' | 'away' | 'draw';
  },
  match: {
    home_score: number | null;
    away_score: number | null;
    winner: 'home' | 'away' | 'draw' | null;
  }
): { is_correct: boolean; is_exact: boolean } {
  if (match.home_score === null || match.away_score === null) {
    return { is_correct: false, is_exact: false };
  }

  const is_exact =
    prediction.predicted_home_score === match.home_score &&
    prediction.predicted_away_score === match.away_score;

  const is_correct =
    is_exact ||
    ((prediction.predicted_winner === 'home' && match.winner === 'home') ||
      (prediction.predicted_winner === 'away' && match.winner === 'away') ||
      (prediction.predicted_winner === 'draw' && match.winner === 'draw'));

  return { is_correct, is_exact };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<GroupedPredictions | { error: string }>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: poolId } = await params;

    const supabase = supabaseServer();

    // Verify user is a member of this pool
    const { data: memberCheck, error: memberError } = await supabase
      .from('pool_members')
      .select('id')
      .eq('pool_id', poolId)
      .eq('user_id', session.user.id)
      .single();

    if (memberError || !memberCheck) {
      return NextResponse.json(
        { error: 'You are not a member of this pool' },
        { status: 403 }
      );
    }

    // Fetch all predictions for this pool with user and match details
    const { data: rawPredictions, error: predictionsError } = await supabase
      .from('predictions')
      .select(
        `
        id,
        match_id,
        user_id,
        predicted_home_score,
        predicted_away_score,
        predicted_winner,
        points,
        users(id, name, email),
        matches(
          id,
          home_team,
          away_team,
          match_date,
          home_score,
          away_score,
          status
        )
      `
      )
      .eq('pool_id', poolId);

    if (predictionsError) {
      console.error('[pool predictions GET] error:', predictionsError);
      return NextResponse.json(
        { error: 'Failed to fetch predictions' },
        { status: 500 }
      );
    }

    // Group predictions by match
    const grouped: GroupedPredictions = {};

    if (rawPredictions) {
      for (const pred of rawPredictions) {
        const matchId = pred.match_id;
        
        if (!grouped[matchId]) {
          grouped[matchId] = {
            match: {
              id: pred.matches.id,
              home_team: pred.matches.home_team,
              away_team: pred.matches.away_team,
              match_date: pred.matches.match_date,
              home_score: pred.matches.home_score,
              away_score: pred.matches.away_score,
              status: pred.matches.status,
              winner: null,
              stage: null,
              group_name: null,
            },
            predictions: [],
          };
        }

        const { is_correct, is_exact } = determinePredictionCorrectness(
          {
            predicted_home_score: pred.predicted_home_score,
            predicted_away_score: pred.predicted_away_score,
            predicted_winner: pred.predicted_winner,
          },
          {
            home_score: pred.matches.home_score,
            away_score: pred.matches.away_score,
            winner: pred.matches.winner,
          }
        );

        grouped[matchId].predictions.push({
          id: pred.id,
          user_id: pred.user_id,
          user_name: pred.users?.name || 'Unknown',
          user_email: pred.users?.email || '',
          predicted_home_score: pred.predicted_home_score,
          predicted_away_score: pred.predicted_away_score,
          predicted_winner: pred.predicted_winner,
          points: pred.points,
          is_correct,
          is_exact,
        });
      }
    }

    return NextResponse.json(grouped);
  } catch (err) {
    console.error('[pool predictions GET] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
