# Quick Start - Predict Pool

## 🚀 Get Running in 5 Minutes

### 1. Create Supabase Account (2 minutes)
- Go to https://supabase.com → **Start your project**
- Create an account → Create a new project
- Wait for initialization

### 2. Copy API Keys
In Supabase → **Settings** → **API**:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

### 3. Setup Database
In Supabase → **SQL Editor** → **New query**:
Paste all SQL from `DATABASE_SETUP.md` and run

### 4. Create `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_with_openssl_rand_-base64_32
```

### 5. Run Locally
```bash
pnpm dev
```
Open http://localhost:3000

## 📝 Create First Pool

1. Click **Sign Up** → Create account
2. Go to **Dashboard**
3. Click **Create Pool**
4. Fill details → Click **Create Pool**
5. Share pool code with friends!

## 🎯 Features Ready to Use

✅ User authentication (signup/login)
✅ Public & private pools
✅ Pool management
✅ Leaderboard system
✅ Minimal beautiful UI
✅ Mobile responsive
✅ SEO optimized
✅ Protected API routes

## ⚙️ One-Time World Cup Setup

To add real matches to database:

### Option 1: Use Mock Data (Built-in)
Already includes sample matches. Works immediately.

### Option 2: Use Real API
1. Sign up at https://rapidapi.com/api-sports/api/api-football
2. Get your API key
3. Add to `.env.local`:
   ```
   FOOTBALL_API_KEY=your_key
   ```
4. Matches will auto-fetch from API

### Option 3: Manual Import
1. Get World Cup 2026 schedule
2. Insert directly into Supabase `matches` table
3. Use SQL:
   ```sql
   INSERT INTO matches (home_team, away_team, match_date, status)
   VALUES 
     ('Argentina', 'France', '2026-06-20', 'pending'),
     ('Brazil', 'Germany', '2026-06-21', 'pending');
   ```

## 🚀 Deploy to Production

### Deploy to Vercel (Free, Recommended)
1. Push to GitHub
2. Go to https://vercel.com
3. Import project
4. Add env variables
5. Done! 🎉

### Deploy to Netlify
1. Connect GitHub
2. Build: `pnpm build`
3. Publish: `.next`
4. Add env variables
5. Deploy

## 📱 Test the App

1. **Signup**: Create 2-3 test accounts
2. **Create Pool**: User 1 creates a pool
3. **Join Pool**: Users 2, 3 join with code
4. **Make Predictions**: Everyone predicts match scores
5. **Check Leaderboard**: See points in real-time

## 🎨 Customize

**Colors**: Edit Tailwind classes in components (currently blue theme)

**Logo**: Replace emoji in `/components/header.tsx`

**Copy**: Update text in pages and components

## 💡 Tips

- Private pools are perfect for friend groups
- Public pools work for large competitions
- 2 points for exact score = more competitive
- Leaderboard updates after match completion
- Share pool codes via WhatsApp, Discord, etc.

## ❓ Issues?

**Signup failing?**
- Check `.env.local` has all 6 variables
- Verify database tables exist in Supabase

**Predictions not working?**
- Ensure logged in
- Check matches exist in database

**Leaderboard blank?**
- Matches need `status: 'completed'` and scores set

## 📖 Full Documentation

See `SETUP_GUIDE.md` for complete setup details.

---

**Ready to predict?** Start at http://localhost:3000 🎯⚽
