# Deployment Guide

## Vercel (recommended)

### 1. Database
Provision a Postgres database. Recommended providers:
- **Neon** (free tier, serverless) — neon.tech
- **Supabase** — supabase.com
- **Railway** — railway.app

Copy the connection string into `DATABASE_URL`.

### 2. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-org/watchfast.git
git push -u origin main
```

### 3. Import in Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Add environment variables (see table below)
4. Deploy

Vercel auto-runs `prisma generate && next build`.

### 4. Run migrations & seed

```bash
# From your local machine with DATABASE_URL pointing to production DB
npm run db:migrate:prod
npm run db:seed
npm run db:sync-tmdb -- --pages 5
```

### Environment Variables (Vercel)

| Variable | Where to get |
|----------|-------------|
| `DATABASE_URL` | Your Postgres provider dashboard |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Your Vercel domain, e.g. `https://watchfast.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → OAuth 2.0 |
| `GOOGLE_CLIENT_SECRET` | Same |
| `TMDB_READ_ACCESS_TOKEN` | themoviedb.org → Settings → API |
| `NEXT_PUBLIC_APP_URL` | Same as `BETTER_AUTH_URL` |

---

## Docker (self-hosted)

### Prerequisites
- Docker + Docker Compose
- A server with ports 3000, 5432, 6379 open (or behind nginx)

### Steps

```bash
# 1. Clone
git clone https://github.com/your-org/watchfast.git
cd watchfast

# 2. Set env
cp .env.example .env
# Edit .env with your secrets

# 3. Build and start
docker compose up -d

# 4. Run migrations (first time)
docker compose exec app npx prisma migrate deploy
docker compose exec app npx tsx scripts/seed.ts
docker compose exec app npx tsx scripts/sync-tmdb.ts --pages 3
```

### Nginx reverse proxy (recommended)

```nginx
server {
    listen 80;
    server_name watchfast.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name watchfast.example.com;

    ssl_certificate     /etc/letsencrypt/live/watchfast.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/watchfast.example.com/privkey.pem;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Authorised redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://yourdomain.com/api/auth/callback/google` (prod)
5. Copy Client ID and Secret to `.env`

---

## TMDb API Setup

1. Register at [themoviedb.org](https://www.themoviedb.org)
2. Settings → API → Create API Key (v3) or Read Access Token (v4)
3. Use the **Read Access Token** for `TMDB_READ_ACCESS_TOKEN`

---

## YouTube Data API Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Select your project (or create one) → APIs & Services → Library
3. Search "YouTube Data API v3" → Enable
4. APIs & Services → Credentials → Create Credentials → API Key
5. Restrict the key to "YouTube Data API v3" for security
6. Copy the key to `YOUTUBE_API_KEY`

**Quota note:** YouTube Data API has a default quota of 10,000 units/day.
Each search costs ~100 units, each video detail batch ~1-7 units. The app
batches video detail lookups (up to 50 IDs per call) to minimize quota use.
Monitor usage in Cloud Console → APIs & Services → YouTube Data API v3 → Quotas.

---

## Admin User Setup

To access `/dashboard/admin`, add your email to the `admin_users` table:

```sql
INSERT INTO admin_users (id, email, role)
VALUES (gen_random_uuid(), 'you@example.com', 'superadmin');
```

Or via Prisma Studio:
```bash
npm run db:studio
```
