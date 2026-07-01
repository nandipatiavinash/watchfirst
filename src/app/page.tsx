import Link from 'next/link'
import { Zap, Clock, Tv, Star, ArrowRight, Check } from 'lucide-react'

const FEATURES = [
  { icon: Clock, title: 'Under 10 seconds', desc: 'AI picks the perfect watch based on your available time, mood, and platform.' },
  { icon: Tv,    title: 'All platforms', desc: 'Netflix, Prime, Disney+, Crunchyroll, YouTube — one place for everything.' },
  { icon: Star,  title: 'Learns from you', desc: 'Gets smarter every time you rate, watch, or skip. Truly personal.' },
  { icon: Zap,   title: 'Mood-aware', desc: 'Breakfast comedy or late-night thriller — it knows the difference.' },
]

const PRICING = [
  {
    name: 'Free', price: '$0', period: 'forever',
    features: ['5 recommendations/day', '2 platforms', 'Basic mood filters', 'Watch history'],
    cta: 'Get started', href: '/signup', highlight: false,
  },
  {
    name: 'Pro', price: '$7', period: '/month',
    features: ['Unlimited recommendations', 'All platforms', 'AI explanations', 'Meal mode', 'Advanced filters', 'Priority support'],
    cta: 'Start free trial', href: '/signup?plan=pro', highlight: true,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-dvh" style={{ background: 'var(--bg-primary)' }}>
      {/* Nav */}
      <header className="sticky top-0 z-50 glass border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-bold text-lg gradient-text">WatchFast AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-40 px-6">
        {/* Glow blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--accent)] opacity-10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm text-[var(--text-secondary)] mb-8">
            <Zap className="w-3.5 h-3.5 text-[var(--accent)]" />
            AI-powered in under 10 seconds
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Stop scrolling.
            <br />
            <span className="gradient-text">Start watching.</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            WatchFast AI finds your perfect movie or episode in under 10 seconds —
            based on your mood, time, platform, and everything you love.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold px-8 py-4 rounded-2xl text-lg glow transition-all hover:scale-105"
            >
              Try it free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 glass text-[var(--text-primary)] font-medium px-8 py-4 rounded-2xl text-lg hover:border-[var(--border-hover)] transition-all"
            >
              Sign in
            </Link>
          </div>

          <p className="mt-4 text-sm text-[var(--text-muted)]">No credit card required · Free forever plan available</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Why WatchFast?</h2>
          <p className="text-center text-[var(--text-secondary)] mb-12 max-w-xl mx-auto">
            Built for people who value their time more than endless scrolling.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="glass rounded-2xl p-6 card-hover">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Simple pricing</h2>
          <p className="text-center text-[var(--text-secondary)] mb-12">Start free. Upgrade when you love it.</p>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {PRICING.map(plan => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border ${
                  plan.highlight
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5 relative'
                    : 'border-[var(--border)] bg-[var(--bg-card)]'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--accent)] text-white text-xs font-bold px-3 py-1 rounded-full">
                    POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-bold text-xl">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className="text-[var(--text-secondary)] text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-[var(--accent)] shrink-0" />
                      <span className="text-[var(--text-secondary)]">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block text-center py-3 rounded-xl font-medium text-sm transition-all ${
                    plan.highlight
                      ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white'
                      : 'bg-[var(--bg-glass)] hover:bg-[var(--border)] text-[var(--text-primary)]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 px-6 text-center text-sm text-[var(--text-muted)]">
        <p>© {new Date().getFullYear()} WatchFast AI. Built for people who have better things to do than scroll.</p>
      </footer>
    </div>
  )
}
