# ⚽ Predict Pool - FIFA World Cup 2026 Prediction Platform

A modern, minimal web application for FIFA World Cup 2026 predictions with pools, leaderboards, and real-time scoring.

## ✨ Features

- **User Authentication**: Secure signup/login with bcrypt password hashing
- **Pool Management**: Create public or private prediction pools
- **Predictions**: Make score and winner predictions for World Cup matches
- **Scoring System**: 2 points for exact score, 1 point for correct winner
- **Leaderboards**: Real-time rankings within each pool
- **Responsive Design**: Beautiful UI that works on all devices
- **SEO Optimized**: Meta tags, structured data, and accessibility
- **Protected Routes**: API and page-level authentication
- **Free Deployment**: Deploy to Vercel, Netlify, or Railway

## 🚀 Quick Start

### 1. Set Up Supabase (3 minutes)
```bash
# Go to https://supabase.com
# Click "Start your project"
# Create account and new project
# Copy your API keys to .env.local
```

### 2. Setup Database
In Supabase SQL Editor, run the SQL from `DATABASE_SETUP.md`

### 3. Configure Environment
```bash
# Create .env.local with these values:
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=run_openssl_rand_-base64_32
```

### 4. Run Development Server
```bash
pnpm install  # Already done
pnpm dev      # Start at http://localhost:3000
```

### 5. Test the App
1. Sign up at http://localhost:3000/signup
2. Create a pool at /pools/create
3. Make predictions
4. View leaderboard

## 📁 Project Structure

```
predict-pool/
├── app/
│   ├── api/                    # Backend API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── pools/             # Pool management
│   │   ├── predictions/       # Prediction saving
│   │   ├── leaderboard/       # Rankings
│   │   └── matches/           # World Cup data
│   ├── components/            # Reusable React components
│   │   ├── header.tsx         # Navigation
│   │   └── auth-form.tsx      # Login/signup form
│   ├── lib/                   # Utility functions
│   │   ├── supabase.ts        # Database client
│   │   └── auth-options.ts    # NextAuth config
│   ├── login/                 # Login page
│   ├── signup/                # Signup page
│   ├── dashboard/             # Main dashboard
│   ├── pools/                 # Pool pages
│   │   ├── create/            # Create pool form
│   │   ├── join/              # Join pool form
│   │   ├── page.tsx           # Browse pools
│   │   └── [id]/              # Pool details
│   ├── page.tsx               # Landing page
│   ├── layout.tsx             # Root layout
│   ├── providers.tsx          # Session provider
│   ├── middleware.ts          # Route protection
│   └── globals.css            # Tailwind styles
├── DATABASE_SETUP.md          # SQL schema
├── SETUP_GUIDE.md             # Detailed setup
├── QUICK_START.md             # Quick reference
├── PROJECT_OVERVIEW.md        # Feature breakdown
├── .env.local                 # Environment variables
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript config
```

## 🔐 Authentication

- Email/password signup
- Bcryptjs password hashing (10 rounds)
- NextAuth.js session management
- JWT tokens
- Protected API routes via middleware

## 🗄️ Database Schema

### users
- User accounts with hashed passwords

### pools
- Prediction pools (public/private)
- Creator info and settings
- Invite codes for private pools

### pool_members
- Many-to-many relationship between users and pools

### matches
- FIFA World Cup 2026 matches
- Team names, dates, scores, status

### predictions
- User predictions for matches
- Score predictions and points earned

All with proper indexes and foreign keys.

## 🎨 UI/UX

