'use client'

import { useMemo, useState } from 'react'
import { Check, Heart, Pencil } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { GameCover } from '@/components/game-cover'
import { RatingBadge } from '@/components/star-rating'
import { StatusBadge } from '@/components/status-badge'
import type { Game } from '@/lib/types'
import { cn } from '@/lib/utils'

export function ProfileView({
  games,
  ranking,
  profileName,
  onRename,
  onOpen,
}: {
  games: Game[]
  ranking: string[]
  profileName: string
  onRename: (name: string) => void
  onOpen: (game: Game) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(profileName)

  const byId = useMemo(() => new Map(games.map((g) => [g.id, g])), [games])

  const favorites = games.filter((g) => g.favorite)

  const top = useMemo(() => {
    const ranked = ranking
      .map((id) => byId.get(id))
      .filter((g): g is Game => Boolean(g))
    if (ranked.length > 0) return ranked.slice(0, 4)
    return favorites.slice(0, 4)
  }, [ranking, byId, favorites])

  const recent = useMemo(
    () => [...games].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 6),
    [games],
  )

  const completed = games.filter((g) => g.status === 'completed').length
  const rated = games.filter((g) => g.rating !== undefined)
  const avg =
    rated.length > 0
      ? rated.reduce((s, g) => s + (g.rating ?? 0), 0) / rated.length
      : undefined

  const initial = (profileName.trim()[0] || 'L').toUpperCase()

  function saveName() {
    onRename(draft.trim() || 'Mon profil')
    setEditing(false)
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 font-display text-2xl font-bold text-primary-foreground">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) saveName()
                }}
                autoFocus
                className="h-9"
              />
              <button
                aria-label="Enregistrer le nom"
                onClick={saveName}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              >
                <Check className="size-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setDraft(profileName)
                setEditing(true)
              }}
              className="group flex items-center gap-2"
            >
              <h1 className="truncate font-display text-2xl font-bold">
                {profileName}
              </h1>
              <Pencil className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <Stat label={games.length > 1 ? 'jeux' : 'jeu'} value={games.length} />
            <Stat label={completed > 1 ? 'terminés' : 'terminé'} value={completed} />
            {avg !== undefined && (
              <Stat label="note moy." value={avg.toFixed(1)} />
            )}
          </div>
        </div>
      </header>

      <Section title="Mon top">
        {top.length === 0 ? (
          <EmptyHint text="Ajoute des jeux à ton classement ou marque des favoris pour composer ton top." />
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {top.map((g, i) => (
              <button
                key={g.id}
                onClick={() => onOpen(g)}
                className="group relative flex flex-col gap-1.5 text-left"
              >
                <GameCover
                  src={g.cover}
                  title={g.title}
                  className="transition-transform group-hover:-translate-y-1"
                />
                <span
                  className={cn(
                    'absolute -left-1 -top-2 flex size-6 items-center justify-center rounded-full font-display text-xs font-bold ring-2 ring-background',
                    i === 0
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-foreground',
                  )}
                >
                  {i + 1}
                </span>
                <span className="line-clamp-1 text-xs font-medium">
                  {g.title}
                </span>
              </button>
            ))}
          </div>
        )}
      </Section>

      {favorites.length > 0 && (
        <Section
          title={
            <span className="inline-flex items-center gap-2">
              <Heart className="size-4 text-primary" fill="currentColor" />
              Favoris
            </span>
          }
        >
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
            {favorites.map((g) => (
              <button
                key={g.id}
                onClick={() => onOpen(g)}
                className="w-24 shrink-0"
              >
                <GameCover src={g.cover} title={g.title} />
              </button>
            ))}
          </div>
        </Section>
      )}

      <Section title="Derniers jeux joués">
        {recent.length === 0 ? (
          <EmptyHint text="Rien pour l'instant." />
        ) : (
          <ul className="flex flex-col gap-2">
            {recent.map((g) => (
              <li key={g.id}>
                <button
                  onClick={() => onOpen(g)}
                  className="flex w-full items-center gap-3 rounded-xl border bg-card p-2 pr-3 text-left transition-colors hover:bg-accent"
                >
                  <div className="w-10 shrink-0">
                    <GameCover src={g.cover} title={g.title} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="line-clamp-1 text-sm font-medium">
                      {g.title}
                    </span>
                    <StatusBadge status={g.status} className="self-start" />
                  </div>
                  {g.rating !== undefined && <RatingBadge value={g.rating} />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="font-display text-base font-bold text-foreground">
        {value}
      </span>
      {label}
    </span>
  )
}

function Section({
  title,
  children,
}: {
  title: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  )
}

function EmptyHint({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
      {text}
    </p>
  )
}
