#!/usr/bin/env node

const https = require('https');

const apiKey = process.env.FOOTBALL_DATA_API_KEY || '5acf49903f81470b9fee933e0b67e914';

const options = {
  hostname: 'api.football-data.org',
  port: 443,
  path: '/v4/competitions/WC/matches?season=2026',
  method: 'GET',
  headers: {
    'X-Auth-Token': apiKey,
  },
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.matches && parsed.matches.length > 0) {
        console.log(`Total matches: ${parsed.matches.length}\n`);
        
        let validCount = 0;
        let invalidCount = 0;
        const invalidMatches = [];

        for (const match of parsed.matches) {
          if (!match.homeTeam?.name || !match.awayTeam?.name) {
            invalidCount++;
            invalidMatches.push({
              id: match.id,
              status: match.status,
              homeTeam: match.homeTeam,
              awayTeam: match.awayTeam,
              utcDate: match.utcDate,
              stage: match.stage,
            });
          } else {
            validCount++;
          }
        }

        console.log(`Valid matches: ${validCount}`);
        console.log(`Invalid matches (missing team data): ${invalidCount}\n`);

        if (invalidMatches.length > 0) {
          console.log('Invalid matches details:');
          console.log(JSON.stringify(invalidMatches, null, 2));
        }
      }
    } catch (e) {
      console.error('Error parsing response:', e.message);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
  process.exit(1);
});

req.end();
