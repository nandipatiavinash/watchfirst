import { Suspense } from 'react'
import Link from 'next/link'
import { Zap, TrendingUp, Clock, Heart, Bookmark, Sparkles, Play, Youtube } from 'lucide-react'
import { ContentRow } from '@/components/shared/ContentRow'
import { ContentRowSkeleton } from '@/components/shared/Skeleton'
import {
  getTrendingAll,
  getPopularMovies,
  getHiddenGems,
  getPopularTv,
} from '@/lib/tmdb/queries'
import { getYoutubeTrending } from '@/lib/youtube/queries'

// ─── Quick Pick Bar ────────────────────────────────────────────────────────────

function QuickPickBar() {
  const moods = [
    { label: '😂 Funny',      mood: 'funny' },
    { label: '💥 Action',     mood: 'action' },
    { label: '😱 Thriller',   mood: 'thriller' },
    { label: '🌸 Romance',    mood: 'romance' },
    { label: '👻 Horror',     mood: 'horror' },
    { label: '🎓 Learn',      mood: 'educational' },
    { label: '🍜 Anime',      mood: 'anime' },
    { label: '😌 Relax',      mood: 'relaxing' },
  ]

  return (
    <div className="glass rounded-2xl p-6 border border-[var(--border)]">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center glow">
          <Zap className="w-5 h-5 text-white" fill="white" />
        </div>
        <div>
          <h2 className="font-bold text-lg">What's your vibe right now?</h2>
          <p className="text-xs text-[var(--text-secondary)]">Pick a mood — AI does the rest</p>
        </div>
      </div>

      {/* Time */}
      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-2">
        Time available
      </p>
      <div className="flex gap-2 flex-wrap mb-5">
        {[5, 10, 20, 30, 45, 60].map(t => (
          <Link
            key={t}
            href={`/dashboard/recommend?time=${t}`}
            className="glass border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-sm font-semibold px-4 py-2 rounded-xl transition-all"
          >
            {t}m
          </Link>
        ))}
      </div>

      {/* Mood */}
      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-2">
        Mood
      </p>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-5">
        {moods.map(m => (
          <Link
            key={m.mood}
            href={`/dashboard/recommend?mood=${m.mood}`}
            className="glass border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 hover:text-[var(--accent)] rounded-xl py-3 text-xs font-medium text-center transition-all"
          >
            {m.label}
          </Link>
        ))}
      </div>

      {/* YouTube shortcut */}
      <Link
        href="/dashboard/recommend?platform=youtube"
        className="flex items-center justify-center gap-2 bg-red-600/10 border border-red-600/30 hover:border-red-500 hover:bg-red-600/20 text-red-400 hover:text-red-300 rounded-xl py-2.5 text-sm font-medium transition-all"
      >
        ▶️ Show me something on YouTube instead
      </Link>
    </div>
  )
}

// ─── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  href,
}: {
  icon: React.ElementType
  title: string
  href?: string
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-[var(--accent)]" />
        <h2 className="font-bold text-lg">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          See all →
        </Link>
      )}
    </div>
  )
}

// ─── Async Sections ────────────────────────────────────────────────────────────

async function TrendingSection() {
  const items = await getTrendingAll()
  return <ContentRow items={items.slice(0, 10)} />
}

async function PopularMoviesSection() {
  const items = await getPopularMovies()
  return <ContentRow items={items.slice(0, 5)} />
}

async function PopularTvSection() {
  const items = await getPopularTv()
  return <ContentRow items={items.slice(0, 5)} />
}

async function HiddenGemsSection() {
  const items = await getHiddenGems()
  return <ContentRow items={items.slice(0, 5)} emptyMessage="No hidden gems found." />
}

async function YoutubeSection() {
  const items = await getYoutubeTrending()
  return <ContentRow items={items.slice(0, 10)} emptyMessage="YouTube content unavailable — check API key." />
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="space-y-12">
      {/* Quick Pick */}
      <QuickPickBar />

      {/* Today's AI Picks CTA */}
      <div className="flex items-center gap-4 p-5 glass rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold">Get your personalised AI recommendation</p>
          <p className="text-sm text-[var(--text-secondary)]">
            Based on your mood, time, and watch history
          </p>
        </div>
        <Link
          href="/dashboard/recommend"
          className="shrink-0 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          Find now
        </Link>
      </div>

      {/* Trending */}
      <section>
        <SectionHeader
          icon={TrendingUp}
          title="Trending this week"
          href="/dashboard/search?sort=trending"
        />
        <Suspense fallback={<ContentRowSkeleton count={5} />}>
          <TrendingSection />
        </Suspense>
      </section>

      {/* Popular Movies */}
      <section>
        <SectionHeader
          icon={Play}
          title="Popular movies"
          href="/dashboard/search?type=movie"
        />
        <Suspense fallback={<ContentRowSkeleton count={5} />}>
          <PopularMoviesSection />
        </Suspense>
      </section>

      {/* Popular TV */}
      <section>
        <SectionHeader
          icon={Clock}
          title="Binge-worthy series"
          href="/dashboard/search?type=tv"
        />
        <Suspense fallback={<ContentRowSkeleton count={5} />}>
          <PopularTvSection />
        </Suspense>
      </section>

      {/* Hidden Gems */}
      <section>
        <SectionHeader icon={Sparkles} title="Hidden gems" />
        <Suspense fallback={<ContentRowSkeleton count={5} />}>
          <HiddenGemsSection />
        </Suspense>
      </section>

      {/* YouTube */}
      <section>
        <SectionHeader
          icon={Youtube}
          title="From YouTube"
          href="/dashboard/search?sources=youtube"
        />
        <Suspense fallback={<ContentRowSkeleton count={5} />}>
          <YoutubeSection />
        </Suspense>
      </section>

      {/* Quick links for account sections */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/favorites"
          className="glass border border-[var(--border)] hover:border-[var(--accent)]/50 rounded-2xl p-5 flex items-center gap-4 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-colors">
            <Heart className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
          </div>
          <div>
            <p className="font-semibold">Your Favorites</p>
            <p className="text-sm text-[var(--text-secondary)]">Movies and shows you loved</p>
          </div>
        </Link>
        <Link
          href="/dashboard/lists"
          className="glass border border-[var(--border)] hover:border-[var(--accent)]/50 rounded-2xl p-5 flex items-center gap-4 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-colors">
            <Bookmark className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
          </div>
          <div>
            <p className="font-semibold">Saved Lists</p>
            <p className="text-sm text-[var(--text-secondary)]">Your watchlist and custom lists</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
