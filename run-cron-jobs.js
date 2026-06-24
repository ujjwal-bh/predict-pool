#!/usr/bin/env node

const http = require('http');

const CRON_SECRET = process.env.CRON_SECRET || '4ab83c64fc4933d5f681812d46aa2d2f';
const BASE_URL = 'http://localhost:3000';

async function runCronJob(endpoint, name) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: endpoint,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function main() {
  console.log('Starting cron jobs...\n');

  try {
    console.log('1️⃣  Running SYNC-MATCHES...');
    const syncResult = await runCronJob('/api/cron/sync-matches', 'Sync Matches');
    console.log(`Status: ${syncResult.status}`);
    console.log(`Response:`, JSON.stringify(syncResult.data, null, 2));
    console.log('\n---\n');

    console.log('2️⃣  Running CALCULATE-SCORES...');
    const scoreResult = await runCronJob('/api/cron/calculate-scores', 'Calculate Scores');
    console.log(`Status: ${scoreResult.status}`);
    console.log(`Response:`, JSON.stringify(scoreResult.data, null, 2));
    console.log('\n---\n');

    console.log('✅ Cron jobs completed!');
  } catch (error) {
    console.error('❌ Error running cron jobs:', error.message);
    process.exit(1);
  }
}

main();
