# 🎯 Next Steps - Get Predict Pool Running

## You've built a complete app! Here's what to do next:

### Step 1: Create Supabase Account (5 min)
1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up (email or GitHub)
4. Create a new project
   - Name: `predict-pool`
   - Password: Generate secure password
   - Region: Pick closest to you
5. **Wait 5-10 minutes** for initialization

### Step 2: Get API Keys (2 min)
1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these three values:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://[project-id].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY = eyJhbGc...
   ```

### Step 3: Create Database (5 min)
1. In Supabase, go to **SQL Editor**
2. Click **"New query"**
3. Copy **ALL SQL from `DATABASE_SETUP.md`**
4. Paste into SQL Editor
5. Click **"Run"**
6. Verify tables appear in left sidebar under **Tables**

### Step 4: Setup Environment Variables (2 min)

The `.env.local` file already exists. Update it with your values:

```env
# From Supabase Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# NextAuth (keep as is for local dev)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=use_output_from_below
```

### Generate NEXTAUTH_SECRET
Run in terminal:
```bash
openssl rand -base64 32
```

Copy the output into `.env.local` for NEXTAUTH_SECRET

Or use online generator: https://generate-secret.vercel.app/32

### Step 5: Run Development Server (1 min)
```bash
pnpm dev
```

Open http://localhost:3000 in your browser

### Step 6: Test the App (5 min)

1. **Sign Up**
   - Click "Sign Up"
   - Enter name, email, password (8+ chars)
   - Click "Create Account"

2. **Dashboard**
   - Should see welcome message
   - Three options: Create Pool, Public Pools, Join with Code

3. **Create a Pool**
   - Click "Create Pool"
   - Fill in pool name
   - Choose "Public" or "Private"
   - Click "Create Pool"

4. **Make Predictions** (placeholder for now)
   - Click on your pool
   - See "Make Predictions" tab
   - Will show sample matches once configured

5. **View Leaderboard**
   - Click "Leaderboard" tab
   - Shows rankings (empty until predictions made)

6. **Test Join Flow**
   - Create another account (use incognito window)
   - Join the pool (public) or use private code
   - Both users should see each other

## ✅ Checklist

- [ ] Supabase account created
- [ ] Database tables set up
- [ ] `.env.local` updated with API keys
- [ ] `NEXTAUTH_SECRET` generated and added
- [ ] `pnpm dev` runs without errors
- [ ] Can sign up at http://localhost:3000/signup
- [ ] Can log in at http://localhost:3000/login
- [ ] Can create a pool
- [ ] Can view dashboard
- [ ] Can log out

## 🐛 Troubleshooting

**"Missing Supabase environment variables"**
- Make sure `.env.local` has all 3 Supabase variables
- Restart dev server after updating `.env.local`

**"User not found" on login**
- Verify you created an account via signup
- Check that email and password match exactly

**"Failed to create pool"**
- Ensure you're logged in
- Check that database tables were created successfully
- Check browser console for error details

**"Leaderboard is empty"**
- This is normal - appears once matches have results
- Mock matches can be created manually in database

**"Can't find matches"**
- Matches table may need to be populated
- See optional step below for adding matches

## 📊 Optional: Add Real World Cup Matches

### Option A: Use Mock Data (Already works!)
The app includes sample matches. Just make predictions and they'll work.

### Option B: Manually Add Matches
In Supabase SQL Editor:
```sql
INSERT INTO matches (home_team, away_team, match_date, status)
VALUES 
  ('Argentina', 'France', '2026-06-20 18:00', 'pending'),
  ('Brazil', 'Germany', '2026-06-21 14:00', 'pending'),
  ('Spain', 'England', '2026-06-22 20:00', 'pending');
```

### Option C: Use Real API (Advanced)
1. Sign up at https://rapidapi.com/api-sports/api/api-football
2. Get your API key
3. Add to `.env.local`:
   ```
   FOOTBALL_API_KEY=your_key_here
   ```
4. Restart dev server

## 🚀 Deploy to Production

When ready to share with friends:

### Deploy to Vercel (1 click)
1. Push code to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Connect GitHub and select repo
5. Add environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL (use your Vercel domain)
6. Click "Deploy"

### Deploy to Netlify
1. Go to netlify.com
2. Connect GitHub
3. Set build command: `pnpm build`
4. Set publish directory: `.next`
5. Add same environment variables
6. Deploy

## 📖 Full Documentation

- **README.md** - Complete project overview
- **SETUP_GUIDE.md** - Detailed setup instructions
- **DATABASE_SETUP.md** - SQL schema explanation
- **PROJECT_OVERVIEW.md** - Feature breakdown

## 💬 Need Help?

Check out the documentation files above - they have detailed explanations for every part of the app.

## 🎉 You're All Set!

Your FIFA World Cup prediction app is ready. Just need to:
1. Set up Supabase ✓
2. Create database ✓
3. Add environment variables ✓
4. Run locally ✓
5. Deploy to production ✓

**Time to make your first prediction!** ⚽🏆
