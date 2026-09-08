# PromptVault — 100% Free & Open Source AI Prompts Library

A free, open-source platform for sharing, discovering, and collecting AI prompts. Built with Next.js and Supabase.

## Features

- 🔍 Full-text search with PostgreSQL
- 🏷️ Tag-based filtering
- ❤️ Voting/like system
- 📝 Submit prompts (authenticated)
- 📋 Copy to clipboard
- ⬇️ Download prompts
- 🏗️ Skills & Workflows sections
- 📱 Fully responsive
- 🔐 Row Level Security (RLS)

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js 16 + React 19 + Tailwind CSS |
| Backend | Next.js API Routes (serverless) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (anonymous + OAuth) |
| Deployment | Vercel (free tier) |

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/promptvault.git
cd promptvault
npm install
```

### 2. Supabase Setup

1. Go to [supabase.com](https://supabase.com) → Create New Project
2. Copy your project URL and anon key from Settings → API
3. Open SQL Editor → Paste contents of `supabase/migrations/001_init.sql` → Run
4. Go to Authentication → Settings → Enable Anonymous Sign-ins

### 3. Environment Variables

```bash
cp .env.example .env.local
# Fill in your Supabase values
```

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

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/prompts` | List prompts (supports `?type=&tag=&q=&sort=&limit=&offset=`) |
| POST | `/api/prompts` | Create prompt (auth required) |
| GET | `/api/prompts/:id` | Get single prompt |
| PATCH | `/api/prompts/:id` | Update prompt (owner only) |
| DELETE | `/api/prompts/:id` | Delete prompt (owner only) |
| POST | `/api/prompts/:id/vote` | Like prompt |
| DELETE | `/api/prompts/:id/vote` | Unlike prompt |
| GET | `/api/prompts/:id/download` | Download as .txt |

## Database Schema

See `supabase/migrations/001_init.sql` for full schema including:
- `prompts` table with full-text search
- `votes` table for likes
- `tags` table (normalized)
- RLS policies for security
- Triggers for auto-updating counts

## License

MIT
