import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth-options';
import { supabaseServer } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized - Please login to make predictions' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const {
      poolId,
      matchId,
      predicted_home_score,
      predicted_away_score,
      predictedHomeScore,
      predictedAwayScore,
      predicted_winner
    } = body;

    // Support both camelCase and snake_case
    const homeScore = predictedHomeScore !== undefined ? predictedHomeScore : predicted_home_score;
    const awayScore = predictedAwayScore !== undefined ? predictedAwayScore : predicted_away_score;

    // Validate required fields
    if (!poolId || !matchId) {
      return NextResponse.json(
        { error: 'Pool ID and Match ID are required' },
        { status: 400 }
      );
    }

    // Validate score values
    if (homeScore === undefined || awayScore === undefined) {
      return NextResponse.json(
        { error: 'Both home and away scores are required' },
        { status: 400 }
      );
    }

    // Validate scores are non-negative integers
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

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Determine winner based on prediction (use provided or calculate)
    let winner = predicted_winner;
    if (!winner) {
      winner = 'draw';
      if (homeScore > awayScore) {
        winner = 'home';
      } else if (awayScore > homeScore) {
        winner = 'away';
      }
    }

    // Verify pool exists and user is member
    const { data: poolMember, error: memberError } = await supabase
      .from('pool_members')
      .select('id')
      .eq('pool_id', poolId)
      .eq('user_id', session.user.id)
      .single();

    if (memberError || !poolMember) {
      return NextResponse.json(
        { error: 'You are not a member of this pool' },
        { status: 403 }
      );
    }

    // Verify match exists
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('id, status')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Check if match is completed
    if (match.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot predict on completed matches' },
        { status: 400 }
      );
    }

    // Save or update prediction
    const { data, error } = await supabase
      .from('predictions')
      .upsert(
        [
          {
            pool_id: poolId,
            user_id: session.user.id,
            match_id: matchId,
            predicted_home_score: homeScore,
            predicted_away_score: awayScore,
            predicted_winner: winner,
            points: 0, // Points are calculated when match completes
          },
        ],
        { onConflict: 'pool_id,user_id,match_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save prediction. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Prediction saved successfully',
        data
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const poolId = searchParams.get('poolId');

    if (!poolId) {
      return NextResponse.json(
        { error: 'Pool ID required' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('pool_id', poolId)
      .eq('user_id', session.user.id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch predictions' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
