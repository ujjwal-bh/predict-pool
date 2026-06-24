import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth-options';
import { supabaseServer } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

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

    // Get all pool members
    const { data: members, error: membersError } = await supabase
      .from('pool_members')
      .select('user_id, users(id, name, email)')
      .eq('pool_id', poolId);

    if (membersError || !members) {
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    // Calculate scores for each member
    const leaderboard = await Promise.all(
      (members as any[]).map(async (member: any) => {
        const { data: predictions } = await supabase
          .from('predictions')
          .select('*, matches(home_score, away_score, status)')
          .eq('pool_id', poolId)
          .eq('user_id', member.user_id);

        let totalPoints = 0;
        let correctPredictions = 0;

        if (predictions) {
          (predictions as any[]).forEach((pred: any) => {
            if (pred.matches?.status === 'completed') {
              const homeScore = pred.matches.home_score;
              const awayScore = pred.matches.away_score;

              // Check if score is correct
              if (
                pred.predicted_home_score === homeScore &&
                pred.predicted_away_score === awayScore
              ) {
                totalPoints += 2;
                correctPredictions += 1;
              } else if (pred.predicted_winner === 'draw' && homeScore === awayScore) {
                totalPoints += 1;
              } else if (
                pred.predicted_winner === 'home' &&
                homeScore > awayScore
              ) {
                totalPoints += 1;
              } else if (
                pred.predicted_winner === 'away' &&
                awayScore > homeScore
              ) {
                totalPoints += 1;
              }
            }
          });
        }

        return {
          userId: member.user_id,
          name: (member.users as any)?.name || 'Unknown',
          email: (member.users as any)?.email || '',
          totalPoints,
          correctPredictions,
          totalPredictions: predictions?.length || 0,
        };
      })
    );

    // Sort by points descending
    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);

    return NextResponse.json(leaderboard);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
