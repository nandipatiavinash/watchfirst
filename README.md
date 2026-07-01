# WatchFast AI

> Find the perfect movie or show in under 10 seconds.

AI-powered streaming recommendations based on your mood, available time, platform, language, and taste — across Netflix, Prime Video, Disney+, Crunchyroll, and YouTube.

---

## Tech Stack

| Layer          | Technology |
|----------------|-----------|
| Framework      | Next.js 15 (App Router, Server Components) |
| Language       | TypeScript |
| Styling        | Tailwind CSS, Framer Motion |
| Auth           | Better Auth (email/password + Google OAuth) |
| Database       | PostgreSQL + Prisma ORM |
| AI Interface   | Modular provider (Mock → OpenAI / Gemini / Ollama) |
| Content API    | TMDb + YouTube Data API v3 |
| Streaming data | TMDb Watch Providers (abstracted) |
| Deployment     | Vercel / Docker |
| Testing        | Jest + ts-jest |

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/your-org/watchfast.git
cd watchfast
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Random secret ≥ 32 chars |
| `BETTER_AUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `TMDB_READ_ACCESS_TOKEN` | TMDb API v4 read access token |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |
| `NEXT_PUBLIC_APP_URL` | Public app URL |

### 3. Set up database

```bash
npm run db:migrate   # run migrations
npm run db:seed      # seed genres, platforms, feature flags
npm run db:sync-tmdb # pull real content from TMDb (optional, ~3 pages)
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Docker

```bash
# Start everything (postgres + redis + app)
docker compose up

# Build image only
npm run docker:build

# Stop
npm run docker:down
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Add a `DATABASE_URL` pointing to a managed Postgres (Neon, Supabase, Railway)
5. Deploy — Vercel runs `prisma generate && next build` automatically

---

## Architecture

### Recommendation Engine

```
User input (mood, time, platform, language, meal mode)
         │
         ├──────────────────┬─────────────────────────┐
         ▼                  ▼
  discoverByMood()    getYoutubeMoodVideos()   ← parallel fetch
  (TMDb Discover)     (YouTube Search + Videos)
         │                  │
         ▼                  ▼
  Metadata Filter     Duration Filter (±30m)
         │                  │
         ▼                  ▼
  scoreContent()      scoreYoutubeVideo()      ← separate scorers, same weight system
         │                  │
         └──────────┬───────┘
                    ▼
         Merge & sort by score
                    │
                    ▼
         RecommendationProvider   ← pluggable AI interface
         (MockProvider now)      ← swap → OpenAI / Gemini / Ollama
                    │
                    ▼
         Top 5 results + explanations
                    │
                    ▼
         Persisted to DB
