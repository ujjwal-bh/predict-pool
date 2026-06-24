import { NextResponse } from 'next/server';
import { supabaseServer } from '@/app/lib/supabase';

export async function GET() {
  try {
    const supabase = supabaseServer();

    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Get match counts by status
    const { data: allMatches } = await supabase
      .from('matches')
      .select('id, home_team, away_team, status, match_date')
      .order('match_date', { ascending: true });

    const pendingCount = allMatches?.filter((m: any) => m.status === 'pending').length || 0;
    const completedCount = allMatches?.filter((m: any) => m.status === 'completed').length || 0;

    return NextResponse.json({
      total_matches: allMatches?.length || 0,
      pending_matches: pendingCount,
      completed_matches: completedCount,
      all_matches: allMatches?.map((m: any) => ({
        id: m.id,
        match: `${m.home_team} vs ${m.away_team}`,
        status: m.status,
        date: m.match_date,
      })) || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
