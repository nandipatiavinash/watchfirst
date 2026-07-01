'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, RefreshCw, Clock, Smile, Coffee, Globe, Tv, Youtube, Sparkles } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { ContentCard } from '@/components/shared/ContentCard'
import { ContentCardSkeleton } from '@/components/shared/Skeleton'
import { Button } from '@/components/shared/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils/cn'
import type { Mood, TimeAvail, AnyContent } from '@/types'

const MOODS: { id: Mood; emoji: string; label: string }[] = [
  { id: 'funny',       emoji: '😂', label: 'Funny' },
  { id: 'action',      emoji: '💥', label: 'Action' },
  { id: 'thriller',    emoji: '😱', label: 'Thriller' },
  { id: 'mystery',     emoji: '🔍', label: 'Mystery' },
  { id: 'anime',       emoji: '🍜', label: 'Anime' },
  { id: 'relaxing',    emoji: '😌', label: 'Relaxing' },
  { id: 'educational', emoji: '🎓', label: 'Learn' },
  { id: 'romance',     emoji: '🌸', label: 'Romance' },
  { id: 'horror',      emoji: '👻', label: 'Horror' },
]
const TIMES: TimeAvail[]    = [5, 10, 20, 30, 45, 60]
const MEAL_MODES = [
  { id: 'breakfast', emoji: '☀️', label: 'Breakfast' },
  { id: 'lunch',     emoji: '🌤️', label: 'Lunch' },
  { id: 'dinner',    emoji: '🌙', label: 'Dinner' },
  { id: 'late_night',emoji: '🌃', label: 'Late Night' },
]
const PLATFORMS = [
  { id: 'netflix',     label: 'Netflix' },
  { id: 'prime',       label: 'Prime' },
  { id: 'disney',      label: 'Disney+' },
  { id: 'crunchyroll', label: 'Crunchyroll' },
  { id: 'youtube',     label: 'YouTube', icon: Youtube },
]
const LANGUAGES = [
  { code: 'en', label: '🇺🇸 EN' }, { code: 'hi', label: '🇮🇳 HI' },
  { code: 'ja', label: '🇯🇵 JA' }, { code: 'ko', label: '🇰🇷 KO' },
  { code: 'es', label: '🇪🇸 ES' },
]

function Chip({ selected, onClick, children, accent = 'default' }: {
  selected: boolean; onClick: () => void; children: React.ReactNode; accent?: 'default' | 'youtube'
}) {
  return (
    <button onClick={onClick}
      className={cn(
        'px-3 py-2 rounded-xl text-sm font-medium border transition-all flex items-center gap-1.5',
        selected
          ? accent === 'youtube'
            ? 'bg-red-600/20 border-red-600 text-red-400'
            : 'bg-[var(--accent)]/20 border-[var(--accent)] text-white'
          : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
      )}>
      {children}
    </button>
  )
}

interface RecommendResult {
  content:     AnyContent
  score:       number
  explanation: string
}

interface UsageInfo {
  count: number
  limit: number
  tier: string
}

function RecommendPageContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [timeAvail, setTimeAvail] = useState<TimeAvail>((Number(params.get('time')) || 30) as TimeAvail)
  const [mood,      setMood]      = useState<Mood>((params.get('mood') as Mood) || 'relaxing')
  const [mealMode,  setMealMode]  = useState<string | null>(null)
  const [platform,  setPlatform]  = useState<string | null>(params.get('platform') || null)
  const [language,  setLanguage]  = useState<string>('en')

  const rec = useMutation({
    mutationFn: async (): Promise<{
      results: RecommendResult[]
      usage?: UsageInfo
      limitReached?: boolean
      error?: string
    }> => {
      const res = await fetch('/api/recommendations', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ timeAvail, mood, mealMode, platform, language }),
      })
      if (!res.ok) {
        if (res.status === 403) {
          const errData = await res.json().catch(() => ({}))
          if (errData.limitReached) {
            return { results: [], usage: errData.usage, limitReached: true, error: errData.error }
          }
        }
        throw new Error('Failed to fetch recommendations')
      }
      return res.json()
    },
  })

  useEffect(() => { rec.mutate() }, [mood, timeAvail, language, platform])

  const results       = rec.data?.results ?? []
  const usage         = rec.data?.usage
  const limitReached  = rec.data?.limitReached
  const isYoutubeOnly  = platform === 'youtube'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-[var(--accent)]" fill="currentColor" /> Find something to watch
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Tune the filters · AI picks the rest
          </p>
        </div>
        <div className="flex items-center gap-3">
          {usage && usage.tier === 'free' && (
            <div className="text-xs bg-[var(--bg-card)] border border-[var(--border)] px-3 py-2 rounded-xl text-[var(--text-secondary)] font-medium">
              Daily quota: <span className="text-[var(--text-primary)] font-bold">{usage.count}</span> / <span className="text-[var(--text-primary)] font-bold">{usage.limit}</span> recommendations
            </div>
          )}
          <Button onClick={() => rec.mutate()} loading={rec.isPending}
            leftIcon={<RefreshCw className="w-4 h-4" />} variant="secondary">
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="glass border border-[var(--border)] rounded-2xl p-6 space-y-6">

        {/* Time */}
        <div>
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Time available
          </p>
          <div className="flex gap-2 flex-wrap">
            {TIMES.map(t => (
              <Chip key={t} selected={timeAvail === t} onClick={() => setTimeAvail(t)}>{t}m</Chip>
            ))}
          </div>
        </div>

        {/* Mood */}
        <div>
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Smile className="w-3.5 h-3.5" /> Mood
          </p>
          <div className="flex gap-2 flex-wrap">
            {MOODS.map(m => (
              <Chip key={m.id} selected={mood === m.id} onClick={() => setMood(m.id)}>
                {m.emoji} {m.label}
              </Chip>
            ))}
          </div>
        </div>

        {/* Meal mode */}
        <div>
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Coffee className="w-3.5 h-3.5" /> Meal mode
          </p>
          <div className="flex gap-2 flex-wrap">
            {MEAL_MODES.map(m => (
              <Chip key={m.id} selected={mealMode === m.id}
                onClick={() => setMealMode(mealMode === m.id ? null : m.id)}>
                {m.emoji} {m.label}
              </Chip>
            ))}
          </div>
        </div>

        {/* Platform + Language */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5" /> Platform
            </p>
            <div className="flex gap-2 flex-wrap">
              {PLATFORMS.map(p => (
                <Chip key={p.id} selected={platform === p.id}
                  onClick={() => setPlatform(platform === p.id ? null : p.id)}
                  accent={p.id === 'youtube' ? 'youtube' : 'default'}>
                  {p.icon && <p.icon className="w-3.5 h-3.5" />} {p.label}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Language
            </p>
            <div className="flex gap-2 flex-wrap">
              {LANGUAGES.map(l => (
                <Chip key={l.code} selected={language === l.code} onClick={() => setLanguage(l.code)}>
                  {l.label}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          {isYoutubeOnly && <Youtube className="w-5 h-5 text-red-500" />}
          {rec.isPending
            ? 'Finding your picks…'
            : limitReached
            ? 'Limit reached'
            : rec.isError
            ? 'Something went wrong'
            : results.length
            ? `Top ${results.length} picks for you`
            : 'Adjust filters to get recommendations'}
        </h2>

        <AnimatePresence mode="wait">
          {limitReached ? (
            <motion.div key="limit" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="glass border border-amber-500/30 bg-amber-500/5 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto text-amber-400">
                <Zap className="w-6 h-6" fill="currentColor" />
              </div>
              <h3 className="text-xl font-bold">Daily Limit Reached</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Free tier accounts are limited to {usage?.limit} recommendations per day. Upgrade to WatchFast Pro to get unlimited recommendations, Gemini AI reranking, and personalized explanations!
              </p>
              <div className="pt-2">
                <Button onClick={() => router.push('/dashboard/settings')} variant="primary" leftIcon={<Sparkles className="w-4 h-4" />}>
                  Upgrade to Pro in Settings
                </Button>
              </div>
            </motion.div>
          ) : rec.isPending ? (
            <motion.div key="skel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => <ContentCardSkeleton key={i} />)}
            </motion.div>
          ) : results.length ? (
            <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={cn(
                'grid gap-4',
                isYoutubeOnly
                  ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
              )}>
              {results.map((r, i) => (
                <motion.div key={r.content.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}>
                  <ContentCard
                    content={r.content}
                    score={r.score}
                    showScore
                    explanation={r.explanation}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : !rec.isPending && (
            <EmptyState
              icon={Zap}
              title="No matches yet"
              description="Try a different mood, longer time window, or remove the platform filter."
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function RecommendPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-[var(--text-secondary)]">Loading recommendations form...</div>}>
      <RecommendPageContent />
    </Suspense>
  )
}
