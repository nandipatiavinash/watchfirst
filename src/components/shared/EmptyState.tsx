import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 text-center gap-4', className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center">
          <Icon className="w-8 h-8 text-[var(--text-muted)]" />
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-[var(--text-secondary)] max-w-xs mx-auto">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
