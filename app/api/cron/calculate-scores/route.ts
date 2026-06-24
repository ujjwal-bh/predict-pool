import { NextResponse } from 'next/server';
import { supabaseServer } from '@/app/lib/supabase';

// This endpoint should be called once daily at a specified time
// Usually after match results are available

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

    // Get all completed matches that haven't been scored yet
    const { data: completedMatches, error: matchError } = await supabase
      .from('matches')
      .select('id, home_score, away_score, status')
      .eq('status', 'completed');

    if (matchError) {
      throw new Error(`Failed to fetch matches: ${matchError.message}`);
    }

    let scoresUpdated = 0;

    // For each completed match, calculate scores for all predictions
    for (const match of completedMatches || []) {
      // Get all predictions for this match
      const { data: predictions, error: predError } = await supabase
        .from('predictions')
        .select('id, predicted_home_score, predicted_away_score, predicted_winner, points')
        .eq('match_id', match.id);

      if (predError) {
        console.error(`Error fetching predictions for match ${match.id}:`, predError);
        continue;
      }

      // Calculate points for each prediction
      for (const pred of predictions || []) {
        // Skip if already scored
        if (pred.points !== null && pred.points !== 0) {
          continue;
        }

        let points = 0;

        // Only calculate if match has scores
        if (match.home_score !== null && match.away_score !== null) {
          // Check if exact score is correct (2 points)
          if (
            pred.predicted_home_score === match.home_score &&
            pred.predicted_away_score === match.away_score
          ) {
            points = 2;
          } else {
            // Check if winner is correct (1 point)
            const actualWinner =
              match.home_score > match.away_score
                ? 'home'
                : match.away_score > match.home_score
                ? 'away'
                : 'draw';

            if (pred.predicted_winner === actualWinner) {
              points = 1;
            }
          }

          // Update the prediction with points
          const { error: updateError } = await supabase
            .from('predictions')
            .update({ points })
            .eq('id', pred.id);

          if (updateError) {
            console.error(`Error updating prediction ${pred.id}:`, updateError);
          } else {
            scoresUpdated++;
          }
        }
      }
    }

    console.log(`Score calculation complete: ${scoresUpdated} predictions scored`);

    return NextResponse.json({
      success: true,
      message: 'Scores calculated successfully',
      scoresUpdated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Calculate scores error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate scores', details: (error as Error).message },
      { status: 500 }
    );
  }
}
