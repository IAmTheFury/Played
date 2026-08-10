'use client'

import { useMemo, useState } from 'react'
import { Search, Heart, Library } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { GameCover } from '@/components/game-cover'
import { RatingBadge, StarRating } from '@/components/star-rating'
import { STATUS_META, STATUS_ORDER, type Game, type GameStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

type Filter = 'all' | GameStatus

export function LibraryView({
  games,
  onOpen,
}: {
  games: Game[]
  onOpen: (game: Game) => void
}) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: games.length,
      playing: 0,
      completed: 0,
      backlog: 0,
      abandoned: 0,
    }
    for (const g of games) c[g.status]++
    return c
  }, [games])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return games.filter((g) => {
      if (filter !== 'all' && g.status !== filter) return false
      if (!q) return true
      return (
        g.title.toLowerCase().includes(q) ||
        (g.platform ?? '').toLowerCase().includes(q)
      )
    })
  }, [games, query, filter])

  const filters: Filter[] = ['all', ...STATUS_ORDER]

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un jeu, une plateforme…"
          className="glass h-11 rounded-full border-0 pl-10 shadow-none"
        />
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {filters.map((f) => {
          const active = filter === f
          const label = f === 'all' ? 'Tous' : STATUS_META[f].short
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition-colors',
                active
                  ? 'bg-primary text-primary-foreground ring-primary'
                  : 'bg-card/40 text-muted-foreground ring-border/60 hover:text-foreground',
              )}
            >
              {label}
              <span
                className={cn(
                  'font-display text-xs',
                  active ? 'text-primary-foreground/80' : 'text-muted-foreground/70',
                )}
              >
                {counts[f]}
              </span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState hasGames={games.length > 0} />
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {filtered.map((g) => (
            <button
              key={g.id}
              onClick={() => onOpen(g)}
              aria-label={`Ouvrir ${g.title}`}
              className="group relative overflow-hidden rounded-xl outline-none ring-primary/60 transition-transform duration-200 focus-visible:ring-2 active:scale-[0.98]"
            >
              <GameCover src={g.cover} title={g.title} />

              {g.favorite && (
                <span className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-background/70 backdrop-blur-md">
                  <Heart className="size-3.5 text-primary" fill="currentColor" />
                </span>
              )}
              {g.rating !== undefined && (
                <span className="absolute left-1.5 top-1.5 opacity-100 transition-opacity duration-200 group-hover:opacity-0">
                  <RatingBadge value={g.rating} />
                </span>
              )}

              {/* Overlay premium révélé au survol / focus */}
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background via-background/70 to-transparent p-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                <p className="line-clamp-2 text-left text-xs font-semibold leading-tight text-foreground">
                  {g.title}
                </p>
                {g.rating !== undefined && (
                  <div className="mt-1">
                    <StarRating value={g.rating} size="sm" />
                  </div>
                )}
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span
                    className={cn('size-1.5 rounded-full', STATUS_META[g.status].dot)}
                  />
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {STATUS_META[g.status].short}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState({ hasGames }: { hasGames: boolean }) {
  return (
    <div className="glass flex flex-col items-center justify-center gap-3 rounded-2xl py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Library className="size-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">
        {hasGames
          ? 'Aucun jeu dans cette catégorie.'
          : 'Ta ludothèque est vide. Ajoute ton premier jeu !'}
      </p>
    </div>
  )
}
