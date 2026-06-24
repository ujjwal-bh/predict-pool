# Predict Pool - Database Setup Guide

## 1. Create Supabase Project
1. Go to https://supabase.com
2. Sign up or log in
3. Create a new project
4. Copy your project URL and anon key to `.env.local`

## 2. Run These SQL Queries in Supabase SQL Editor

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pools table
CREATE TABLE pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES users(id),
  is_public BOOLEAN DEFAULT FALSE,
  join_code VARCHAR(10) UNIQUE,
  max_members INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pool members
CREATE TABLE pool_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pool_id, user_id)
);

-- Matches
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id_external VARCHAR(255) UNIQUE,
  home_team VARCHAR(255) NOT NULL,
  away_team VARCHAR(255) NOT NULL,
  match_date TIMESTAMP NOT NULL,
  home_score INT,
  away_score INT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Predictions
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  predicted_home_score INT NOT NULL,
  predicted_away_score INT NOT NULL,
  predicted_winner VARCHAR(50),
  points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pool_id, user_id, match_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_pools_creator_id ON pools(creator_id);
CREATE INDEX idx_pool_members_pool_id ON pool_members(pool_id);
CREATE INDEX idx_pool_members_user_id ON pool_members(user_id);
CREATE INDEX idx_predictions_pool_id ON predictions(pool_id);
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_match_id ON predictions(match_id);
CREATE INDEX idx_matches_match_date ON matches(match_date);
```

## 3. Update Environment Variables
After setting up Supabase, add the following to `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (from Settings > API)
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
