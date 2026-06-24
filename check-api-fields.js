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
        console.log('API Response Structure:');
        console.log('=====================\n');
        
        const firstMatch = parsed.matches[0];
        console.log('Sample match object:');
        console.log(JSON.stringify(firstMatch, null, 2));
        
        console.log('\n\nAvailable top-level fields in each match:');
        console.log(Object.keys(firstMatch).join(', '));
      } else {
        console.log('No matches found or unexpected response:');
        console.log(JSON.stringify(parsed, null, 2));
      }
    } catch (e) {
      console.error('Error parsing response:', e.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
  process.exit(1);
});

req.end();
