# Daily Sync & Score Calculation Setup

## 🎯 Architecture Overview

The app now uses a three-layer system:

```
Football-Data.org API
        ↓
[Daily Cron Job] → Sync matches to database
        ↓
Database (Supabase)
        ↓
[App] ← Fetch matches from database
        ↓
[Another Cron Job] → Calculate prediction scores
        ↓
Leaderboard updated
```

---

## 📋 Setup Steps

### Step 1: Add Environment Variables

Update `.env.local`:

```
# Football Data API Token
FOOTBALL_DATA_API_KEY=your_token_here

# Cron Secret (for security)
CRON_SECRET=your_secret_key_here_min_32_chars

# Timezone for scheduled tasks (optional)
CRON_TIMEZONE=UTC
```

### Step 2: Create Cron Jobs

You have multiple options:

#### Option A: Vercel Cron (Recommended for Vercel deployments)

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-matches",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/calculate-scores",
      "schedule": "0 3 * * *"
    }
  ]
}
```

**Schedule explanations:**
- `0 2 * * *` = Daily at 2 AM UTC (sync matches)
- `0 3 * * *` = Daily at 3 AM UTC (calculate scores)

Adjust times based on when World Cup matches are played.

#### Option B: EasyCron (Free external cron service)

1. Go to https://www.easycron.com
2. Sign up for free
3. Create two cron jobs:

**Job 1 - Sync Matches:**
- URL: `https://yourapp.com/api/cron/sync-matches`
- Headers: `Authorization: Bearer your_secret_key_here`
- Frequency: Daily at 2 AM UTC

**Job 2 - Calculate Scores:**
- URL: `https://yourapp.com/api/cron/calculate-scores`
- Headers: `Authorization: Bearer your_secret_key_here`
- Frequency: Daily at 3 AM UTC

#### Option C: Node-Cron (For local development)

Create `lib/cron-jobs.ts`:

```typescript
import cron from 'node-cron';
import fetch from 'node-fetch';

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret';

export function initializeCronJobs() {
  // Sync matches daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Running sync-matches cron job...');
    try {
      await fetch(`${BASE_URL}/api/cron/sync-matches`, {
        headers: { 'Authorization': `Bearer ${CRON_SECRET}` },
      });
      console.log('Sync-matches completed');
    } catch (error) {
      console.error('Sync-matches failed:', error);
    }
  });

  // Calculate scores daily at 3 AM
  cron.schedule('0 3 * * *', async () => {
    console.log('Running calculate-scores cron job...');
    try {
      await fetch(`${BASE_URL}/api/cron/calculate-scores`, {
        headers: { 'Authorization': `Bearer ${CRON_SECRET}` },
      });
      console.log('Calculate-scores completed');
    } catch (error) {
      console.error('Calculate-scores failed:', error);
    }
  });

  console.log('Cron jobs initialized');
}
```

Then call in your app initialization:

```typescript
import { initializeCronJobs } from '@/lib/cron-jobs';

// In your main app file
initializeCronJobs();
```

---

## 🔄 How It Works

### 1. Sync Matches (Daily at 2 AM)

**What happens:**
1. Cron job calls `/api/cron/sync-matches`
2. App fetches matches from football-data.org API
3. Stores/updates matches in database
4. Returns count of inserted/updated matches

**Endpoint Response:**
```json
{
  "success": true,
  "message": "Synced 48 matches",
  "inserted": 5,
  "updated": 43,
  "timestamp": "2026-06-08T02:00:00Z"
}
```

**Database Query:**
```sql
-- Matches are upserted using match_id_external as unique identifier
-- INSERT if not exists, UPDATE if already exists
```

### 2. Show Matches from Database

**What happens:**
1. User visits pool detail page
2. App calls `/api/matches`
3. Returns all matches from database (sorted by date)
4. UI displays matches with their current status

**No API rate limits** because we fetch from database!

### 3. Calculate Scores (Daily at 3 AM)

**What happens:**
1. Cron job calls `/api/cron/calculate-scores`
2. Finds all completed matches
3. Checks all predictions for those matches
4. Calculates points for each prediction:
   - 2 points = exact score match
   - 1 point = correct winner
   - 0 points = wrong
5. Updates predictions with points

