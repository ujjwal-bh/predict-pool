import { NextResponse } from 'next/server';
import { supabaseServer } from '@/app/lib/supabase';
import { toUTC } from '@/app/lib/date-utils';

// This endpoint should be called daily by a cron service
// Examples: Vercel Cron, node-cron, AWS Lambda, etc.

export async function GET(req: Request) {
  try {
    // Verify the request is from a trusted source
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isProduction = process.env.NODE_ENV === 'production';

    // In production, require valid auth. In dev, allow without auth for testing.
    if (isProduction && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('Unauthorized cron request - invalid or missing Authorization header');
      return NextResponse.json(
        { error: 'Unauthorized - missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    if (!cronSecret && isProduction) {
      console.error('CRON_SECRET not configured in production');
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      );
    }

    const supabase = supabaseServer();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const apiKey = process.env.FOOTBALL_DATA_API_KEY || '';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No API key configured' },
        { status: 400 }
      );
    }

    // Fetch from football-data.org
    const response = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches?season=2026',
      {
        headers: { 'X-Auth-Token': apiKey },
      }
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.matches || !Array.isArray(data.matches)) {
      throw new Error('Invalid API response format');
    }

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    // Process each match
    for (const match of data.matches) {
      // Skip matches without team data (knockout stages not yet assigned)
      if (!match.homeTeam?.name || !match.awayTeam?.name) {
        skipped++;
        continue;
      }

      const matchData = {
        match_id_external: match.id.toString(),
        home_team: match.homeTeam.name,
        home_team_id: match.homeTeam.id || null,
        away_team: match.awayTeam.name,
        away_team_id: match.awayTeam.id || null,
        match_date: toUTC(match.utcDate),
        matchday: match.matchday || null,
        stage: match.stage || null,
        group_name: match.group || null,
        home_score: match.score.fullTime.home,
        away_score: match.score.fullTime.away,
        home_score_ht: match.score.halfTime?.home || null,
        away_score_ht: match.score.halfTime?.away || null,
        status: match.status === 'FINISHED' || match.status === 'AWARDED' ? 'completed' : 'pending',
        winner: match.score.winner || null,
        duration: match.score.duration || null,
        last_updated: toUTC(match.lastUpdated) || toUTC(new Date()),
      };

      console.log(`Processing match ${match.id} (${match.homeTeam.name} vs ${match.awayTeam.name}):`);
      console.log(JSON.stringify(matchData, null, 2));

      // Use upsert to insert or update
      const { data: result, error } = await supabase
        .from('matches')
        .upsert([matchData], { onConflict: 'match_id_external' })
        .select();

      if (error) {
        console.error(`Error upserting match ${match.id}:`, error);
      } else {
        // Check if it was an insert or update based on if data existed
        if (result && result.length > 0) {
          updated++;
        } else {
          inserted++;
        }
      }
    }

    console.log(`Sync complete: ${inserted} inserted, ${updated} updated, ${skipped} skipped (unassigned knockout teams)`);

    return NextResponse.json({
      success: true,
      message: `Synced ${inserted + updated} valid matches`,
      inserted,
      updated,
      skipped,
      total_api_matches: data.matches.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync matches error:', error);
    return NextResponse.json(
      { error: 'Failed to sync matches', details: (error as Error).message },
      { status: 500 }
    );
  }
}