- **Minimal Design**: Clean, modern interface
- **Responsive**: Works on mobile, tablet, desktop
- **Blue Theme**: Professional World Cup colors
- **Accessible**: WCAG guidelines
- **Fast**: Optimized bundle size
- **Dark Mode Ready**: Tailwind config supports dark mode

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/[...nextauth]` - NextAuth routes

### Pools
- `POST /api/pools` - Create pool
- `GET /api/pools` - List pools
- `POST /api/pools/join` - Join pool

### Predictions
- `POST /api/predictions` - Save prediction
- `GET /api/predictions` - Get user predictions

### Leaderboard
- `GET /api/leaderboard` - Pool rankings

### Matches
- `GET /api/matches` - World Cup matches

All protected routes require authentication.

## 📊 Scoring Example

```
Match: Argentina 2-1 France
User predicts: Argentina 2-1 France  → 2 points ✓
User predicts: Argentina 1-0 France  → 0 points ✗
User predicts: Argentina win (any)   → 1 point ✓
```

## 🌐 Deploy to Production

### Vercel (Recommended)
```bash
# Push to GitHub
git push origin main

# Go to vercel.com
# Connect GitHub and import project
# Add env variables
# Deploy with one click
```

### Netlify
```bash
# Build command: pnpm build
# Publish directory: .next
# Add environment variables
# Deploy
```

### Railway
```bash
# Connect GitHub repository
# Configure environment variables
# Deploy automatically
```

## 🧪 Testing Checklist

- [ ] Signup creates account
- [ ] Login works with correct credentials
- [ ] Wrong password rejected
- [ ] Dashboard loads after login
- [ ] Can create public pool
- [ ] Can create private pool with code
- [ ] Can join public pool
- [ ] Can join private pool with code
- [ ] Can make predictions
- [ ] Multiple users can join pool
- [ ] Leaderboard shows rankings
- [ ] Points calculated correctly
- [ ] Logout works
- [ ] Protected routes redirect
- [ ] Mobile responsive

## 🔧 Configuration

### NextAuth Secret
```bash
# Generate a secure secret:
openssl rand -base64 32

# Or use online tool:
# https://generate-secret.vercel.app/32
```

### API Keys
Get from your Supabase project → Settings → API

### World Cup Data
- **Option 1**: Use included mock data (works immediately)
- **Option 2**: Sign up at api-football.com and add `FOOTBALL_API_KEY`
- **Option 3**: Manually insert matches into `matches` table

## 📚 Documentation

- **QUICK_START.md** - 5-minute setup guide
- **SETUP_GUIDE.md** - Detailed setup instructions
- **DATABASE_SETUP.md** - SQL schema
- **PROJECT_OVERVIEW.md** - Feature breakdown

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS 4
- **Password Hashing**: bcryptjs
- **HTTP Client**: Axios
- **Language**: TypeScript

## 🚢 Build & Deploy

```bash
# Development
pnpm dev

# Production build
pnpm build

# Production start
pnpm start

# Lint
pnpm lint
```

## ❓ Troubleshooting

### Can't connect to Supabase
- Check `.env.local` has all 6 variables
- Verify Supabase project is active

### Signup/Login failing
- Ensure database tables exist
- Check NEXTAUTH_SECRET is set (32+ chars)
- Verify password is 8+ characters

### Predictions not saving
- Check user is authenticated
- Verify match ID exists
- Look at browser console for errors

### Build failing
- Delete `.next` folder and rebuild
- Check all environment variables
- Verify Node.js version matches

## 💡 Tips

- Test with 2-3 user accounts for full experience
- Private pools are great for friend groups
- Use descriptive pool names
- Share pool codes via WhatsApp/Discord
- Update match results for leaderboard to work
- Exact score predictions are competitive (2 pts)

## 🔒 Security

- Passwords hashed with bcryptjs (10 salt rounds)
- JWT tokens for sessions
- Protected API routes
- Environment variables for secrets
- CORS enabled on API routes
- Input validation on all forms
- SQL injection prevented with ORM queries

## 📝 License

This project is open source and available for personal use.

## 🙋 Support

For issues with:
- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **NextAuth.js**: https://next-auth.js.org
- **Tailwind CSS**: https://tailwindcss.com/docs

## 🎉 Ready to Launch!

You now have a complete, production-ready World Cup prediction platform. 

Next steps:
1. Set up Supabase account
2. Create database with SQL
3. Add environment variables
4. Run `pnpm dev`
5. Deploy to Vercel/Netlify
6. Share with friends!

**Happy predicting!** ⚽🏆

---

Made with ❤️ for World Cup fans
