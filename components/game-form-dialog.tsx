'use client'

import { useEffect, useRef, useState } from 'react'
import { Heart, Plus, Check, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StarRating, formatRating5 } from '@/components/star-rating'
import { GameCover } from '@/components/game-cover'
import { STATUS_META, STATUS_ORDER, type Game } from '@/lib/types'
import type { NewGame } from '@/lib/store'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  platforms: string[]
  game?: Game | null
  onSubmit: (game: NewGame) => void
}

const empty: NewGame = {
  title: '',
  platform: '',
  cover: '',
  rating: undefined,
  review: '',
  favorite: false,
  status: 'backlog',
}

export function GameFormDialog({
  open,
  onOpenChange,
  platforms,
  game,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<NewGame>(empty)
  const [customPlatforms, setCustomPlatforms] = useState<string[]>([])
  const [addingPlatform, setAddingPlatform] = useState(false)
  const [customValue, setCustomValue] = useState('')
  const customInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setForm(
        game
          ? {
              title: game.title,
              platform: game.platform ?? '',
              cover: game.cover ?? '',
              rating: game.rating,
              review: game.review ?? '',
              favorite: game.favorite,
              status: game.status,
            }
          : empty,
      )
      setCustomPlatforms([])
      setAddingPlatform(false)
      setCustomValue('')
    }
  }, [open, game])

  useEffect(() => {
    if (addingPlatform) customInputRef.current?.focus()
  }, [addingPlatform])

  const set = <K extends keyof NewGame>(key: K, value: NewGame[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const canSubmit = form.title.trim().length > 0

  // Liste des chips plateforme : suggestions connues + ajouts de la session +
  // la valeur actuelle si elle n'y figure pas encore (jeu importé, etc.).
  const platformChips = Array.from(
    new Set(
      [...platforms, ...customPlatforms, form.platform || ''].filter(Boolean),
    ),
  )

  function confirmCustomPlatform() {
    const v = customValue.trim()
    if (v) {
      setCustomPlatforms((list) =>
        list.some((x) => x.toLowerCase() === v.toLowerCase()) ? list : [...list, v],
      )
      set('platform', v)
    }
    setCustomValue('')
    setAddingPlatform(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({
      ...form,
      title: form.title.trim(),
      platform: form.platform?.trim() || undefined,
      cover: form.cover?.trim() || undefined,
      review: form.review?.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-h-[92vh] gap-0 overflow-y-auto rounded-2xl p-0 sm:max-w-lg">
        <DialogHeader className="px-5 pb-3 pt-5 text-left">
          <DialogTitle className="font-display text-xl tracking-tight">
            {game ? 'Modifier le jeu' : 'Ajouter un jeu'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Renseigne les infos à la main. La jaquette accepte n&apos;importe
            quelle URL d&apos;image.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-5 pb-5">
          <div className="flex gap-4">
            <div className="w-24 shrink-0">
              <GameCover src={form.cover} title={form.title || 'Aperçu'} />
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="Ex : Outer Wilds"
                  autoFocus
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cover">URL de la jaquette</Label>
                <Input
                  id="cover"
                  value={form.cover}
                  onChange={(e) => set('cover', e.target.value)}
                  placeholder="https://…"
                  inputMode="url"
                />
              </div>
            </div>
          </div>

          {/* Statut : chips proéminents */}
          <div className="grid gap-2">
            <Label>Statut</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {STATUS_ORDER.map((s) => {
                const active = form.status === s
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set('status', s)}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-all',
                      active
                        ? 'border-primary/60 bg-primary/15 text-foreground shadow-sm shadow-primary/20'
                        : 'border-border/60 bg-card/40 text-muted-foreground hover:border-border hover:text-foreground',
                    )}
                  >
                    <span
                      className={cn('size-2 rounded-full', STATUS_META[s].dot)}
                    />
                    {STATUS_META[s].short}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Plateforme : chips + ajout personnalisé */}
          <div className="grid gap-2">
            <Label>Plateforme</Label>
            <div className="flex flex-wrap gap-2">
              {platformChips.map((p) => {
                const active = form.platform === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set('platform', active ? '' : p)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
                      active
                        ? 'border-primary/60 bg-primary/15 text-foreground'
                        : 'border-border/60 bg-card/40 text-muted-foreground hover:border-border hover:text-foreground',
                    )}
                  >
                    {p}
                  </button>
                )
              })}

              {addingPlatform ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/50 bg-card/60 py-0.5 pl-3 pr-1">
                  <input
                    ref={customInputRef}
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.nativeEvent.isComposing || e.keyCode === 229) return
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        confirmCustomPlatform()
                      }
                      if (e.key === 'Escape') {
                        setAddingPlatform(false)
                        setCustomValue('')
                      }
                    }}
                    placeholder="Nintendo 64…"
                    className="w-32 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                  />
                  <button
                    type="button"
                    aria-label="Valider la plateforme"
                    onClick={confirmCustomPlatform}
                    className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  >
                    <Check className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Annuler"
                    onClick={() => {
                      setAddingPlatform(false)
                      setCustomValue('')
                    }}
                    className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingPlatform(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed border-border/70 px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  <Plus className="size-3.5" />
                  Autre
                </button>
              )}
            </div>
          </div>

          {/* Note sur 5 + favori */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/40 p-3.5">
            <div className="grid gap-2">
              <Label>Note</Label>
              <div className="flex items-center gap-3">
                <StarRating
                  value={form.rating ?? 0}
                  onChange={(v) => set('rating', v)}
                />
                <span className="font-display text-sm text-muted-foreground">
                  {form.rating !== undefined
                    ? `${formatRating5(form.rating)}/5`
                    : 'Non noté'}
                </span>
                {form.rating !== undefined && (
                  <button
                    type="button"
                    onClick={() => set('rating', undefined)}
                    className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    Effacer
                  </button>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => set('favorite', !form.favorite)}
              aria-pressed={form.favorite}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
                form.favorite
                  ? 'border-primary/60 bg-primary/15 text-foreground'
                  : 'border-border/60 text-muted-foreground hover:text-foreground',
              )}
            >
              <Heart
                className={cn('size-4', form.favorite && 'text-primary')}
                fill={form.favorite ? 'currentColor' : 'none'}
              />
              Favori
            </button>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="review">Critique / journal</Label>
            <Textarea
              id="review"
              value={form.review}
              onChange={(e) => set('review', e.target.value)}
              placeholder="Ce que tu en as pensé…"
              rows={4}
            />
          </div>

          <Button
            type="submit"
            disabled={!canSubmit}
            className="h-12 w-full rounded-xl text-base font-semibold shadow-lg shadow-primary/25"
          >
            {game ? 'Enregistrer' : 'Sauvegarder'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
