'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Check, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { cn } from '@/lib/utils/cn'
import type { OnboardingData, Mood, Platform, TimeAvail } from '@/types'

const STEPS = ['Time', 'Mood', 'Platform', 'Language', 'Genres'] as const

const MOODS: { id: Mood; emoji: string; label: string }[] = [
  { id: 'funny',       emoji: '😂', label: 'Funny' },
  { id: 'action',      emoji: '💥', label: 'Action' },
  { id: 'thriller',    emoji: '😱', label: 'Thriller' },
  { id: 'mystery',     emoji: '🔍', label: 'Mystery' },
  { id: 'anime',       emoji: '🍜', label: 'Anime' },
  { id: 'relaxing',    emoji: '😌', label: 'Relaxing' },
  { id: 'educational', emoji: '🎓', label: 'Educational' },
  { id: 'romance',     emoji: '🌸', label: 'Romance' },
  { id: 'horror',      emoji: '👻', label: 'Horror' },
]

const PLATFORMS: { id: Platform; label: string; color: string }[] = [
  { id: 'netflix',    label: 'Netflix',     color: '#E50914' },
  { id: 'prime',      label: 'Prime Video', color: '#00A8E0' },
  { id: 'disney',     label: 'Disney+',     color: '#113CCF' },
  { id: 'youtube',    label: 'YouTube',     color: '#FF0000' },
  { id: 'crunchyroll',label: 'Crunchyroll', color: '#F47521' },
]

const TIMES: TimeAvail[] = [5, 10, 20, 30, 45, 60]

const GENRES = [
  { id: 28,   name: 'Action' },
  { id: 35,   name: 'Comedy' },
  { id: 18,   name: 'Drama' },
  { id: 27,   name: 'Horror' },
  { id: 10749,name: 'Romance' },
  { id: 878,  name: 'Sci-Fi' },
  { id: 53,   name: 'Thriller' },
  { id: 99,   name: 'Documentary' },
  { id: 14,   name: 'Fantasy' },
  { id: 9648, name: 'Mystery' },
  { id: 16,   name: 'Animation' },
  { id: 80,   name: 'Crime' },
]

const LANGUAGES = [
  { code: 'en', label: '🇺🇸 English' },
  { code: 'hi', label: '🇮🇳 Hindi' },
  { code: 'ja', label: '🇯🇵 Japanese' },
  { code: 'ko', label: '🇰🇷 Korean' },
  { code: 'es', label: '🇪🇸 Spanish' },
  { code: 'fr', label: '🇫🇷 French' },
]

function ToggleChip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative px-4 py-2.5 rounded-xl text-sm font-medium border transition-all',
        selected
          ? 'bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--text-primary)]'
          : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
      )}
    >
      {selected && <Check className="absolute top-1 right-1 w-3 h-3 text-[var(--accent)]" />}
      {children}
    </button>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<Partial<OnboardingData>>({
    moods: [],
    platforms: [],
    languages: [],
    favoriteGenreIds: [],
  })

  function toggle<T>(key: keyof OnboardingData, value: T) {
    setData(prev => {
      const arr = (prev[key] as T[]) ?? []
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      }
    })
  }

  async function finish() {
    setSaving(true)
    try {
      await fetch('/api/profile/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      router.push('/dashboard')
    } catch {
      setSaving(false)
    }
  }

  const stepContent = [
    // Step 0: Time
    <div key="time">
      <h2 className="text-2xl font-bold mb-2">How much time do you have?</h2>
      <p className="text-[var(--text-secondary)] mb-8">We'll find something that fits perfectly.</p>
      <div className="grid grid-cols-3 gap-3">
        {TIMES.map(t => (
          <button
            key={t}
            onClick={() => setData(p => ({ ...p, timeAvail: t }))}
            className={cn(
              'py-6 rounded-2xl border text-2xl font-bold transition-all',
              data.timeAvail === t
                ? 'bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--text-primary)] scale-105'
                : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
            )}
          >
            {t}<span className="text-sm font-normal">m</span>
          </button>
        ))}
      </div>
    </div>,

    // Step 1: Mood
    <div key="mood">
      <h2 className="text-2xl font-bold mb-2">What's your mood?</h2>
      <p className="text-[var(--text-secondary)] mb-8">Pick all that apply.</p>
      <div className="grid grid-cols-3 gap-3">
        {MOODS.map(m => (
          <ToggleChip
            key={m.id}
            selected={(data.moods ?? []).includes(m.id)}
            onClick={() => toggle('moods', m.id)}
          >
            <span className="text-xl mr-2">{m.emoji}</span>{m.label}
          </ToggleChip>
        ))}
      </div>
    </div>,

    // Step 2: Platform
    <div key="platform">
      <h2 className="text-2xl font-bold mb-2">Which platforms do you have?</h2>
      <p className="text-[var(--text-secondary)] mb-8">Select all your subscriptions.</p>
      <div className="flex flex-col gap-3">
        {PLATFORMS.map(p => (
          <ToggleChip
            key={p.id}
            selected={(data.platforms ?? []).includes(p.id)}
            onClick={() => toggle('platforms', p.id)}
          >
            <span className="w-3 h-3 rounded-full inline-block mr-2" style={{ background: p.color }} />
            {p.label}
          </ToggleChip>
        ))}
      </div>
    </div>,

    // Step 3: Language
    <div key="language">
      <h2 className="text-2xl font-bold mb-2">Preferred languages?</h2>
      <p className="text-[var(--text-secondary)] mb-8">We'll prioritize these in recommendations.</p>
      <div className="grid grid-cols-2 gap-3">
        {LANGUAGES.map(l => (
          <ToggleChip
            key={l.code}
            selected={(data.languages ?? []).includes(l.code)}
            onClick={() => toggle('languages', l.code)}
          >
            {l.label}
          </ToggleChip>
        ))}
      </div>
    </div>,

    // Step 4: Genres
    <div key="genres">
      <h2 className="text-2xl font-bold mb-2">Favorite genres?</h2>
      <p className="text-[var(--text-secondary)] mb-8">Pick at least 3 for better recommendations.</p>
      <div className="grid grid-cols-3 gap-3">
        {GENRES.map(g => (
          <ToggleChip
            key={g.id}
            selected={(data.favoriteGenreIds ?? []).includes(g.id)}
            onClick={() => toggle('favoriteGenreIds', g.id)}
          >
            {g.name}
          </ToggleChip>
        ))}
      </div>
    </div>,
  ]

  const isLastStep = step === STEPS.length - 1

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-12">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" fill="white" />
        </div>
        <span className="font-bold text-lg gradient-text">WatchFast AI</span>
      </div>

      {/* Progress */}
      <div className="w-full max-w-md mb-8">
        <div className="flex gap-1.5 mb-2">
          {STEPS.map((_, i) => (
            <div key={i} className={cn('flex-1 h-1 rounded-full transition-all', i <= step ? 'bg-[var(--accent)]' : 'bg-[var(--border)]')} />
          ))}
        </div>
        <p className="text-xs text-[var(--text-muted)] text-right">{step + 1} of {STEPS.length}</p>
      </div>

      {/* Step content */}
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {stepContent[step]}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-10">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep(s => s - 1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          )}
          <Button
            className="flex-1"
            size="lg"
            onClick={isLastStep ? finish : () => setStep(s => s + 1)}
            loading={saving}
          >
            {isLastStep ? 'Start watching' : 'Continue'}
            {!isLastStep && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>

        {step === 0 && (
          <button onClick={() => setStep(s => s + 1)} className="w-full mt-3 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
            Skip for now
          </button>
        )}
      </div>
    </div>
  )
}
