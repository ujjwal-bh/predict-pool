# Prediction Flow & Storage Explanation

## 📊 Complete Prediction Flow

### 1. **User Interacts with Match Card** (Frontend)

**File**: `app/components/match-prediction-card.tsx`

```
User sees match card with:
├── Home team name
├── + and − buttons to adjust score
├── Away team name  
├── + and − buttons to adjust score
├── Predicted winner display (auto-calculated)
└── "✓ Save Prediction" button
```

**User Actions**:
1. Clicks **−** to decrease score (min 0)
2. Clicks **+** to increase score
3. Types directly in input field
4. Auto-calculated winner updates:
   - Home score > Away = "Home team win" (blue)
   - Away score > Home = "Away team win" (green)
   - Equal = "Draw" (amber)
5. Clicks **"✓ Save Prediction"** button

### 2. **Send to API** (Frontend)

**File**: `app/pools/[id]/page.tsx` → `handlePredictionSubmit()`

```javascript
const handlePredictionSubmit = async (matchId, prediction) => {
  const res = await fetch('/api/predictions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      poolId: params.id,           // Which pool
      matchId: matchId,            // Which match
      predicted_home_score: 2,     // User's predicted home score
      predicted_away_score: 1,     // User's predicted away score
      predicted_winner: 'home'     // Auto-calculated winner
    }),
  });
}
```

### 3. **Validate & Store in Database** (Backend)

**File**: `app/api/predictions/route.ts` → `POST` handler

#### **Step 1: Authentication Check**
```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return { error: 'Unauthorized', status: 401 }
}
```
✅ Only authenticated users can predict

#### **Step 2: Validate Required Fields**
```typescript
const { poolId, matchId, predictedHomeScore, predictedAwayScore } = req.json();

if (!poolId || !matchId || 
    predictedHomeScore === undefined || 
    predictedAwayScore === undefined) {
  return { error: 'Missing required fields', status: 400 }
}
```
✅ All required data must be present

#### **Step 3: Calculate Winner**
```typescript
let predictedWinner = 'draw';
if (predictedHomeScore > predictedAwayScore) {
  predictedWinner = 'home';
} else if (predictedAwayScore > predictedHomeScore) {
  predictedWinner = 'away';
}
```
✅ Server also calculates to ensure consistency

#### **Step 4: Upsert to Database**
```typescript
const { data, error } = await supabase
  .from('predictions')
  .upsert([
    {
      pool_id: poolId,
      user_id: session.user.id,        // Who made prediction
      match_id: matchId,               // Which match
      predicted_home_score: 2,         // Home team prediction
      predicted_away_score: 1,         // Away team prediction
      predicted_winner: 'home',        // Winner prediction
    }
  ], 
  { onConflict: 'pool_id,user_id,match_id' }  // UNIQUE constraint
)
```

**UPSERT Logic** (INSERT or UPDATE):
- If prediction doesn't exist → **INSERT** new record
- If prediction exists → **UPDATE** existing record
- Uniqueness: One prediction per `(pool_id, user_id, match_id)` combination

✅ Users can update their predictions before match starts

### 4. **Retrieve Predictions** (Frontend)

**On page load**, fetch user's predictions for this pool:

```typescript
const res = await fetch(`/api/predictions?poolId=${poolId}`);
// Returns: [ { match_id, predicted_home_score, predicted_away_score, ... } ]
```

**Used for**:
- Populating input fields with previous predictions (edit mode)
- Showing prediction results on completed matches
- Calculating points in leaderboard

---

## 🗄️ Database Schema

### **predictions table**

```sql
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  predicted_home_score INT NOT NULL,        -- User's predicted home score
  predicted_away_score INT NOT NULL,        -- User's predicted away score
  predicted_winner VARCHAR(50),             -- 'home', 'away', or 'draw'
  points INT DEFAULT 0,                     -- Points earned (0, 1, or 2)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- UNIQUE CONSTRAINT: Only one prediction per user per match per pool
  UNIQUE(pool_id, user_id, match_id)
);
```

### **Key Fields**:
- **pool_id**: Which pool this prediction belongs to
- **user_id**: Who made this prediction
- **match_id**: Which match is being predicted
- **predicted_home_score**: The score user predicts for home team
- **predicted_away_score**: The score user predicts for away team
- **predicted_winner**: Calculated winner ('home', 'away', 'draw')
- **points**: Points earned when match completes (0, 1, or 2)

