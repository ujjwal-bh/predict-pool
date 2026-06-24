-- Migration: Update matches table to include all Football-Data.org fields
-- Run this in Supabase SQL Editor to update your schema

-- Drop the existing matches table (if it exists and is empty)
-- WARNING: This will delete any existing match data
DROP TABLE IF EXISTS matches CASCADE;

-- Create the updated matches table with all fields from Football-Data.org API
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id_external VARCHAR(255) UNIQUE NOT NULL,
  
  -- Team information
  home_team VARCHAR(255) NOT NULL,
  home_team_id INT,
  away_team VARCHAR(255) NOT NULL,
  away_team_id INT,
  
  -- Match details
  match_date TIMESTAMP NOT NULL,
  matchday INT,
  stage VARCHAR(50),
  group_name VARCHAR(50),
  
  -- Scores
  home_score INT,
  away_score INT,
  home_score_ht INT,
  away_score_ht INT,
  
  -- Match status and winner
  status VARCHAR(50) DEFAULT 'pending',
  winner VARCHAR(50),
  duration VARCHAR(50),
  
  -- Metadata
  last_updated TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_matches_match_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_match_id_external ON matches(match_id_external);
CREATE INDEX idx_matches_stage ON matches(stage);
