'use client'
import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/shared/Button'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-900/20 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-[var(--text-secondary)] mb-8 max-w-sm text-sm">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
