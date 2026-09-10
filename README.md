# PromptVault

> A curated, community-powered library of practical AI prompts.

Discover ready-to-use prompts for writing, coding, marketing, research, productivity, and more.

## Features

- 🔍 Search — Full-text search across titles, descriptions, and content
- 🏷️ Tags — 265+ tags with filtering
- 📂 Categories — 8 main categories + 31 subcategories
- ❤️ Voting — Like your favorites
- 📖 Bookmarks — Save prompts for later
- 📋 Copy — One-click copy to clipboard
- ⬇️ Download — Save as .txt files
- 👤 Profiles — Author pages with prompt history
- 🔒 Secure — Row Level Security + anonymous auth

## Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | Next.js 16 + React 19 + Tailwind CSS |
| Backend | Next.js API Routes (serverless) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (anonymous + OAuth) |
| Deployment | Vercel (free tier) |

## Local Development

### 1. Clone & Install

```bash
git clone https://github.com/maggie-ceo/promptvault.git
cd promptvault
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
# Fill in your Supabase values
```

### 3. Database Setup

1. Create project at [supabase.com](https://supabase.com)
2. Copy Project URL + anon key from Settings → API
3. Run SQL files in order in SQL Editor:
   - `supabase/migrations/001_init.sql`
   - `supabase/migrations/002_categories.sql`
   - `supabase/migrations/003_seed_prompts_v2.sql`
   - `supabase/migrations/004_community.sql`
   - `supabase/migrations/005_analytics.sql`
4. Authentication → Settings → Enable Anonymous Sign-ins

### 4. Run Dev Server

```bash
npm run dev
# Open http://localhost:3000
```

### 5. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |

## Database Setup

### Tables

- **prompts** — Main prompts with full-text search
- **votes** — User likes (prevents duplicates)
- **tags** — Normalized tags with counts
- **categories** — Hierarchical categories
- **profiles** — User profile data
- **bookmarks** — User saved prompts
- **collections** — User-curated lists
- **prompt_reports** — Content moderation
- **analytics_daily** — Daily aggregated stats

### Security

- Row Level Security (RLS) on all tables
- Server-side admin verification
- Anonymous auth for browsing
- Input validation on all forms

## Admin Setup

1. Create an account via Supabase Dashboard → Authentication
2. Get your user ID: `SELECT id FROM auth.users;`
3. Add to admin list in `supabase/migrations/001_init.sql`

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy

### Environment Variables for Production

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
```

## Project Structure

```
promptvault/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API routes
│   │   ├── categories/       # Category pages
│   │   ├── tags/             # Tag pages
│   │   ├── prompts/          # Prompt pages
│   │   ├── profile/          # User profiles
│   │   ├── saved/            # Bookmarks
│   │   ├── collections/      # Collections
│   │   ├── submit/           # Submission form
│   │   └── admin/            # Admin dashboard
│   ├── components/           # React components
│   └── lib/                  # Utilities
├── supabase/migrations/      # Database migrations
├── .env.example              # Environment template
├── next.config.ts
└── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## License

MIT