```

YouTube videos are treated as first-class recommendable content. They appear
alongside movies/TV in `/dashboard/recommend`, `/dashboard/search`, and the
dashboard home feed — selectable via `platform: 'youtube'` or mixed in by default.

YouTube-specific scoring (`scoreYoutubeVideo`) uses the same 14-factor weight
system as TMDb content, with YouTube-native signals substituted: category→mood
mapping instead of genre IDs, view count instead of TMDb popularity, and
upload recency instead of release date.

### AI Provider Interface

```typescript
interface RecommendationProvider {
  name:       string
  recommend(input, candidates, topN?): Promise<ScoredContent[]>
  rerank(input, items):               Promise<ScoredContent[]>
  explain(input, item):               Promise<string>
}
```

Swap the provider without touching any business logic:

```typescript
import { OpenAIRecommendationProvider } from '@/lib/recommendation/openai.provider'
recommendationEngine.setProvider(new OpenAIRecommendationProvider())
```

### Scoring Weights (all configurable)

| Factor | Default weight |
|--------|---------------|
| Duration match | 15% |
| Genre match | 15% |
| Mood match | 15% |
| Language match | 10% |
| Platform match | 10% |
| Rating | 8% |
| Popularity | 5% |
| Favorite actor | 6% |
| Favorite director | 4% |
| Recency | 4% |
| Time of day | 3% |
| Meal mode | 3% |
| Personal history | 1% |
| User feedback | 1% |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/                  # login · signup · forgot-password
│   ├── dashboard/
│   │   ├── page.tsx             # home — trending, popular, hidden gems
│   │   ├── recommend/           # AI recommendation page
│   │   ├── search/              # instant search with debounce
│   │   ├── history/             # watch history
│   │   ├── favorites/           # favourites grid
│   │   ├── lists/               # saved lists
│   │   ├── feedback/            # rate content
│   │   ├── profile/             # edit preferences
│   │   ├── settings/            # app settings
│   │   ├── admin/               # admin panel (feature flags, DB stats)
│   │   └── content/[type]/[id]/ # movie / TV detail page
│   │       (also: content/youtube/[id]/ for YouTube videos)
│   ├── api/
│   │   ├── auth/[...all]/       # better-auth handler
│   │   ├── recommendations/     # POST — run engine, return results
│   │   ├── favorites/           # GET · POST · DELETE
│   │   ├── history/             # GET · POST
│   │   ├── history/[id]/        # DELETE
│   │   ├── feedback/            # GET · POST
│   │   ├── lists/               # GET · POST
│   │   ├── lists/[id]/          # GET · DELETE
│   │   ├── lists/watchlist/     # POST · DELETE
│   │   ├── search/              # GET — TMDb search proxy
│   │   └── profile/             # GET · PATCH · onboarding POST
│   ├── layout.tsx
│   ├── page.tsx                 # landing page
│   ├── not-found.tsx
│   └── error.tsx
│
├── components/
│   ├── layout/       Navbar · Providers
│   ├── shared/       ContentCard · ContentRow · Button · Skeleton · EmptyState
│   └── dashboard/    FavoriteButton · WatchlistButton
│
├── lib/
│   ├── auth/         auth.ts (server) · auth-client.ts (browser)
│   ├── db/           prisma singleton
│   ├── tmdb/         client · queries · detail · mappers
│   ├── youtube/      client · queries · mappers · scoring
│   ├── providers/    streaming abstraction
│   ├── recommendation/
│   │   ├── provider.interface.ts   AI interface
│   │   ├── mock.provider.ts        default implementation
│   │   ├── scoring.engine.ts       14-factor weighted scorer (TMDb)
│   │   └── engine.ts               orchestrator — merges TMDb + YouTube
│   └── utils/        cn · tmdb-image · format
│
├── hooks/            useSearch (debounced)
├── types/            index.ts — all shared types
└── middleware.ts     auth-protected routes

prisma/
└── schema.prisma     25-table normalized schema

scripts/
├── seed.ts           genres · platforms · feature flags
└── sync-tmdb.ts      pull TMDb content into DB

__tests__/
└── unit/
    ├── scoring.engine.test.ts
    ├── mock.provider.test.ts
    ├── recommendation.engine.test.ts
    ├── utils.test.ts
    ├── youtube.mappers.test.ts
    └── youtube.scoring.test.ts
```

---

## Scripts Reference

```bash
npm run dev               # dev server (turbopack)
npm run build             # production build
npm run test              # run all tests
npm run test:coverage     # with coverage report
npm run db:migrate        # run pending migrations
npm run db:migrate:prod   # deploy migrations in production
npm run db:seed           # seed static data
npm run db:sync-tmdb      # sync TMDb content (add --pages 10 for more)
npm run db:studio         # open Prisma Studio
npm run docker:dev        # docker compose up
```

---

## Adding an AI Provider

1. Create `src/lib/recommendation/openai.provider.ts`
2. Implement `RecommendationProvider` interface
3. Set it on the engine:

```typescript
// src/lib/recommendation/engine.ts
import { OpenAIRecommendationProvider } from './openai.provider'
export const recommendationEngine = new RecommendationEngine(
  new OpenAIRecommendationProvider()
)
```

No other files change.

---

## Feature Flags

Managed in the `feature_flags` DB table. Toggle via Admin panel or directly:

```sql
UPDATE feature_flags SET enabled = true WHERE key = 'ai_recommendations';
```

| Flag | Default | Description |
|------|---------|-------------|
| `ai_recommendations` | off | Enable AI reranking layer |
| `trending_section`   | on  | Show trending on dashboard |
| `meal_mode`          | on  | Enable meal-based boosts |
| `youtube_integration`| off | YouTube recommendations |

---

## Environment Reference

See `.env.example` for all variables.
