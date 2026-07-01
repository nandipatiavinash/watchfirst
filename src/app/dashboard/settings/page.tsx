'use client'
import { useState } from 'react'
import { Settings, Bell, Shield, Palette, Trash2, CreditCard, Sparkles } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass border border-[var(--border)] rounded-2xl p-6">
      <h2 className="font-semibold text-[var(--text-secondary)] text-sm uppercase tracking-widest mb-5">{title}</h2>
      {children}
    </div>
  )
}

function Toggle({ label, desc, value, onChange }: {
  label: string; desc?: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
      <div>
        <p className="font-medium text-sm">{label}</p>
        {desc && <p className="text-xs text-[var(--text-muted)] mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${value ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const qc = useQueryClient()
  const [notifs, setNotifs] = useState({
    newRecommendations: true,
    weeklyDigest:       false,
    trendingAlerts:     true,
  })

  const [privacy, setPrivacy] = useState({
    shareHistory:       false,
    publicProfile:      false,
    analyticsOptIn:     true,
  })

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn:  () => fetch('/api/profile').then(r => r.json()),
  })

  const tier = profileData?.subscriptionTier ?? 'free'
  const isPro = tier === 'premium' || tier === 'pro'

  const togglePlan = useMutation({
    mutationFn: async (newTier: string) => {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionTier: newTier })
      })
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
    }
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-[var(--accent)]" /> Settings
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Configure your WatchFast experience</p>
      </div>

      <Section title="Subscription Plan">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl border shrink-0 ${isPro ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
              {isPro ? <Sparkles className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-semibold text-sm">
                {isPro ? 'WatchFast Pro Plan' : 'WatchFast Free Plan'}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {isPro 
                  ? 'Unlimited recommendations, personalized Gemini AI reranking, and explanations.' 
                  : 'Limited to 3 recommendations per day with basic matching score.'}
              </p>
            </div>
          </div>
          <span className={`text-xs px-3 py-1.5 rounded-lg font-bold border shrink-0 ${
            isPro
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-zinc-800 border-zinc-700 text-zinc-400'
          }`}>
            {isPro ? 'PRO' : 'FREE'}
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-between items-center">
          <p className="text-xs text-[var(--text-muted)] flex-1 pr-4">
            {isPro 
              ? 'Enjoying unlimited access. Tap to return to the free plan.' 
              : 'Unlock advanced Gemini recommendations in under 10s.'}
          </p>
          <Button
            variant={isPro ? 'secondary' : 'primary'}
            size="sm"
            loading={togglePlan.isPending}
            onClick={() => togglePlan.mutate(isPro ? 'free' : 'pro')}
          >
            {isPro ? 'Downgrade to Free' : 'Upgrade to Pro'}
          </Button>
        </div>
      </Section>

      <Section title="Notifications">
        <Toggle label="New recommendations" desc="Get notified when AI picks something new for you"
          value={notifs.newRecommendations} onChange={v => setNotifs(p => ({ ...p, newRecommendations: v }))} />
        <Toggle label="Weekly digest" desc="A weekly summary of trending content"
          value={notifs.weeklyDigest} onChange={v => setNotifs(p => ({ ...p, weeklyDigest: v }))} />
        <Toggle label="Trending alerts" desc="Know when something goes viral on your platforms"
          value={notifs.trendingAlerts} onChange={v => setNotifs(p => ({ ...p, trendingAlerts: v }))} />
      </Section>

      <Section title="Privacy">
        <Toggle label="Share watch history" desc="Allow WatchFast to use your history for better recommendations"
          value={privacy.shareHistory} onChange={v => setPrivacy(p => ({ ...p, shareHistory: v }))} />
        <Toggle label="Public profile" desc="Let others see your public lists and favorites"
          value={privacy.publicProfile} onChange={v => setPrivacy(p => ({ ...p, publicProfile: v }))} />
        <Toggle label="Analytics" desc="Help improve WatchFast with anonymous usage data"
          value={privacy.analyticsOptIn} onChange={v => setPrivacy(p => ({ ...p, analyticsOptIn: v }))} />
      </Section>

      <Section title="Appearance">
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-sm">Theme</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Currently dark mode only</p>
          </div>
          <span className="text-xs bg-[var(--bg-card)] border border-[var(--border)] px-3 py-1.5 rounded-lg text-[var(--text-secondary)]">
            Dark
          </span>
        </div>
      </Section>

      <Section title="Danger zone">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Clear watch history</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Remove all entries from your history</p>
            </div>
            <Button variant="danger" size="sm" leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
              Clear
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm text-red-400">Delete account</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Permanently delete your account and all data</p>
            </div>
            <Button variant="danger" size="sm">Delete</Button>
          </div>
        </div>
      </Section>
    </div>
  )
}
