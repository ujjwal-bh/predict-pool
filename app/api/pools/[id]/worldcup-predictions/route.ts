import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth-options';
import { supabaseServer } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

interface WorldCupPredictionResponse {
  user_id: string;
  user_name: string;
  predicted_country: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<WorldCupPredictionResponse[] | { error: string }>> {
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

    // Fetch world cup predictions for this pool with user details
    const { data: predictions, error: predictionsError } = await supabase
      .from('worldcup_predictions')
      .select(
        `
        id,
        user_id,
        predicted_country,
        users(id, name)
      `
      )
      .eq('pool_id', poolId);

    if (predictionsError) {
      console.error('[world cup predictions GET] error:', predictionsError);
      return NextResponse.json(
        { error: 'Failed to fetch world cup predictions' },
        { status: 500 }
      );
    }

    const response: WorldCupPredictionResponse[] = (predictions || []).map(pred => ({
      user_id: pred.user_id,
      user_name: pred.users?.name || 'Unknown',
      predicted_country: pred.predicted_country,
    }));

    return NextResponse.json(response);
  } catch (err) {
    console.error('[world cup predictions GET] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
