import { Shield, Users, Film, MessageSquare, Flag, TrendingUp, Database, Zap } from 'lucide-react'
import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/client'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

async function getStats() {
  const [users, movies, tvShows, recommendations, feedback, flags] = await Promise.all([
    prisma.user.count(),
    prisma.movie.count(),
    prisma.tvShow.count(),
    prisma.recommendation.count(),
    prisma.feedback.count(),
    prisma.featureFlag.findMany({ orderBy: { key: 'asc' } }),
  ])
  return { users, movies, tvShows, recommendations, feedback, flags }
}

function StatCard({ icon: Icon, label, value, color = 'text-[var(--accent)]' }: {
  icon: React.ElementType; label: string; value: number | string; color?: string
}) {
  return (
    <div className="glass border border-[var(--border)] rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--bg-card)] flex items-center justify-center">
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <span className="text-sm text-[var(--text-secondary)] font-medium">{label}</span>
      </div>
      <p className="text-3xl font-extrabold">{value}</p>
    </div>
  )
}

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/login')

  // Simple admin check — extend with AdminUser table as needed
  const isAdmin = await prisma.adminUser.findUnique({ where: { email: session.user.email! } })
  if (!isAdmin) redirect('/dashboard')

  const stats = await getStats()

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-[var(--text-secondary)]">WatchFast system overview</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}          label="Total users"           value={stats.users} />
        <StatCard icon={Film}           label="Movies in DB"          value={stats.movies} />
        <StatCard icon={TrendingUp}     label="TV shows in DB"        value={stats.tvShows} />
        <StatCard icon={Zap}            label="Recommendations made"  value={stats.recommendations} />
        <StatCard icon={MessageSquare}  label="Feedback entries"      value={stats.feedback} />
        <StatCard icon={Flag}           label="Feature flags"         value={stats.flags.length} />
      </div>

      {/* Feature flags */}
      <div className="glass border border-[var(--border)] rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
          <Flag className="w-5 h-5 text-[var(--accent)]" /> Feature Flags
        </h2>
        <div className="space-y-3">
          {stats.flags.map(flag => (
            <div key={flag.id}
              className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
              <div>
                <p className="font-mono text-sm font-semibold">{flag.key}</p>
                {flag.description && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{flag.description}</p>
                )}
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                flag.enabled
                  ? 'bg-green-900/30 text-green-400 border border-green-800/40'
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)]'
              }`}>
                {flag.enabled ? 'ON' : 'OFF'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* DB health */}
      <div className="glass border border-[var(--border)] rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
          <Database className="w-5 h-5 text-[var(--accent)]" /> Database
        </h2>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-[var(--bg-card)] rounded-xl p-4">
            <p className="text-[var(--text-muted)] mb-1">Movies</p>
            <p className="text-2xl font-bold">{stats.movies}</p>
          </div>
          <div className="bg-[var(--bg-card)] rounded-xl p-4">
            <p className="text-[var(--text-muted)] mb-1">TV Shows</p>
            <p className="text-2xl font-bold">{stats.tvShows}</p>
          </div>
          <div className="bg-[var(--bg-card)] rounded-xl p-4">
            <p className="text-[var(--text-muted)] mb-1">Recommendations</p>
            <p className="text-2xl font-bold">{stats.recommendations}</p>
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-4">
          * Movies/TV shows populate as users browse content. Seed with TMDb sync (Phase 9).
        </p>
      </div>
    </div>
  )
}
