# Predict Pool - Complete Setup Guide

## Project Overview

Predict Pool is a FIFA World Cup 2026 prediction platform where users can:
- Create public or private prediction pools
- Make score and winner predictions for matches
- Earn points for correct predictions (2 points for exact score, 1 for correct winner)
- View real-time leaderboards within pools
- Join pools with invite codes

## Tech Stack

- **Frontend**: Next.js 16 with React 19
- **Authentication**: NextAuth.js with credentials provider
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Password Hashing**: bcryptjs

## Step 1: Set Up Supabase

### Create a Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with email or GitHub
4. Create a new project:
   - Name: "predict-pool"
   - Database password: Generate a strong password
   - Region: Choose closest to you
   - Wait for project initialization (5-10 minutes)

### Get Your API Keys
1. Go to **Settings** → **API**
2. Copy the following values to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: The service role key

### Set Up Database Schema
1. In Supabase console, go to **SQL Editor**
2. Create a new query and paste the SQL from `DATABASE_SETUP.md`
3. Run the query
4. Verify all tables are created under **Table Editor**

## Step 2: Configure Environment Variables

Create/update `.env.local` in the project root:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_here

# Optional: Football API for real match data
FOOTBALL_API_KEY=demo
```

### Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

## Step 3: Run Locally

```bash
# Install dependencies (already done)
pnpm install

# Run development server
pnpm dev
```

Visit http://localhost:3000

## Step 4: Features Overview

### Authentication
- **Login**: `/login` - Sign in with email and password
- **Sign Up**: `/signup` - Create new account
- Protected routes redirect to login if not authenticated

### Dashboard
- `/dashboard` - Main hub with pool options
- View options to:
  - Create a new pool
  - Browse public pools
  - Join private pool with code

### Pool Management
- `/pools/create` - Create public or private pool
- `/pools` - Browse public pools
- `/pools/join` - Join private pool with code
- `/pools/[id]` - Pool details with predictions and leaderboard

### Predictions & Leaderboard
- Make predictions for upcoming matches
- 2 points for exact score match
- 1 point for correct winner
- Real-time leaderboard rankings

## Step 5: Deploy to Production

### Option A: Deploy to Vercel (Recommended - Free)

1. Push code to GitHub
2. Go to https://vercel.com
3. Connect GitHub account
4. Import this project
5. Add environment variables in Vercel dashboard
6. Deploy automatically on push

### Option B: Deploy to Netlify

1. Connect GitHub repository
2. Build command: `pnpm build`
3. Publish directory: `.next`
4. Add environment variables
5. Deploy

### Option C: Deploy to Railway (Free tier available)

1. Go to https://railway.app
2. Create new project from GitHub
3. Configure environment variables
4. Deploy

## Database Schema

### users
- `id` (UUID) - Primary key
- `email` (VARCHAR) - Unique email
- `name` (VARCHAR) - User's full name
- `password_hash` (VARCHAR) - Bcrypt hashed password
- `created_at` - Timestamp
- `updated_at` - Timestamp

### pools
- `id` (UUID) - Primary key
- `name` (VARCHAR) - Pool name
- `description` (TEXT) - Optional description
- `creator_id` (UUID) - Reference to users
- `is_public` (BOOLEAN) - Public or private
- `join_code` (VARCHAR) - Unique code for private pools
- `max_members` (INT) - Optional member limit
- `created_at` - Timestamp

### pool_members
- `id` (UUID) - Primary key
- `pool_id` (UUID) - Reference to pools
- `user_id` (UUID) - Reference to users
- `joined_at` - Timestamp
- Unique constraint on (pool_id, user_id)

### matches
- `id` (UUID) - Primary key
- `match_id_external` (VARCHAR) - External API match ID
- `home_team` (VARCHAR) - Team name
- `away_team` (VARCHAR) - Team name
- `match_date` (TIMESTAMP) - Scheduled date/time
- `home_score` (INT) - Final home team score
- `away_score` (INT) - Final away team score
- `status` (VARCHAR) - pending, completed, cancelled
- `created_at`, `updated_at` - Timestamps

### predictions
- `id` (UUID) - Primary key
- `pool_id` (UUID) - Reference to pools
- `user_id` (UUID) - Reference to users
- `match_id` (UUID) - Reference to matches
- `predicted_home_score` (INT) - User's predicted home score
- `predicted_away_score` (INT) - User's predicted away score
- `predicted_winner` (VARCHAR) - home, away, or draw
- `points` (INT) - Points earned (0, 1, or 2)
- `created_at`, `updated_at` - Timestamps
- Unique constraint on (pool_id, user_id, match_id)

## API Routes

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth handler

### Pools
- `POST /api/pools` - Create pool (protected)
- `GET /api/pools` - Get pools list (protected)
- `POST /api/pools/join` - Join pool (protected)

### Predictions
- `POST /api/predictions` - Save prediction (protected)
- `GET /api/predictions` - Get user's predictions (protected)

### Leaderboard
- `GET /api/leaderboard` - Get pool leaderboard (protected)

### Matches
- `GET /api/matches` - Get World Cup matches

## Real World Cup Data

The app integrates with:
- **Free option**: Mock data included for testing
- **Upgrade option**: Use api-football.com (has free tier)
  - Sign up at https://rapidapi.com/api-sports/api/api-football
  - Add `FOOTBALL_API_KEY` to environment

## Styling & UI

- Minimal, modern design with Tailwind CSS
- Responsive for mobile, tablet, and desktop
- Blue color scheme matching World Cup vibes
- Accessibility-focused

## Security Notes

- Passwords are hashed with bcryptjs (10 salt rounds)
- JWT tokens for session management
- Protected API routes via NextAuth
- Environment variables for sensitive data
- CORS and CSRF protection with Next.js built-ins

## Troubleshooting

### Can't connect to Supabase
- Check `.env.local` has correct values
- Verify network access in Supabase settings

### Signup/Login not working
- Ensure database tables are created
- Check password meets minimum 8 character requirement

### Predictions not saving
- Verify user is authenticated
- Check match ID exists in database
- Review browser console for errors

### Leaderboard shows incorrect scores
- Matches must have `status: 'completed'`
- Ensure match results are updated in database

## Next Steps

1. Test signup and login
2. Create test pools
3. Add World Cup matches to database
4. Make test predictions
5. Deploy to production
6. Share with friends!

## Support

For issues with:
- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **NextAuth**: https://next-auth.js.org
- **Tailwind CSS**: https://tailwindcss.com/docs
