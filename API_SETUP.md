# Football-Data.org Setup - Get Real World Cup Data

## 🎯 Quick Setup (3 minutes)

### Step 1: Get Free API Key
1. Visit: https://www.football-data.org
2. Click "Register" button
3. Fill in your email and password
4. Verify your email (check inbox)
5. Log in to your account

### Step 2: Get Your API Token
1. After logging in, go to your account/profile
2. You'll see your API token displayed
3. Copy it (looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### Step 3: Add to `.env.local`
Open `.env.local` in your project and add:
```
FOOTBALL_DATA_API_KEY=your_api_token_here
```

For example:
```
FOOTBALL_DATA_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### Step 4: Restart Dev Server
```bash
pnpm dev
```

✅ Done! Your app now uses real World Cup data!

---

## ✨ What You Get

### With API Key:
- ✅ Real World Cup 2026 matches
- ✅ Live scores when matches are played
- ✅ Actual team names
- ✅ Real match dates/times
- ✅ Match status updates
- ✅ Data cached for 1 hour (to save API calls)

### Without API Key:
- ✅ Fallback mock data (48 matches)
- ✅ All features work perfectly
- ✅ Great for testing/development
- ✅ No API needed

---

## 📊 API Details

**Service**: football-data.org

**Endpoint**: `https://api.football-data.org/v4/competitions/WC/matches?season=2026`

**Headers Required**:
```
X-Auth-Token: YOUR_API_TOKEN
```

**Response Includes**:
- Match ID
- Home & away team names
- Match date/time (UTC)
- Current scores
- Match status (pending/finished)
- Match stage/round

**Rate Limits**:
- Free tier: 10 requests/minute
- Monthly quota: sufficient for this app
- Data cached for 1 hour

---

## 🔍 How to Find Your API Token

### Method 1: In Your Account
1. Go to https://www.football-data.org
2. Log in with your email/password
3. Go to "Account" or "Profile" section
4. Your token is displayed prominently
5. Copy and paste it

### Method 2: Account Settings
1. Click on your username/avatar
2. Go to "Settings"
3. Find "API Token" section
4. Copy the token

---

## ✅ Testing the Setup

### Check if API is working:
1. Restart dev server: `pnpm dev`
2. Open browser console (F12)
3. Go to any pool detail page
4. Look at Network tab
5. You should see successful `/api/matches` response

### Check server logs:
When you visit the app, you should see in terminal:
```
Loaded 38 matches from football-data.org
```

If you don't have API key:
```
No FOOTBALL_DATA_API_KEY provided, using fallback matches
```

---

## 🎯 Free vs Paid Tier

**Free Tier** (Perfect for this app):
- 10 requests/minute
- All World Cup data included
- Real-time updates
- No credit card needed
- Monthly quota sufficient

**Paid Tier** (Optional):
- Unlimited requests
- More data/features
- Priority support
- Not needed for this app

---

## 🆘 Troubleshooting

### "Still seeing mock data even with API key"
- Make sure you restarted dev server: `pnpm dev`
- Check `.env.local` has `FOOTBALL_DATA_API_KEY=...`
- Check server logs for "Loaded X matches from football-data.org"

### "API rate limit exceeded"
- Free tier has 10 requests/minute
- Data is cached for 1 hour
- This shouldn't happen unless you restart dev server 10+ times per minute

### "API key not working"
- Double-check you copied the full token
- Make sure it's in `.env.local` (not `.env`)
- Verify you're logged in at football-data.org
- Check your account shows an active token

### "Getting 401 Unauthorized error"
- API token may have expired
- Try generating a new token
- Make sure you copied the full token correctly

### "Getting 429 Too Many Requests"
- You've exceeded rate limit (10 requests/minute)
- Wait a minute before trying again
- Check if app is making too many requests

---

## 📚 Useful Links

- **Football-Data.org**: https://www.football-data.org
- **API Documentation**: https://www.football-data.org/documentation/api
- **World Cup 2026**: https://www.fifa.com/fifaplus/en/tournaments/mens/world-cup/qatar-2026

---

## 🎯 Summary

1. Register at football-data.org (free, 2 min)
2. Copy your API token
3. Add `FOOTBALL_DATA_API_KEY` to `.env.local`
4. Restart dev server
5. App now has real World Cup data
6. All features work the same way
7. Fallback to mock data if API fails

That's it! Enjoy real World Cup predictions! 🎉
