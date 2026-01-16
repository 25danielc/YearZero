# Resolution Arcade

A full-stack web application for tracking New Year's resolutions with gamification, streaks, and analytics. Built with Next.js 14, TypeScript, Prisma, and NextAuth.

## Features

- ✅ **User Authentication** - Sign up, login, and protected routes
- 🎯 **Resolution Tracking** - Create and manage daily or weekly resolutions
- 🔥 **Streak Tracking** - Track consecutive successful days/weeks
- ⭐ **XP & Leveling** - Earn XP and level up as you complete check-ins
- 🏆 **Badges** - Unlock achievements for milestones
- 📊 **Analytics** - Weekly reviews with charts and insights
- 🎨 **Clean UI** - Notion-inspired design with shadcn/ui components

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Prisma ORM + SQLite
- **Authentication**: NextAuth.js (Credentials provider)
- **Charts**: Recharts
- **State**: Zustand (where needed)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Git

### Installation

1. **Clone the repository** (or navigate to the project directory)

```bash
cd newyearsballs
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up the database**

```bash
# Generate Prisma client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name init

# Optional: Open Prisma Studio to view/edit data
npx prisma studio
```

4. **Seed demo data** (optional)

```bash
npm run db:seed
```

This creates a demo user:
- Email: `demo@example.com`
- Password: `demo123`

5. **Start the development server**

```bash
npm run dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── app/               # Protected app routes
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Feature components
├── lib/                  # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   ├── badges.ts         # Badge evaluation logic
│   ├── prisma.ts         # Prisma client
│   ├── streak.ts         # Streak computation
│   ├── xp.ts             # XP and leveling
│   └── utils.ts          # General utilities
├── prisma/               # Prisma schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
└── types/                # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed demo data

## Key Features Explained

### Resolutions

- Create resolutions with daily or weekly frequency
- Set target per period (e.g., 1 per day or 3 per week)
- Categorize by type (Health, Fitness, Learning, etc.)
- Archive or delete resolutions

### Check-ins

- Quick daily check-in screen for all active resolutions
- Status options: Done, Partial, Missed
- Optional notes for each check-in
- XP awarded: Done (+10), Partial (+5), Missed (+0)

### Streaks

- **Daily resolutions**: Streak increments when Done or Partial today
- **Weekly resolutions**: Week is successful if Done+Partial >= target; streak counts consecutive successful weeks
- Grace tokens can excuse one miss per month (future feature)

### XP & Leveling

- Level formula: `floor(totalXp / 100) + 1`
- Progress bar shows XP progress to next level
- Confetti animation on level up (optional)

### Badges

- **FIRST_CHECKIN**: Earned on first check-in
- **STREAK_7_DAYS**: 7 consecutive daily successes or 3 consecutive successful weeks
- **COMEBACK**: Earned after a miss, on next success
- **XP_100**: Total XP >= 100

### Analytics

- Weekly completion rate chart
- XP earned per week chart
- Insights: Best/worst day of week
- Miss cluster detection (e.g., weekend patterns)

## Database Schema

- `User` - User accounts
- `Resolution` - Resolutions with category, frequency, target
- `CheckIn` - Daily/weekly check-ins with status and XP
- `Badge` - Earned badges
- `LevelProgress` - XP and level tracking
- `GraceToken` - Monthly grace tokens (for future use)

## Authentication

Uses NextAuth.js with credentials provider. Sessions are JWT-based. All `/app/*` routes are protected by middleware.

## Environment Variables

Create a `.env` file (not included in repo):

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
DATABASE_URL="file:./dev.db"

# Email Configuration (for daily notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Optional: Protect cron endpoint (recommended for production)
# CRON_SECRET=your-cron-secret-here
```

Generate a secret:
```bash
openssl rand -base64 32
```

### Email Setup

For Gmail:
1. Enable 2-factor authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password as `EMAIL_PASSWORD`

For other email providers, update `EMAIL_HOST` and `EMAIL_PORT` accordingly.

## Deployment

1. Push schema changes:
   ```bash
   npx prisma db push
   ```

2. Build:
   ```bash
   npm run build
   ```

3. For production databases (PostgreSQL), update `DATABASE_URL` in `.env`

4. Set up email credentials in `.env` for daily notifications

## Daily Notifications

The app sends daily email reminders at midnight (12:00 AM) to users with unchecked resolutions.

### Production (Vercel)

When deployed to Vercel, cron jobs are automatically configured via `vercel.json`:
- Endpoint: `/api/cron/daily-notifications`
- Schedule: Every day at midnight (UTC)

### Local Development

For local development, you can:
1. Use a service like [cron-job.org](https://cron-job.org) to call your endpoint
2. Set up a local cron job (Unix/Mac):
   ```bash
   # Add to crontab (crontab -e)
   0 0 * * * curl -X GET http://localhost:3000/api/cron/daily-notifications
   ```
3. Manually test by calling: `GET http://localhost:3000/api/cron/daily-notifications`

### Protecting the Cron Endpoint (Optional)

For production, it's recommended to add authentication. Uncomment the auth check in `/app/api/cron/daily-notifications/route.ts` and set `CRON_SECRET` in your environment variables.

## License

MIT

## Contributing

This is a project template. Feel free to fork and customize!

