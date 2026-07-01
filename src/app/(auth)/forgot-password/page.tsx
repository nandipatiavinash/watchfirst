'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/shared/Button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // TODO: wire to better-auth forgot password
    await new Promise(r => setTimeout(r, 1000))
    setSent(true)
    setLoading(false)
  }

  if (sent) return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/20 flex items-center justify-center mx-auto mb-4">
        <Mail className="w-7 h-7 text-[var(--accent)]" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Check your email</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6">We sent a reset link to <strong>{email}</strong></p>
      <Link href="/login" className="text-[var(--accent)] hover:underline text-sm">Back to sign in</Link>
    </div>
  )

  return (
    <>
      <div className="mb-8">
        <Link href="/login" className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Enter your email and we'll send a reset link.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full bg-[var(--bg-card)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--text-muted)]" />
        </div>
        <Button type="submit" loading={loading} className="w-full" size="lg">Send reset link</Button>
      </form>
    </>
  )
}