**Example calculation:**
```
Match: Argentina 2-1 France

User 1 predicted: 2-1 → 2 points ✓
User 2 predicted: 2-0 → 1 point (correct winner)
User 3 predicted: 1-2 → 0 points (wrong)
```

---

## 🧪 Testing Locally

### Manual Test 1: Sync Matches

```bash
curl -X GET http://localhost:3000/api/cron/sync-matches \
  -H "Authorization: Bearer dev-secret"
```

Expected response:
```json
{
  "success": true,
  "message": "Synced 48 matches",
  "inserted": 48,
  "updated": 0
}
```

### Manual Test 2: Calculate Scores

First, mark a match as completed in database, then:

```bash
curl -X GET http://localhost:3000/api/cron/calculate-scores \
  -H "Authorization: Bearer dev-secret"
```

Expected response:
```json
{
  "success": true,
  "message": "Scores calculated successfully",
  "scoresUpdated": 5
}
```

---

## 📊 Database Schema

### Matches Table
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY,
  match_id_external VARCHAR(255) UNIQUE,  -- External API ID
  home_team VARCHAR(255),
  away_team VARCHAR(255),
  match_date TIMESTAMP,
  home_score INT,
  away_score INT,
  status VARCHAR(50),  -- 'pending' or 'completed'
  stage VARCHAR(100),  -- 'Group A', 'Group B', etc.
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Predictions Table
```sql
CREATE TABLE predictions (
  id UUID PRIMARY KEY,
  pool_id UUID REFERENCES pools(id),
  user_id UUID REFERENCES users(id),
  match_id UUID REFERENCES matches(id),
  predicted_home_score INT,
  predicted_away_score INT,
  predicted_winner VARCHAR(50),
  points INT,  -- Calculated daily (0, 1, or 2)
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🔐 Security

### Authorization
- Each cron job requires `Authorization: Bearer {CRON_SECRET}` header
- Generate a strong secret (32+ characters):
  ```bash
  openssl rand -base64 32
  ```
- Store in `.env.local` (development) and deployment service (production)

### Rate Limiting
- Football-Data API: 10 requests/minute (plenty)
- Database sync happens once daily
- Score calculation happens once daily

---

## 🚀 Production Deployment

### For Vercel:
1. Add `vercel.json` to your repo
2. Set environment variables in Vercel dashboard
3. Deploy - cron jobs start automatically

### For Other Platforms:
1. Use EasyCron or similar service
2. Set environment variables in platform
3. Configure cron URLs with your domain

---

## 📈 Monitoring

### Check Cron Job Logs:

**In Vercel:**
- Dashboard → Deployments → Logs → Cron

**In Server Logs:**
- Look for "Sync complete", "Score calculation complete" messages

**Manual Check - Visit these URLs:**
```
https://yourapp.com/api/cron/sync-matches?authorization=Bearer...
https://yourapp.com/api/cron/calculate-scores?authorization=Bearer...
```

---

## ⚙️ Schedule Recommendations

**Group Stage (June 8-21, 2026):**
- Sync matches: **2 AM UTC daily** (30 min before earliest match)
- Calculate scores: **3 AM UTC daily** (after night matches finish)

**Adjust based on your timezone:**
- USA East: 2 PM & 3 PM EDT
- Europe: 4 AM & 5 AM CEST
- India: 7:30 AM & 8:30 AM IST

---

## 🆘 Troubleshooting

### "Cron job not running"
- Check Vercel/EasyCron dashboard
- Verify environment variables are set
- Check server logs for errors

### "Matches not updating"
- Run sync job manually: `curl ...`
- Check if API key is valid
- Verify database connection

### "Scores not calculated"
- Manually run score job
- Check if matches are marked as 'completed'
- Verify predictions exist for completed matches

### "Unauthorized error"
- Check `CRON_SECRET` in environment
- Make sure Authorization header matches exactly
- Verify no extra spaces in secret

---

## 📚 Summary

**Daily Flow:**
```
2:00 AM → Sync matches from API to database
3:00 AM → Calculate prediction scores
App users → See updated matches and scores
```

**Benefits:**
- ✅ No API rate limit issues
- ✅ Real-time database-backed matches
- ✅ Automatic daily score calculation
- ✅ Scalable for millions of users
- ✅ Offline-capable (no API calls during runtime)

Your app now has a complete daily sync system! 🎉
