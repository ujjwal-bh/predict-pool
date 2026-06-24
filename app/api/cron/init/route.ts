import { NextResponse } from 'next/server';

// Manual cron job initialization endpoint
// In production: Vercel Cron runs jobs automatically (see vercel.json)
// In development: Manually call this endpoint or the cron endpoints directly

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Cron jobs info',
    development: {
      manual: 'Call /api/cron/sync-matches and /api/cron/calculate-scores directly',
      testAll: 'Visit /api/cron/test to run all cron jobs once',
    },
    production: 'Uses Vercel Cron configuration (vercel.json) - runs every 5 minutes',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}
