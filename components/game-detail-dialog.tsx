'use client'

import { Heart, Pencil, Trophy, Trash2, Monitor } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { GameCover } from '@/components/game-cover'
import { StarRating, formatRating10 } from '@/components/star-rating'
import { StatusBadge } from '@/components/status-badge'
import { formatGamePlatforms } from '@/lib/platforms'
import type { Game } from '@/lib/types'
import { cn } from '@/lib/utils'

export function GameDetailDialog({
  game,
  onOpenChange,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleRanking,
  inRanking,
}: {
  game: Game | null
  onOpenChange: (open: boolean) => void
  onEdit: (game: Game) => void
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
  onToggleRanking: (id: string) => void
  inRanking: boolean
}) {
  return (
    <Dialog open={Boolean(game)} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-h-[90vh] gap-0 overflow-y-auto rounded-2xl border-0 p-0 sm:max-w-md">
        {game && (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>{game.title}</DialogTitle>
            </DialogHeader>

            <div className="flex gap-4 p-5">
              <div className="w-28 shrink-0">
                <GameCover src={game.cover} title={game.title} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <h2 className="text-pretty font-display text-xl font-semibold leading-tight">
                  {game.title}
                </h2>
                {formatGamePlatforms(game.platforms) && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Monitor className="size-3.5 shrink-0" />
                    {formatGamePlatforms(game.platforms)}
                  </span>
                )}
                <div className="mt-1">
                  <StatusBadge status={game.status} />
                </div>
                {game.rating !== undefined && (
                  <div className="mt-1 flex items-center gap-2">
                    <StarRating value={game.rating} size="sm" />
                    <span className="font-display text-sm font-semibold text-primary">
                      {formatRating10(game.rating)}/10
                    </span>
                  </div>
                )}
              </div>
            </div>

            {game.review && (
              <div
                className="px-5 py-4"
                style={{ borderTop: '1px solid rgb(255 255 255 / 0.08)' }}
              >
                <p className="whitespace-pre-wrap text-pretty text-sm leading-relaxed text-foreground/90">
                  {game.review}
                </p>
              </div>
            )}

            <div
              className="flex flex-wrap gap-2 p-4"
              style={{
                borderTop: '1px solid rgb(255 255 255 / 0.08)',
                background: 'rgb(255 255 255 / 0.02)',
              }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleFavorite(game.id)}
                className="border-white/10 bg-white/[0.03]"
              >
                <Heart
                  className={cn('size-4', game.favorite && 'text-primary')}
                  fill={game.favorite ? 'currentColor' : 'none'}
                />
                {game.favorite ? 'Favori' : 'Ajouter aux favoris'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleRanking(game.id)}
                className="border-white/10 bg-white/[0.03]"
              >
                <Trophy
                  className={cn('size-4', inRanking && 'text-primary')}
                />
                {inRanking ? 'Dans le classement' : 'Classer'}
              </Button>
              <div className="ml-auto flex gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Supprimer"
                  onClick={() => {
                    onDelete(game.id)
                    onOpenChange(false)
                  }}
                  className="border-white/10 bg-white/[0.03]"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
                <Button size="sm" onClick={() => onEdit(game)}>
                  <Pencil className="size-4" />
                  Modifier
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
