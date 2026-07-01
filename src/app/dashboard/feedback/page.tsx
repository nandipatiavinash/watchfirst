'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ThumbsUp, Star, Send, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/shared/Button'
import { cn } from '@/lib/utils/cn'

const TAGS = [
  'Too long', 'Too short', 'Wrong mood', 'Already watched',
  'Great pick', 'Not my genre', 'Boring', 'Loved it',
  'Poor quality', 'Wrong language',
]

function FeedbackPageContent() {
  const params   = useSearchParams()
  const router   = useRouter()
  const contentId   = params.get('contentId') ?? ''
  const contentType = (params.get('type') ?? 'movie') as 'movie' | 'tv_show'

  const [score, setScore]     = useState(0)
  const [hovered, setHovered] = useState(0)
  const [tags, setTags]       = useState<string[]>([])
  const [note, setNote]       = useState('')
  const [done, setDone]       = useState(false)

  const submit = useMutation({
    mutationFn: () =>
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, contentType, score, tags, note }),
      }).then(r => r.json()),
    onSuccess: () => setDone(true),
  })

  if (done) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/20 flex items-center justify-center">
        <ThumbsUp className="w-8 h-8 text-[var(--accent)]" />
      </div>
      <h2 className="text-2xl font-bold">Thanks for your feedback!</h2>
      <p className="text-[var(--text-secondary)]">We'll use this to improve your recommendations.</p>
      <div className="flex gap-3 mt-2">
        <Link href="/dashboard/recommend"
          className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium px-5 py-2.5 rounded-xl transition-colors">
          Get another recommendation
        </Link>
        <Link href="/dashboard"
          className="bg-[var(--bg-card)] border border-[var(--border)] font-medium px-5 py-2.5 rounded-xl transition-colors">
          Dashboard
        </Link>
      </div>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ThumbsUp className="w-6 h-6 text-[var(--accent)]" /> Rate this content
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Your feedback makes recommendations smarter
        </p>
      </div>

      {/* Star rating */}
      <div className="glass border border-[var(--border)] rounded-2xl p-6">
        <p className="font-semibold mb-4">How would you rate it?</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setScore(s)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  'w-10 h-10 transition-colors',
                  s <= (hovered || score)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-[var(--border)]'
                )}
              />
            </button>
          ))}
        </div>
        {score > 0 && (
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            {['', 'Terrible', 'Not great', 'Okay', 'Good', 'Excellent!'][score]}
          </p>
        )}
      </div>

      {/* Tags */}
      <div className="glass border border-[var(--border)] rounded-2xl p-6">
        <p className="font-semibold mb-4">Any quick feedback? (optional)</p>
        <div className="flex flex-wrap gap-2">
          {TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setTags(prev =>
                prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
              )}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm border transition-all',
                tags.includes(tag)
                  ? 'bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)]'
                  : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="glass border border-[var(--border)] rounded-2xl p-6">
        <p className="font-semibold mb-3">Anything else? (optional)</p>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Tell us what you thought…"
          rows={3}
          maxLength={500}
          className="w-full bg-[var(--bg-card)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none placeholder:text-[var(--text-muted)]"
        />
        <p className="text-xs text-[var(--text-muted)] text-right mt-1">{note.length}/500</p>
      </div>

      <Button
        onClick={() => submit.mutate()}
        disabled={score === 0}
        loading={submit.isPending}
        size="lg"
        className="w-full"
        leftIcon={<Send className="w-4 h-4" />}
      >
        Submit feedback
      </Button>
    </div>
  )
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-[var(--text-secondary)]">Loading feedback form...</div>}>
      <FeedbackPageContent />
    </Suspense>
  )
}