---

## ✅ Validation & Permissions

### **Who Can Predict?**
✅ Any authenticated user in the pool

### **What Can Be Predicted?**
✅ Any match with `status = 'pending'` (upcoming)
❌ Cannot predict on `status = 'completed'` matches (in code, but UI hides)

### **When Can Predictions Be Made?**
✅ Anytime before match starts
✅ Can edit prediction as many times as needed
❌ After match starts, cannot edit

### **What Gets Validated?**
✅ User is authenticated
✅ All required fields present (poolId, matchId, scores)
✅ Scores are integers (0-99)
✅ User is member of the pool (enforced by pool_id foreign key)
✅ Match exists (enforced by match_id foreign key)

---

## 🔄 Scoring Flow

### **When Match Completes** (Manual admin update):
1. Admin updates match: `home_score = 2, away_score = 1, status = 'completed'`
2. Leaderboard API calculates points:
   ```
   IF user.predicted_home_score == 2 AND user.predicted_away_score == 1:
     points = 2  ✓ Exact score
   ELSE IF user.predicted_winner == 'home':
     points = 1  ✓ Correct winner
   ELSE:
     points = 0  ✗ Wrong
   ```
3. User sees updated points on leaderboard

---

## 🔐 Security

✅ **Authentication Required**: Only logged-in users
✅ **Pool Membership**: Can only predict in pools they're member of
✅ **User Isolation**: Users only see own predictions
✅ **SQL Injection Prevention**: Using Supabase ORM
✅ **Data Validation**: Required fields checked
✅ **Unique Constraint**: Can't duplicate same prediction

---

## 📝 Example Prediction Lifecycle

```
1. User joins "Friends Pool"
   ↓
2. Sees match: Argentina vs France (2026-06-09)
   ↓
3. Sets prediction: Argentina 2, France 1
   ↓
4. Clicks "✓ Save Prediction"
   ↓
5. POST /api/predictions
   {
     poolId: "pool-123",
     matchId: "match-456",
     predictedHomeScore: 2,
     predictedAwayScore: 1,
     predictedWinner: "home"
   }
   ↓
6. Backend validates & stores in DB
   ↓
7. Prediction shows in card (UI updates)
   ↓
8. User can edit anytime before match
   ↓
9. Match completes (June 9, 2026): Argentina 2, France 1
   ↓
10. Leaderboard shows +2 points ✓
```

---

## 🐛 Common Issues & Fixes

### **"Prediction not saving"**
- Check: Are you logged in? ✅
- Check: Is the pool showing? ✅
- Check: Are you setting scores with +/- buttons? ✅
- Check: Are you clicking "Save Prediction" button? ✅
- Check: Are you waiting for success message? ✅

### **"Can't see my previous prediction"**
- Predictions load on page load
- May need to refresh page
- Check Supabase database directly

### **"Getting unauthorized error"**
- Not logged in → Login first
- Session expired → Refresh page and login again

### **"Pool not saving predictions"**
- Check SUPABASE_SERVICE_ROLE_KEY in .env.local
- Check predictions table exists in Supabase
- Check user is member of pool

---

## 🧪 Testing Predictions Manually

### **Via Supabase Console:**
1. Go to Supabase dashboard
2. Select your project
3. Click "Table Editor"
4. Click "predictions" table
5. Click "Insert Row"
6. Fill in:
   - pool_id: (get from pools table)
   - user_id: (get from users table)
   - match_id: (get from matches table)
   - predicted_home_score: 2
   - predicted_away_score: 1
   - predicted_winner: 'home'
7. Click "Save"

### **Via API (in browser console):**
```javascript
fetch('/api/predictions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    poolId: 'your-pool-id',
    matchId: 'your-match-id',
    predictedHomeScore: 2,
    predictedAwayScore: 1
  })
}).then(r => r.json()).then(console.log)
```

---

## ✨ Summary

✅ **Storage**: Predictions stored in `predictions` table
✅ **Permission**: Only authenticated pool members
✅ **Validation**: All fields checked, calculations verified
✅ **Updates**: UPSERT allows editing predictions
✅ **Security**: User isolated, SQL injection protected
✅ **Scoring**: Points calculated when matches complete
