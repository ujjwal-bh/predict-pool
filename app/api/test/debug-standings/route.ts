import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY || '';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No API key configured' },
        { status: 400 }
      );
    }

    // Fetch standings
    const standingsRes = await fetch(
      'https://api.football-data.org/v4/competitions/WC/standings?season=2026',
      {
        headers: { 'X-Auth-Token': apiKey },
      }
    );

    const standingsData = await standingsRes.json();

    // Fetch matches
    const matchesRes = await fetch(
      'https://api.football-data.org/v4/competitions/WC/matches?season=2026',
      {
        headers: { 'X-Auth-Token': apiKey },
      }
    );

    const matchesData = await matchesRes.json();

    return NextResponse.json({
      standings_count: standingsData.standings?.length || 0,
      standings_groups: standingsData.standings?.map((g: any) => ({
        group: g.group,
        stage: g.stage,
        team_count: g.table?.length || 0,
      })) || [],
      sample_match_utc: matchesData.matches?.[0]?.utcDate || 'No matches',
      sample_match_status: matchesData.matches?.[0]?.status || 'No status',
      browser_local_time: new Date().toLocaleString(),
      utc_time: new Date().toUTCString(),
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: (error as Error).message,
        stack: (error as Error).stack
      },
      { status: 500 }
    );
  }
}
