'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Mail, Camera, Save, Shield, LogOut } from 'lucide-react'
import { signOut, useSession } from '@/lib/auth/auth-client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/shared/Button'
import { Skeleton } from '@/components/shared/Skeleton'

const GENRES = [
  { id: 28, name: 'Action' }, { id: 35, name: 'Comedy' }, { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' }, { id: 10749, name: 'Romance' }, { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' }, { id: 99, name: 'Documentary' }, { id: 16, name: 'Animation' },
  { id: 9648, name: 'Mystery' }, { id: 14, name: 'Fantasy' }, { id: 80, name: 'Crime' },
]

const PLATFORMS = [
  { slug: 'netflix', name: 'Netflix', color: '#E50914' },
  { slug: 'prime',   name: 'Prime Video', color: '#00A8E0' },
  { slug: 'disney',  name: 'Disney+', color: '#113CCF' },
  { slug: 'youtube', name: 'YouTube', color: '#FF0000' },
  { slug: 'crunchyroll', name: 'Crunchyroll', color: '#F47521' },
]

const LANGUAGES = [
  { code: 'en', label: '🇺🇸 English' }, { code: 'hi', label: '🇮🇳 Hindi' },
  { code: 'ja', label: '🇯🇵 Japanese' }, { code: 'ko', label: '🇰🇷 Korean' },
  { code: 'es', label: '🇪🇸 Spanish' }, { code: 'fr', label: '🇫🇷 French' },
]

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${
        selected
          ? 'bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--text-primary)]'
          : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
      }`}>
      {children}
    </button>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const qc = useQueryClient()

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn:  () => fetch('/api/profile').then(r => r.json()),
  })

  const profile = profileData?.profile

  const [genres,    setGenres]    = useState<number[]>([])
  const [platforms, setPlatforms] = useState<string[]>([])
  const [langs,     setLangs]     = useState<string[]>([])
  const [synced,    setSynced]    = useState(false)

  // Sync state from server once
  if (profile && !synced) {
    setGenres(profile.favoriteGenreIds?.map(Number) ?? [])
    setPlatforms(profile.preferredPlatforms ?? [])
    setLangs(profile.preferredLangs ?? [])
    setSynced(true)
  }

  function toggle<T>(set: React.Dispatch<React.SetStateAction<T[]>>, val: T) {
    set(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  const save = useMutation({
    mutationFn: () =>
      fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          favoriteGenreIds:   genres,
          preferredPlatforms: platforms,
          preferredLangs:     langs,
        }),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  })

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  if (isLoading) return (
    <div className="space-y-6 max-w-2xl">
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
    </div>
  )

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-6 h-6 text-[var(--accent)]" /> Profile
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your account and preferences</p>
      </div>

      {/* Account info */}
      <div className="glass border border-[var(--border)] rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-[var(--text-secondary)] text-sm uppercase tracking-widest">Account</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/20 flex items-center justify-center text-2xl font-bold text-[var(--accent)]">
            {session?.user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="font-bold text-lg">{session?.user?.name ?? 'User'}</p>
            <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> {session?.user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Favorite genres */}
      <div className="glass border border-[var(--border)] rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Favorite Genres</h2>
        <div className="flex flex-wrap gap-2">
          {GENRES.map(g => (
            <Chip key={g.id} selected={genres.includes(g.id)} onClick={() => toggle(setGenres, g.id)}>
              {g.name}
            </Chip>
          ))}
        </div>
      </div>

      {/* Platforms */}
      <div className="glass border border-[var(--border)] rounded-2xl p-6">
        <h2 className="font-semibold mb-4">My Platforms</h2>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(p => (
            <Chip key={p.slug} selected={platforms.includes(p.slug)} onClick={() => toggle(setPlatforms, p.slug)}>
              <span className="w-2.5 h-2.5 rounded-full inline-block mr-1.5" style={{ background: p.color }} />
              {p.name}
            </Chip>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="glass border border-[var(--border)] rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Preferred Languages</h2>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(l => (
            <Chip key={l.code} selected={langs.includes(l.code)} onClick={() => toggle(setLangs, l.code)}>
              {l.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex gap-3">
        <Button onClick={() => save.mutate()} loading={save.isPending} leftIcon={<Save className="w-4 h-4" />}>
          Save preferences
        </Button>
        {save.isSuccess && (
          <span className="flex items-center text-sm text-green-400 gap-1.5">
            <Shield className="w-4 h-4" /> Saved!
          </span>
        )}
      </div>

      {/* Sign out */}
      <div className="border-t border-[var(--border)] pt-6">
        <Button variant="danger" onClick={handleSignOut} leftIcon={<LogOut className="w-4 h-4" />}>
          Sign out
        </Button>
      </div>
    </div>
  )
}
