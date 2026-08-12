'use client'

import { Share2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GameCover } from '@/components/game-cover'
import { formatRatingFraction } from '@/components/star-rating'
import type { Game } from '@/lib/types'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  profileName: string
  top: Game[]
}

export function ShareTopModal({
  open,
  onOpenChange,
  profileName,
  top,
}: Props) {
  const initial = (profileName.trim()[0] || 'L').toUpperCase()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-h-[92vh] gap-0 overflow-y-auto rounded-2xl border-0 p-0 sm:max-w-sm">
        <DialogHeader className="px-5 pb-2 pt-5 text-left">
          <DialogTitle className="font-display text-lg tracking-tight">
            Partager mon Top
          </DialogTitle>
          <DialogDescription className="text-xs">
            Capture cette carte pour la partager sur les réseaux sociaux.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 px-5 pb-6">
          {/* Carte 9:16 */}
          <div
            id="share-top-card"
            className="relative aspect-[9/16] w-full max-w-[280px] overflow-hidden rounded-2xl"
            style={{
              background:
                'linear-gradient(165deg, rgb(255 255 255 / 0.08) 0%, rgb(9 9 11) 45%, rgb(9 9 11) 100%)',
              border: '1px solid rgb(255 255 255 / 0.1)',
              boxShadow: '0 24px 64px -24px oklch(0 0 0 / 0.9)',
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_18%,transparent)_0%,transparent_55%)]" />

            <div className="relative flex h-full flex-col p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-bold leading-tight">
                    {profileName}
                  </p>
                  <p className="text-[11px] text-muted-foreground">PLAYED</p>
                </div>
              </div>

              <p className="mt-6 font-display text-sm font-semibold uppercase tracking-widest text-primary">
                Mon Top {top.length > 0 ? top.length : 4}
              </p>

              <div className="mt-4 grid flex-1 grid-cols-2 gap-2.5 content-start">
                {Array.from({ length: 4 }).map((_, i) => {
                  const g = top[i]
                  return (
                    <div key={g?.id ?? i} className="relative">
                      {g ? (
                        <>
                          <GameCover src={g.cover} title={g.title} />
                          <span className="absolute -left-1 -top-1.5 flex size-5 items-center justify-center rounded-full bg-primary font-display text-[10px] font-bold text-primary-foreground ring-2 ring-[#09090b]">
                            {i + 1}
                          </span>
                          {g.rating !== undefined && (
                            <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/60 px-1.5 py-0.5 font-display text-[10px] font-semibold text-white backdrop-blur-sm">
                              {formatRatingFraction(g.rating)}
                            </span>
                          )}
                        </>
                      ) : (
                        <div
                          className="aspect-[3/4] w-full rounded-xl"
                          style={{
                            border: '1px dashed rgb(255 255 255 / 0.12)',
                            background: 'rgb(255 255 255 / 0.02)',
                          }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>

              <p className="mt-auto pt-4 text-center text-[10px] text-muted-foreground/80">
                played.app
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Fais une capture d&apos;écran de la carte ci-dessus pour la
            partager.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ShareTopButton({
  onClick,
  disabled,
}: {
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="chip inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-foreground transition-all duration-200 ease-out hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Share2 className="size-4" />
      Partager mon Top
    </button>
  )
}
