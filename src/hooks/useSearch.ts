import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { MovieContent, TvShowContent, YoutubeContent } from '@/types'

interface SearchResults {
  movies:        MovieContent[]
  tvShows:       TvShowContent[]
  youtubeVideos: YoutubeContent[]
  totalMovies:   number
  totalTv:       number
  totalYoutube:  number
}

export function useSearch() {
  const [query, setQuery]   = useState('')
  const [debouncedQ, setDQ] = useState('')
  const [page, setPage]     = useState(1)
  const [sources, setSources] = useState<'all' | 'tmdb' | 'youtube'>('all')

  useEffect(() => {
    const t = setTimeout(() => { setDQ(query); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [query])

  const { data, isFetching, isError } = useQuery<SearchResults>({
    queryKey: ['search', debouncedQ, page, sources],
    queryFn:  async () => {
      if (!debouncedQ.trim()) {
        return { movies: [], tvShows: [], youtubeVideos: [], totalMovies: 0, totalTv: 0, totalYoutube: 0 }
      }
      const url = `/api/search?q=${encodeURIComponent(debouncedQ)}&page=${page}&sources=${sources}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Search failed')
      return res.json()
    },
    enabled: debouncedQ.length >= 2,
    staleTime: 30_000,
  })

  const hasResults = !!(
    data?.movies.length ||
    data?.tvShows.length ||
    data?.youtubeVideos.length
  )

  return {
    query, setQuery,
    page, setPage,
    sources, setSources,
    results: data,
    isFetching, isError, hasResults,
  }
}
