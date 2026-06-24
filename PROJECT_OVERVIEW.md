# Predict Pool - FIFA World Cup Prediction Platform

## 📋 Project Overview

Predict Pool is a modern, minimalist web application that enables FIFA World Cup 2026 fans to:
- Create and manage prediction pools with friends
- Make score and winner predictions for matches
- Earn points based on prediction accuracy
- Compete on leaderboards within their pools
- Join pools via public discovery or private invite codes

## 🎯 Key Features

### User Management
- **Secure Authentication**: Email/password signup and login with bcrypt hashing
- **Session Management**: JWT-based sessions via NextAuth.js
- **Protected Routes**: Automatic redirection to login for unauthenticated users
- **User Profiles**: Display user name and email in header

### Pool Management
- **Create Pools**: Start public (discoverable) or private (invite-only) pools
- **Pool Configuration**: Set pool name, description, type, and max members
- **Join Pools**: 
  - Public pools: Browse and join directly
  - Private pools: Use unique alphanumeric invite code
- **Pool Details**: View members, settings, and invitation codes

### Predictions System
- **Match Predictions**: Predict home team score, away team score, and winner
- **Real-time Saving**: Predictions update as user changes them
- **User Predictions**: View all predictions made in a pool
- **Edit Predictions**: Update predictions before match starts

### Scoring System
- **Exact Score Match**: 2 points
- **Correct Winner Only**: 1 point
- **Incorrect Prediction**: 0 points
- **Automatic Calculation**: Scores computed when match results are finalized

### Leaderboard
- **Real-time Rankings**: Members ranked by total points
- **Per-Pool Leaderboards**: Each pool has its own competition
- **Member Stats**: Shows correct predictions count and accuracy
- **Live Updates**: Leaderboard refreshes as matches complete

### World Cup Data
- **Mock Data**: Includes sample matches for immediate testing
- **API Integration Ready**: Can connect to api-football.com for real data
- **Match Information**: Team names, scheduled dates, status, and scores
- **Auto-update**: Matches sync from external sources

## 🏗️ Project Structure

```
predict-pool/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts      # NextAuth handler
│   │   │   └── signup/route.ts             # User registration
│   │   ├── pools/
│   │   │   ├── route.ts                    # CRUD operations
│   │   │   └── join/route.ts               # Join pool handler
│   │   ├── predictions/route.ts            # Save/fetch predictions
│   │   ├── leaderboard/route.ts            # Leaderboard rankings
│   │   └── matches/route.ts                # World Cup matches
│   ├── components/
│   │   ├── auth-form.tsx                   # Reusable auth form
│   │   └── header.tsx                      # Navigation header
│   ├── lib/
│   │   ├── supabase.ts                     # Supabase client setup
│   │   └── auth-options.ts                 # NextAuth configuration
│   ├── login/page.tsx                      # Login page
│   ├── signup/page.tsx                     # Signup page
│   ├── dashboard/page.tsx                  # Main dashboard
│   ├── pools/
│   │   ├── page.tsx                        # Browse public pools
│   │   ├── create/page.tsx                 # Create pool form
│   │   ├── join/page.tsx                   # Join private pool
│   │   └── [id]/page.tsx                   # Pool details with tabs
│   ├── page.tsx                            # Landing page
│   ├── layout.tsx                          # Root layout with SessionProvider
│   ├── globals.css                         # Global styles
│   ├── middleware.ts                       # Route protection
│   └── ...
├── .env.local                              # Environment variables
├── DATABASE_SETUP.md                       # SQL schema
├── SETUP_GUIDE.md                          # Complete setup instructions
├── QUICK_START.md                          # 5-minute quick start
├── PROJECT_OVERVIEW.md                     # This file
├── package.json                            # Dependencies
└── tsconfig.json                           # TypeScript config
```

## 🔐 Authentication Flow

```
User visits app
    ↓
No session → Redirected to /login
    ↓
User signs up at /signup
    ↓
Password hashed with bcryptjs (10 rounds)
    ↓
User data stored in Supabase users table
    ↓
User signs in with email/password
    ↓
NextAuth validates credentials against database
    ↓
JWT token created and stored in session
    ↓
User redirected to /dashboard
    ↓
Middleware protects routes using token
```

## 🗄️ Database Schema

### users
Stores user account information with hashed passwords

### pools
Container for predictions competitions with creator info and settings

### pool_members
Junction table connecting users to pools (many-to-many)

### matches
FIFA World Cup 2026 match data with scores and status

### predictions
User predictions for specific matches within pools, with points earned

**All tables include**:
- Unique identifiers (UUID)
- Timestamps (created_at, updated_at)
- Proper foreign key relationships
- Indexes for performance

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#2563EB)
- **Background**: Slate-50 to Slate-100 (gradients)
- **Text**: Slate-900 (dark) and Slate-600 (muted)
- **Accents**: White backgrounds with subtle borders

