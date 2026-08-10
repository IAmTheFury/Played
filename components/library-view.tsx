'use client'

import { useMemo, useState } from 'react'
import { Search, Heart, Library } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { GameCover } from '@/components/game-cover'
import { StarRating } from '@/components/star-rating'
import { StatusBadge } from '@/components/status-badge'
import { formatGamePlatforms } from '@/lib/platforms'
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
        formatGamePlatforms(g.platforms).toLowerCase().includes(q)
      )
    })
  }, [games, query, filter])

  const filters: Filter[] = ['all', ...STATUS_ORDER]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        {/* Filtres d'onglets compacts et secondaires */}
        <div className="no-scrollbar -mx-4 flex-1 flex gap-1.5 overflow-x-auto px-4 pb-0.5">
          {filters.map((f) => {
          const active = filter === f
          const label = f === 'all' ? 'Tous' : STATUS_META[f].short
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ease-out',
                active
                  ? 'bg-white/10 text-foreground ring-1 ring-white/15'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              )}
            >
              {label}
            </button>
          )
            })}
          </div>

        {/* Barre de Recherche */}
        <div className="relative group shrink-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-primary/60" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher…"
            className="h-8 w-32 rounded-full border-white/[0.04] bg-white/[0.01] pl-8 pr-3 text-[11px] shadow-none transition-all duration-300 focus:w-48 focus:border-white/[0.1] focus:bg-white/[0.03] focus:ring-0"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState hasGames={games.length > 0} />
      ) : (
        /* Grille de jaquettes au centre de l'expérience */
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {filtered.map((g) => (
            <button
              key={g.id}
              onClick={() => onOpen(g)}
              aria-label={`Ouvrir ${g.title}`}
              className="group relative overflow-hidden rounded-xl outline-none transition-transform duration-200 ease-out hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-white/20 active:scale-95"
            >
              <GameCover src={g.cover} title={g.title} />

              {g.favorite && (
                <span className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-black/45 backdrop-blur-md">
                  <Heart className="size-3.5 text-primary" fill="currentColor" />
                </span>
              )}

              {/* Overlay d'information haut de gamme au survol */}
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/50 to-transparent p-3 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100">
                <p className="line-clamp-2 text-left text-[11px] font-bold leading-tight text-white">
                  {g.title}
                </p>
                {g.rating !== undefined && (
                  <div className="mt-1">
                    <StarRating value={g.rating} size="sm" />
                  </div>
                )}
                <div className="mt-1.5">
                  <StatusBadge
                    status={g.status}
                    className="bg-white/10 text-white ring-white/15 py-0.5 text-[9px]"
                  />
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
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.01] px-6 py-16 text-center shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.015)_0%,transparent_100%)] pointer-events-none" />
      <div className="relative flex flex-col items-center justify-center gap-4 max-w-sm mx-auto">
        <div className="flex size-14 items-center justify-center rounded-full bg-white/[0.01] border border-white/[0.05] shadow-inner">
          <Library className="size-6 text-muted-foreground/60" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-display text-base font-bold tracking-tight text-foreground/90">
            {hasGames ? 'Aucun résultat' : '« Ta collection commence ici. »'}
          </h3>
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            {hasGames
              ? 'Aucun jeu ne correspond à vos filtres ou à votre recherche actuelle.'
              : 'Consigne tes sessions de jeu, attribue des notes détaillées à tes coups de cœur et compose ton classement ultime.'}
          </p>
        </div>
      </div>
    </div>
  )
}
