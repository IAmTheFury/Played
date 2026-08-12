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
import { StarRating, formatRating10 } from '@/components/star-rating'
import { GameCover } from '@/components/game-cover'
import { DEFAULT_PLATFORM_CHIPS } from '@/lib/platforms'
import { STATUS_META, STATUS_ORDER, type Game } from '@/lib/types'
import type { NewGame } from '@/lib/store'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  platforms: string[]
  game?: Game | null
  onSubmit: (game: NewGame) => void
  onRemovePlatform?: (p: string) => void
}

const empty: NewGame = {
  title: '',
  platforms: [],
  cover: '',
  rating: undefined,
  review: '',
  favorite: false,
  status: 'backlog',
  playedYear: new Date().getFullYear(),
}

export function GameFormDialog({
  open,
  onOpenChange,
  platforms,
  game,
  onSubmit,
  onRemovePlatform,
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
              platforms: game.platforms ?? [],
              cover: game.cover ?? '',
              rating: game.rating,
              review: game.review ?? '',
              favorite: game.favorite,
              status: game.status,
              playedYear: game.playedYear,
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

  // Génère les années de 1990 à l'année en cours
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from(
    { length: currentYear - 1990 + 1 },
    (_, i) => currentYear - i
  )

  const platformChips = Array.from(
    new Set([
      ...DEFAULT_PLATFORM_CHIPS,
      ...platforms,
      ...customPlatforms,
      ...(form.platforms ?? []),
    ]),
  )

  function togglePlatform(p: string) {
    const selected = form.platforms ?? []
    set(
      'platforms',
      selected.includes(p)
        ? selected.filter((x) => x !== p)
        : [...selected, p],
    )
  }

  function confirmCustomPlatform() {
    const v = customValue.trim()
    if (v) {
      setCustomPlatforms((list) =>
        list.some((x) => x.toLowerCase() === v.toLowerCase()) ? list : [...list, v],
      )
      const selected = form.platforms ?? []
      if (!selected.includes(v)) set('platforms', [...selected, v])
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
      platforms: form.platforms?.length ? form.platforms : undefined,
      cover: form.cover?.trim() || undefined,
      review: form.review?.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-h-[92vh] gap-0 overflow-y-auto rounded-2xl border-0 p-0 sm:max-w-lg">
        <DialogHeader className="px-5 pb-3 pt-5 text-left">
          <DialogTitle className="font-display text-xl tracking-tight">
            {game ? 'Modifier le jeu' : 'Ajouter un jeu'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
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
                  className="glass border-0"
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
                  className="glass border-0"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Statut</Label>
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
              {STATUS_ORDER.map((s) => {
                const active = form.status === s
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set('status', s)}
                    className={cn(
                      'chip flex shrink-0 items-center gap-2 px-4',
                      active
                        ? 'chip-active'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <span
                      className={cn('size-2 shrink-0 rounded-full', STATUS_META[s].dot)}
                    />
                    {STATUS_META[s].short}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Plateforme</Label>
            <div className="flex flex-wrap gap-2">
              {platformChips.map((p) => {
                const active = (form.platforms ?? []).includes(p)
                const isDefault = (DEFAULT_PLATFORM_CHIPS as readonly string[]).includes(p)
                
                return (
                  <div key={p} className="group relative">
                    <button
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={cn(
                        'chip pr-3',
                        active
                          ? 'chip-active'
                          : 'text-muted-foreground hover:text-foreground',
                        !isDefault && 'group-hover:pr-8'
                      )}
                    >
                      {p}
                    </button>
                    {!isDefault && onRemovePlatform && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemovePlatform(p)
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/0 hover:text-destructive group-hover:text-muted-foreground/60 transition-all"
                        aria-label={`Supprimer ${p}`}
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>
                )
              })}

              {addingPlatform ? (
                <span className="chip chip-active inline-flex items-center gap-1 py-1 pl-3 pr-1">
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
                    placeholder="Custom…"
                    className="w-28 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                  />
                  <button
                    type="button"
                    aria-label="Valider la plateforme"
                    onClick={confirmCustomPlatform}
                    className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95"
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
                    className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingPlatform(true)}
                  className="chip inline-flex items-center gap-1 border-dashed text-muted-foreground hover:text-foreground"
                >
                  <Plus className="size-3.5" />
                  Custom
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Année jouée</Label>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1">
                <select
                  value={form.playedYear !== undefined ? form.playedYear.toString() : ''}
                  onChange={(e) => {
                    const value = e.target.value
                    set('playedYear', value === '' ? undefined : parseInt(value, 10))
                  }}
                  className="glass w-full cursor-pointer appearance-none rounded-lg border-0 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground bg-transparent"
                >
                  <option value="" className="bg-card text-foreground">Je ne sais plus</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year} className="bg-card text-foreground hover:bg-accent">
                      {year}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                  <svg
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Laisse vide si tu ne te souviens plus
              </div>
            </div>
          </div>

          <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-xl p-3.5">
            <div className="grid gap-2">
              <Label>Note</Label>
              <div className="flex flex-wrap items-center gap-3">
                <StarRating
                  value={form.rating ?? 0}
                  onChange={(v) => set('rating', v)}
                />
                <span className="font-display text-sm text-muted-foreground">
                  {form.rating !== undefined
                    ? `${formatRating10(form.rating)}/10`
                    : 'Non noté'}
                </span>
                {form.rating !== undefined && (
                  <button
                    type="button"
                    onClick={() => set('rating', undefined)}
                    className="min-h-11 text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
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
                'chip inline-flex items-center gap-2',
                form.favorite
                  ? 'chip-active'
                  : 'text-muted-foreground hover:text-foreground',
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
              className="glass border-0"
            />
          </div>

          <Button
            type="submit"
            disabled={!canSubmit}
            className="h-12 w-full rounded-xl text-base font-semibold shadow-lg shadow-primary/20 transition-all duration-200 ease-out hover:scale-[1.01] active:scale-95"
          >
            {game ? 'Enregistrer' : 'Sauvegarder'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