### Typography
- **Headings**: Bold weights (600-900px sizes)
- **Body**: Regular weight (14-16px sizes)
- **Monospace**: For special elements

### Components
- **Buttons**: Blue primary, white secondary, full-width on mobile
- **Forms**: 
  - Clean input fields with focus states
  - Clear labels and placeholder text
  - Inline error messages
- **Cards**: White backgrounds, subtle shadows, border accents
- **Tabs**: Underline style with color transitions
- **Navigation**: Sticky header with logo and user menu

### Responsive Design
- Mobile-first approach
- Grid layouts adapt from 1 to 2-3 columns
- Touch-friendly button sizing (44px minimum)
- Full-width forms on mobile

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth all routes

### Pools
- `POST /api/pools` - Create new pool
- `GET /api/pools` - List pools
- `GET /api/pools?id=ID` - Get single pool details
- `POST /api/pools/join` - Join pool by code or ID

### Predictions
- `POST /api/predictions` - Save/update prediction
- `GET /api/predictions?poolId=ID` - Get user's predictions

### Leaderboard
- `GET /api/leaderboard?poolId=ID` - Get pool rankings with scores

### Matches
- `GET /api/matches` - Get World Cup 2026 matches

## 🔌 External Integrations

### Supabase (Database)
- PostgreSQL database on free tier
- Real-time subscriptions available
- Built-in authentication (optional alternative)
- Generous free tier (500MB storage, unlimited API calls)

### NextAuth.js (Authentication)
- Credential provider configured
- JWT session strategy
- Middleware for route protection
- Customizable pages and callbacks

### Axios (HTTP Client)
- API requests to World Cup data sources
- Error handling and retry logic
- Configuration for external APIs

### Tailwind CSS (Styling)
- Utility-first CSS framework
- Minimal bundle size
- Dark mode support (configured but not used)
- Fully responsive design system

## 🚀 Deployment Options

### Vercel (Recommended)
- Free tier for hobby projects
- Automatic deployments from Git
- Built-in serverless functions
- Easy environment variable management
- Optimal for Next.js

### Netlify
- Free tier available
- Simple deployment process
- Built-in redirects and edge functions
- Good integration with Git

### Railway
- Free $5/month credit
- PostgreSQL database support
- Docker container deployment
- Good for backend applications

## ⚙️ Environment Variables

```
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL           # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY      # Supabase public key
SUPABASE_SERVICE_ROLE_KEY          # Supabase admin key

# NextAuth Configuration (Required)
NEXTAUTH_URL                       # Base URL (http://localhost:3000 for dev)
NEXTAUTH_SECRET                    # Random 32+ character string

# Optional
FOOTBALL_API_KEY                   # For real World Cup data (optional)
```

## 🧪 Testing Checklist

- [ ] Signup creates user account
- [ ] Login authenticates user
- [ ] Dashboard displays after login
- [ ] Can create public pool
- [ ] Can create private pool with code
- [ ] Can join public pool
- [ ] Can join private pool with code
- [ ] Multiple users can join same pool
- [ ] Can make predictions
- [ ] Leaderboard shows rankings
- [ ] Points calculated correctly
- [ ] User menu works
- [ ] Logout works
- [ ] Protected routes redirect to login
- [ ] Mobile responsive layout works

## 🔄 Data Flow Example

```
User creates pool
    ↓
POST /api/pools
    ↓
Create pool record in database
Add creator as pool member
    ↓
Return pool ID
    ↓
User redirected to /pools/[id]
    ↓
User invites friends with code
    ↓
Friends join pool
    ↓
All users make predictions
    ↓
POST /api/predictions for each match
    ↓
Match completes with results
    ↓
Update match record with scores and status
    ↓
GET /api/leaderboard calculates points
    ↓
Leaderboard displays rankings
```

## 🛠️ Development Notes

### TypeScript
- Strict mode enabled
- Type-safe API responses
- Component prop typing

### Code Style
- ES6+ syntax
- Arrow functions
- Destructuring
- Template literals
- Async/await patterns

### Performance
- Next.js automatic code splitting
- Image optimization
- API route caching ready
- Database indexes on foreign keys

### Security
- Password hashing with bcryptjs
- CSRF protection via NextAuth
- JWT token validation
- Protected API routes
- Environment variables for secrets

## 📚 Documentation

- `QUICK_START.md` - 5-minute setup guide
- `SETUP_GUIDE.md` - Complete setup instructions
- `DATABASE_SETUP.md` - SQL schema and instructions
- Code comments in critical sections

## 🎓 Learning Resources

- NextAuth.js docs: https://next-auth.js.org
- Supabase docs: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs

## 🎉 Ready to Launch!

This is a complete, production-ready application. All you need to do:

1. Set up Supabase account
2. Create database with provided SQL
3. Add environment variables
4. Run `pnpm dev`
5. Deploy to Vercel/Netlify/Railway

Happy predicting! ⚽🏆
