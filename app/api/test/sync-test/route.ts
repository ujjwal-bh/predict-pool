import { NextResponse } from 'next/server';
import { supabaseServer } from '@/app/lib/supabase';
import { toUTC } from '@/app/lib/date-utils';

// Test endpoint - only for development/testing
// Remove this in production

export async function GET(req: Request) {
  try {
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

    console.log('Starting test sync from Football-Data.org...');

    // Fetch from football-data.org
    const response = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches?season=2026',
      {
        headers: { 'X-Auth-Token': apiKey },
      }
    );

    console.log('API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { 
          error: `API returned ${response.status}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('API returned matches:', data.matches?.length);

    if (!data.matches || !Array.isArray(data.matches)) {
      return NextResponse.json(
        { error: 'Invalid API response format', data },
        { status: 400 }
      );
    }

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Process each match
    for (const match of data.matches) {
      try {
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

        const { data: result, error } = await supabase
          .from('matches')
          .upsert([matchData], { onConflict: 'match_id_external' })
          .select();

        if (error) {
          errors.push(`Error upserting match ${match.id}: ${error.message}`);
          console.error(`Error upserting match ${match.id}:`, error);
        } else {
          if (result && result.length > 0) {
            updated++;
          } else {
            inserted++;
          }
        }
      } catch (e) {
        errors.push(`Exception processing match: ${(e as Error).message}`);
        console.error('Exception processing match:', e);
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
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync matches error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sync matches', 
        details: (error as Error).message,
        stack: (error as Error).stack,
      },
      { status: 500 }
    );
  }
}
