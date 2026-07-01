import { ContentCard } from './ContentCard'
import { EmptyState } from './EmptyState'
import { Film } from 'lucide-react'
import type { AnyContent } from '@/types'

interface ContentRowProps {
  items: AnyContent[]
  showScore?: boolean
  emptyMessage?: string
}

function hrefFor(item: AnyContent): string {
  if (item.type === 'youtube') return `/dashboard/content/youtube/${item.videoId}`
  return `/dashboard/content/${item.type === 'movie' ? 'movie' : 'tv'}/${item.id}`
}

export function ContentRow({ items, showScore, emptyMessage = 'Nothing here yet.' }: ContentRowProps) {
  if (!items.length) {
    return <EmptyState icon={Film} title={emptyMessage} />
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map(item => (
        <ContentCard
          key={item.id}
          content={item}
          showScore={showScore}
          href={hrefFor(item)}
        />
      ))}
    </div>
  )
}
