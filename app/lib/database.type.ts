// ─────────────────────────────────────────────
// Database table types — generated from schema
// ─────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface Pool {
  id: string;
  name: string;
  description: string | null;
  creator_id: string;
  is_public: boolean;
  join_code: string | null;
  max_members: number | null;
  created_at: string;
  updated_at: string;
}

export interface PoolMember {
  id: string;
  pool_id: string;
  user_id: string;
  joined_at: string;
}

export interface Match {
  id: string;
  match_id_external: string;
  home_team: string;
  home_team_id: number | null;
  away_team: string;
  away_team_id: number | null;
  match_date: string;           // ISO timestamp with timezone
  matchday: number | null;
  stage: string | null;
  group_name: string | null;
  home_score: number | null;    // null until match completes
  away_score: number | null;
  home_score_ht: number | null; // half-time scores
  away_score_ht: number | null;
  status: 'pending' | 'live' | 'completed';
  winner: 'home' | 'away' | 'draw' | null;
  duration: string | null;
  last_updated: string | null;
  created_at: string;
  updated_at: string;
}

export interface Prediction {
  id: string;
  pool_id: string;
  user_id: string;
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_winner: 'home' | 'away' | 'draw';
  points: number;               // 0 until match completes
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────
// Joined / enriched types (used in API responses)
// ─────────────────────────────────────────────

/** Pool with its members array (returned by GET /api/pools) */
export interface PoolWithMembers extends Pool {
  pool_members: PoolMember[];
}

/** Pool member with nested user info (returned by Supabase join) */
export interface PoolMemberWithUser extends PoolMember {
  users: Pick<User, 'id' | 'name' | 'email'>;
}

/** Prediction with nested match info */
export interface PredictionWithMatch extends Prediction {
  matches: Pick<Match, 'id' | 'home_score' | 'away_score' | 'status' | 'winner'>;
}

// ─────────────────────────────────────────────
// API response types
// ─────────────────────────────────────────────

/** Single entry in GET /api/leaderboard response */
export interface LeaderboardEntry {
  userId: string;
  name: string;
  email: string;
  totalPoints: number;
  correctPredictions: number;   // exact score hits (2 pts each)
  correctWinners: number;       // right result only (1 pt each)
  totalPredictions: number;
}

/** POST /api/predictions response */
export interface PredictionResponse {
  success: boolean;
  message: string;
  data: Prediction;
}

/** POST /api/predictions request body */
export interface PredictionRequest {
  poolId: string;
  matchId: string;
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_winner?: 'home' | 'away' | 'draw'; // optional — derived from scores if omitted
}

// ─────────────────────────────────────────────
// Utility types
// ─────────────────────────────────────────────

export type MatchStatus = Match['status'];
export type Winner = NonNullable<Match['winner']>;
export type PredictedWinner = Prediction['predicted_winner'];

/** Generic API error shape */
export interface ApiError {
  error: string;
}
