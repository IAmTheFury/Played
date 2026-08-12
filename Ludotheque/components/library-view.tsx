'use client'

import { useMemo, useState } from 'react'
import { Search, Heart, Library } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { GameCover } from '@/components/game-cover'
import { StarRating, RatingBadge } from '@/components/star-rating'
import { StatusBadge } from '@/components/status-badge'
import { formatGamePlatforms } from '@/lib/platforms'
import { STATUS_META, STATUS_ORDER, type Game, type GameStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

type Filter = 'all' | GameStatus | 'favorite'

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
      favorite: games.filter(g => g.favorite).length,
    }
    for (const g of games) c[g.status]++
    return c
  }, [games])

  const completedCount = useMemo(() => 
    games.filter(g => g.status === 'completed').length, 
    [games]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return games.filter((g) => {
      if (filter === 'favorite') {
        if (!g.favorite) return false
      } else if (filter !== 'all' && g.status !== filter) {
        return false
      }
      if (!q) return true
      return (
        g.title.toLowerCase().includes(q) ||
        formatGamePlatforms(g.platforms).toLowerCase().includes(q)
      )
    })
  }, [games, query, filter])

  const filters: Filter[] = ['all', 'favorite', ...STATUS_ORDER]

  return (
    <div className="flex flex-col gap-6">
      {/* Header éditorial de la collection */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3 mb-1">
                <h1 className="font-display text-2xl sm:text-xl font-bold tracking-tight text-foreground">
                  Collection
                </h1>
                {/* Barre de Recherche mobile - alignée avec le titre */}
                <div className="relative group sm:hidden">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-primary/60" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Chercher…"
                    className="h-8 w-28 rounded-full border-white/[0.06] bg-white/[0.02] pl-8 pr-3 text-[11px] shadow-none transition-all duration-300 focus:w-36 focus:border-white/[0.12] focus:bg-white/[0.04] focus:ring-0"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground/80">
                {games.length} jeu{games.length > 1 ? 'x' : ''} • {completedCount} terminé{completedCount > 1 ? 's' : ''}
              </p>
            </div>
            
            {/* Barre de Recherche desktop */}
            <div className="relative group hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/40 transition-colors group-focus-within:text-primary/60" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Chercher un jeu…"
                className="h-9 w-36 rounded-full border-white/[0.06] bg-white/[0.02] pl-9 pr-3 text-xs shadow-none transition-all duration-300 focus:w-48 focus:border-white/[0.12] focus:bg-white/[0.04] focus:ring-0"
              />
            </div>
          </div>
        </div>

        {/* Filtres d'onglets compacts et secondaires avec compteurs */}
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {filters.map((f) => {
          const active = filter === f
          const label = f === 'all' ? 'Tous' : f === 'favorite' ? 'Favoris' : STATUS_META[f].short
          const count = counts[f]
          const showCount = count > 0
          
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200 ease-out',
                active
                  ? 'bg-white/12 text-foreground ring-1 ring-white/20 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04] hover:ring-1 hover:ring-white/[0.08]'
              )}
            >
              <span className={cn(
                'size-1.5 rounded-full',
                active ? 'bg-primary' : f === 'favorite' ? 'bg-primary/60' : 'bg-muted-foreground/40'
              )} />
              {label}
              {showCount && (
                <span className={cn(
                  'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold transition-colors',
                  active 
                    ? 'bg-white/20 text-foreground' 
                    : 'bg-white/[0.04] text-muted-foreground'
                )}>
                  {count}
                </span>
              )}
            </button>
          )
            })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState hasGames={games.length > 0} />
      ) : (
        /* Grille de jaquettes - bibliothèque visuelle */
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((g) => (
            <div key={g.id} className="group">
              <button
                onClick={() => onOpen(g)}
                aria-label={`Ouvrir ${g.title}`}
                className="relative w-full overflow-hidden rounded-2xl outline-none transition-all duration-400 ease-out hover:scale-[1.02] hover:shadow-xl hover:shadow-black/30 focus-visible:ring-2 focus-visible:ring-white/20 active:scale-[0.99]"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent">
                  <GameCover src={g.cover} title={g.title} className="rounded-2xl" />
                  
                  {/* Gradient de profondeur subtil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  
                  {/* Overlay de luminosité au hover */}
                  <div className="absolute inset-0 bg-white/[0.015] opacity-0 transition-opacity duration-400 group-hover:opacity-100" />
                  
                  {g.favorite && (
                    <span className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/65 backdrop-blur-md transition-all duration-400 group-hover:bg-black/75 group-hover:scale-110">
                      <Heart className="size-2.5 text-primary" fill="currentColor" />
                    </span>
                  )}

                  {/* Note élégante intégrée - système de carrés amélioré */}
                  {g.rating !== undefined && (
                    <div className="absolute bottom-1.5 right-1.5">
                      <div className="flex items-center gap-1 rounded-full bg-black/80 backdrop-blur-md px-1.5 py-1 border border-white/[0.12] transition-all duration-400 group-hover:bg-black/90 group-hover:scale-105 group-hover:border-white/[0.18]">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => {
                            const starValue = g.rating! / 2
                            const filled = i <= starValue
                            const halfFilled = i === Math.ceil(starValue) && starValue % 1 > 0.3
                            
                            return (
                              <div key={i} className="relative size-1.5">
                                {/* Fond vide */}
                                <div className="absolute inset-0">
                                  <div className={cn(
                                    "size-1.5 rounded-[0.5px]",
                                    "bg-white/20"
                                  )} />
                                </div>
                                {/* Partie remplie */}
                                {filled && (
                                  <div className="absolute inset-0">
                                    <div className="size-1.5 rounded-[0.5px] bg-primary" />
                                  </div>
                                )}
                                {/* Demi-carré avec séparation claire */}
                                {halfFilled && (
                                  <>
                                    <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                                      <div className="size-1.5 rounded-[0.5px] bg-primary" />
                                    </div>
                                    {/* Ligne de séparation */}
                                    <div className="absolute inset-0 left-1/2 w-[0.5px] bg-white/40" />
                                  </>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        <span className="text-[9px] font-bold tracking-tight text-white min-w-[10px] text-center ml-0.5">
                          {g.rating}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Informations intégrées sous la carte */}
                <div className="pt-2 px-1 pb-1">
                  <p className="line-clamp-1 text-left text-[11px] font-semibold leading-tight text-foreground/90 group-hover:text-foreground transition-colors duration-400">
                    {g.title}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <StatusBadge
                      status={g.status}
                      className="text-[8px] py-0.5 px-1 bg-white/[0.03] border-white/[0.06]"
                    />
                    <span className="text-[8px] text-muted-foreground/70 truncate max-w-[40px] sm:max-w-[50px]">
                      {g.platforms?.[0] || ''}
                    </span>
                  </div>
                </div>
              </button>
            </div>
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
      <div className="relative flex flex-col items-center justify-center gap-5 max-w-sm mx-auto">
        <div className="flex size-16 items-center justify-center rounded-full bg-white/[0.01] border border-white/[0.05] shadow-inner">
          <Library className="size-7 text-muted-foreground/60" />
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-lg font-bold tracking-tight text-foreground/90">
            {hasGames ? 'Aucun jeu trouvé' : 'Collection vide'}
          </h3>
          <p className="text-sm text-muted-foreground/70 leading-relaxed">
            {hasGames
              ? 'Essayez de modifier vos filtres ou votre recherche.'
              : 'Ajoutez votre premier jeu pour commencer à construire votre collection.'}
          </p>
          {!hasGames && (
            <div className="pt-2">
              <p className="text-xs text-muted-foreground/50 italic">
                Cliquez sur « Ajouter » en haut à droite pour commencer
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
