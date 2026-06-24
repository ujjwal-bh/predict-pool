import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const cronSecret = process.env.CRON_SECRET;

    const authHeader = cronSecret ? `Bearer ${cronSecret}` : undefined;

    console.log('Testing cron endpoints...');
    console.log(`Base URL: ${baseUrl}`);
    console.log(`Auth Header: ${authHeader ? 'Present' : 'Missing (dev mode)'}`);

    // Test sync-matches endpoint
    const syncUrl = `${baseUrl}/api/cron/sync-matches`;
    console.log(`\nCalling: ${syncUrl}`);
    
    const syncResponse = await fetch(syncUrl, {
      method: 'GET',
      headers: authHeader ? { 'Authorization': authHeader } : {},
    });

    const syncData = await syncResponse.json();
    console.log(`Sync response (${syncResponse.status}):`, JSON.stringify(syncData, null, 2));

    // Test calculate-scores endpoint
    const scoresUrl = `${baseUrl}/api/cron/calculate-scores`;
    console.log(`\nCalling: ${scoresUrl}`);
    
    const scoresResponse = await fetch(scoresUrl, {
      method: 'GET',
      headers: authHeader ? { 'Authorization': authHeader } : {},
    });

    const scoresData = await scoresResponse.json();
    console.log(`Scores response (${scoresResponse.status}):`, JSON.stringify(scoresData, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Cron endpoints tested',
      results: {
        sync: {
          status: syncResponse.status,
          data: syncData,
        },
        scores: {
          status: scoresResponse.status,
          data: scoresData,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron test error:', error);
    return NextResponse.json(
      { error: 'Failed to test cron endpoints', details: (error as Error).message },
      { status: 500 }
    );
  }
}
