import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth-options';
import { supabaseServer } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import type { WorldCupPrediction } from '@/app/lib/database.type';
import { WORLD_CUP_TEAMS } from '@/app/lib/teams';

interface PoolMemberRow {
  id: string;
}


export async function POST(
  req: NextRequest
): Promise<
  NextResponse<
    { success: boolean; message: string; data: WorldCupPrediction } | { error: string }
  >
> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { poolId, predicted_country } = body;

    if (!poolId || !predicted_country) {
      return NextResponse.json(
        { error: 'poolId and predicted_country are required' },
        { status: 400 }
      );
    }

    if (!WORLD_CUP_TEAMS.includes(predicted_country)) {
      return NextResponse.json(
        {
          error: `Invalid country. Must be one of: ${WORLD_CUP_TEAMS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const supabase = supabaseServer();

    const { data: rawMember, error: memberError } = await supabase
      .from('pool_members')
      .select('id')
      .eq('pool_id', poolId)
      .eq('user_id', session.user.id)
      .single();

    if (memberError || !rawMember) {
      return NextResponse.json(
        { error: 'You are not a member of this pool' },
        { status: 403 }
      );
    }

    // Check if prediction already exists
    const { data: existingPrediction, error: existingError } = await supabase
      .from('world_cup_predictions')
      .select('id')
      .eq('pool_id', poolId)
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (existingError) {
      console.error(
        '[world-cup-predictions POST] existing prediction check error:',
        existingError
      );

      return NextResponse.json(
        { error: 'Failed to validate prediction' },
        { status: 500 }
      );
    }

    if (existingPrediction) {
      return NextResponse.json(
        { error: 'You have already submitted a prediction for this pool' },
        { status: 409 }
      );
    }

    const { data: rawData, error: insertError } = await supabase
      .from('world_cup_predictions')
      .insert({
        pool_id: poolId,
        user_id: session.user.id,
        predicted_country,
        points: 0,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError || !rawData) {
      console.error(
        '[world-cup-predictions POST] insert error:',
        insertError
      );

      return NextResponse.json(
        { error: 'Failed to save prediction' },
        { status: 500 }
      );
    }

    const data = rawData as WorldCupPrediction;

    return NextResponse.json(
      {
        success: true,
        message: 'World Cup prediction saved',
        data,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[world-cup-predictions POST] unexpected error:', err);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest
): Promise<NextResponse<WorldCupPrediction | { error: string }>> {
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
      .from('world_cup_predictions')
      .select('*')
      .eq('pool_id', poolId)
      .eq('user_id', session.user.id)
      .single();

    if (error?.code === 'PGRST116') {
      return NextResponse.json({ error: 'No prediction found for this pool' }, { status: 404 });
    }

    if (error) {
      console.error('[world-cup-predictions GET] error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch prediction' },
        { status: 500 }
      );
    }

    const data = rawData as WorldCupPrediction;

    return NextResponse.json(data);
  } catch (err) {
    console.error('[world-cup-predictions GET] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
