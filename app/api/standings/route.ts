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

    // Fetch standings from football-data.org
    const response = await fetch(
      'https://api.football-data.org/v4/competitions/WC/standings?season=2026',
      {
        headers: { 'X-Auth-Token': apiKey },
      }
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.standings || !Array.isArray(data.standings)) {
      return NextResponse.json(
        {
          error: 'No standings data available',
          received: data
        },
        { status: 400 }
      );
    }

    console.log(`Found ${data.standings.length} groups in standings`);

    // Transform standings into a more usable format
    const standings = data.standings
      .map((group: any) => {
        if (!group.table || !Array.isArray(group.table)) {
          console.warn(`Group ${group.group} has no table`);
          return null;
        }
        return {
          group: group.group,
          stage: group.stage,
          table: group.table.map((team: any) => ({
            position: team.position,
            team: team.team.name,
            teamId: team.team.id,
            playedGames: team.playedGames,
            won: team.won,
            draw: team.draw,
            lost: team.lost,
            points: team.points,
            goalDifference: team.goalDifference,
            goalsFor: team.goalsFor,
            goalsAgainst: team.goalsAgainst,
          })),
        };
      })
      .filter(Boolean);

    console.log(`Returning ${standings.length} groups`);

    return NextResponse.json(standings);
  } catch (error) {
    console.error('Standings error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch standings',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
