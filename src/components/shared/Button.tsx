import { cn } from '@/lib/utils/cn'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: React.ReactNode
}

const variants = {
  primary:   'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-lg shadow-[var(--accent-glow)]',
  secondary: 'bg-[var(--bg-card)] hover:bg-[var(--bg-glass)] text-[var(--text-primary)] border border-[var(--border)]',
  ghost:     'hover:bg-[var(--bg-glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
  danger:    'bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  leftIcon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
    </button>
  )
}
