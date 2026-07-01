'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bookmark, Plus, Trash2, Lock, Globe, Film } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/shared/Skeleton'
import { Button } from '@/components/shared/Button'

interface ListItem {
  id:          string
  name:        string
  description: string | null
  isPublic:    boolean
  updatedAt:   string
  _count:      { items: number }
}

function CreateListModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [name, setName]     = useState('')
  const [desc, setDesc]     = useState('')
  const [pub, setPub]       = useState(false)

  const create = useMutation({
    mutationFn: () =>
      fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: desc, isPublic: pub }),
      }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lists'] }); onClose() },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="glass border border-[var(--border)] rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-5">Create new list</h2>
        <div className="space-y-4">
          <input
            value={name} onChange={e => setName(e.target.value)}
            placeholder="List name"
            className="w-full bg-[var(--bg-card)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl px-4 py-3 text-sm outline-none transition-colors"
          />
          <textarea
            value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
            className="w-full bg-[var(--bg-card)] border border-[var(--border)] focus:border-[var(--accent)] rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none"
          />
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setPub(v => !v)}
              className={`w-10 h-6 rounded-full transition-colors relative ${pub ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${pub ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm">{pub ? 'Public' : 'Private'}</span>
          </label>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={() => create.mutate()} loading={create.isPending} disabled={!name.trim()} className="flex-1">
            Create list
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ListsPage() {
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = useQuery<{ lists: ListItem[] }>({
    queryKey: ['lists'],
    queryFn:  () => fetch('/api/lists').then(r => r.json()),
  })

  const del = useMutation({
    mutationFn: (id: string) => fetch(`/api/lists/${id}`, { method: 'DELETE' }),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['lists'] }),
  })

  const lists = data?.lists ?? []

  return (
    <div className="space-y-6">
      {showCreate && <CreateListModal onClose={() => setShowCreate(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-[var(--accent)]" /> My Lists
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Organise content into custom lists</p>
        </div>
        <Button onClick={() => setShowCreate(true)} leftIcon={<Plus className="w-4 h-4" />}>
          New list
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : lists.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No lists yet"
          description="Create a list to organise your watchlist, favourites by genre, or anything else."
          action={
            <Button onClick={() => setShowCreate(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Create your first list
            </Button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {lists.map(list => (
            <div
              key={list.id}
              className="glass border border-[var(--border)] hover:border-[var(--border-hover)] rounded-2xl p-5 flex items-start gap-4 group transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center shrink-0">
                <Film className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{list.name}</p>
                  {list.isPublic
                    ? <Globe className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    : <Lock className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
                </div>
                {list.description && (
                  <p className="text-sm text-[var(--text-secondary)] truncate mt-0.5">{list.description}</p>
                )}
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {list._count.items} item{list._count.items !== 1 ? 's' : ''} ·{' '}
                  Updated {new Date(list.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => del.mutate(list.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-[var(--text-muted)] hover:text-red-400 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
