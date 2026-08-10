'use client'

import { useMemo, useState } from 'react'
import { ChevronUp, ChevronDown, X, Plus, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GameCover } from '@/components/game-cover'
import { RatingBadge } from '@/components/star-rating'
import { formatGamePlatforms } from '@/lib/platforms'
import type { Game } from '@/lib/types'
import { cn } from '@/lib/utils'

export function RankingView({
  games,
  ranking,
  onMove,
  onRemove,
  onAdd,
  onOpen,
}: {
  games: Game[]
  ranking: string[]
  onMove: (id: string, dir: -1 | 1) => void
  onRemove: (id: string) => void
  onAdd: (id: string) => void
  onOpen: (game: Game) => void
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const byId = useMemo(
    () => new Map(games.map((g) => [g.id, g])),
    [games],
  )
  const ranked = ranking
    .map((id) => byId.get(id))
    .filter((g): g is Game => Boolean(g))

  const available = games.filter((g) => !ranking.includes(g.id))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">
            Mon classement
          </h2>
          <p className="text-sm text-muted-foreground">
            Range tes jeux du meilleur au moins bon, peu importe leur note.
          </p>
        </div>
        <Button size="sm" onClick={() => setPickerOpen(true)}>
          <Plus className="size-4" />
          Ajouter
        </Button>
      </div>

      {ranked.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Trophy className="size-6 text-muted-foreground" />
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            Ton classement est vide. Ajoute des jeux pour créer ton top perso.
          </p>
        </div>
      ) : (
        <ol className="flex flex-col gap-2">
          {ranked.map((g, i) => (
            <li
              key={g.id}
              className="flex items-center gap-3 rounded-xl border bg-card p-2 pr-3"
            >
              <span
                className={cn(
                  'w-7 shrink-0 text-center font-display text-lg font-bold',
                  i === 0 && 'text-primary',
                  i > 0 && i < 3 && 'text-foreground',
                  i >= 3 && 'text-muted-foreground',
                )}
              >
                {i + 1}
              </span>
              <button
                onClick={() => onOpen(g)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <div className="w-10 shrink-0">
                  <GameCover src={g.cover} title={g.title} />
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="line-clamp-1 text-sm font-medium">
                    {g.title}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {formatGamePlatforms(g.platforms) && (
                      <span className="line-clamp-1">
                        {formatGamePlatforms(g.platforms)}
                      </span>
                    )}
                    {g.rating !== undefined && <RatingBadge value={g.rating} />}
                  </div>
                </div>
              </button>
              <div className="flex flex-col">
                <button
                  aria-label="Monter"
                  disabled={i === 0}
                  onClick={() => onMove(g.id, -1)}
                  className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
                >
                  <ChevronUp className="size-4" />
                </button>
                <button
                  aria-label="Descendre"
                  disabled={i === ranked.length - 1}
                  onClick={() => onMove(g.id, 1)}
                  className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
                >
                  <ChevronDown className="size-4" />
                </button>
              </div>
              <button
                aria-label="Retirer du classement"
                onClick={() => onRemove(g.id)}
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-destructive"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ol>
      )}

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-h-[80vh] gap-0 overflow-y-auto p-0 sm:max-w-md">
          <DialogHeader className="border-b p-5">
            <DialogTitle className="font-display text-lg">
              Ajouter au classement
            </DialogTitle>
          </DialogHeader>
          <div className="p-3">
            {available.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                Tous tes jeux sont déjà classés.
              </p>
            ) : (
              <ul className="flex flex-col">
                {available.map((g) => (
                  <li key={g.id}>
                    <button
                      onClick={() => {
                        onAdd(g.id)
                        if (available.length === 1) setPickerOpen(false)
                      }}
                      className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-accent"
                    >
                      <div className="w-9 shrink-0">
                        <GameCover src={g.cover} title={g.title} />
                      </div>
                      <span className="line-clamp-1 flex-1 text-sm font-medium">
                        {g.title}
                      </span>
                      <Plus className="size-4 text-muted-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
