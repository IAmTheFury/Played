'use client'

import { useMemo, useState } from 'react'
import { Check, Heart, Pencil } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { GameCover } from '@/components/game-cover'
import { RatingBadge, formatRating10 } from '@/components/star-rating'
import { ShareTopButton, ShareTopModal } from '@/components/share-top-modal'
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
  const [shareOpen, setShareOpen] = useState(false)
  const [bannerErrored, setBannerErrored] = useState(false)

  const byId = useMemo(() => new Map(games.map((g) => [g.id, g])), [games])

  const favorites = useMemo(
    () =>
      games
        .filter((g) => g.favorite)
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)),
    [games],
  )

  const top = useMemo(() => {
    const ranked = ranking
      .map((id) => byId.get(id))
      .filter((g): g is Game => Boolean(g))
    if (ranked.length > 0) return ranked.slice(0, 4)
    return favorites.slice(0, 4)
  }, [ranking, byId, favorites])

  const favoriteSlots = favorites.slice(0, 4)

  const bannerGame = useMemo(() => {
    const rated = games.filter((g) => g.rating !== undefined && g.cover)
    if (rated.length === 0) return top[0] ?? favorites[0] ?? games[0]
    return rated.reduce((best, g) =>
      (g.rating ?? 0) > (best.rating ?? 0) ? g : best,
    )
  }, [games, top, favorites])

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
      {/* Bannière profil */}
      <div className="relative -mx-4 overflow-hidden rounded-2xl">
        <div className="absolute inset-0">
          {bannerGame?.cover && !bannerErrored ? (
            <img
              src={bannerGame.cover}
              alt=""
              aria-hidden
              onError={() => setBannerErrored(true)}
              className="h-full w-full scale-110 object-cover blur-2xl brightness-[0.35] saturate-150"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/20 to-transparent" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#09090b]/60 to-[#09090b]" />
        </div>

        <div className="relative flex items-end gap-4 px-4 pb-5 pt-16">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 font-display text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/25 ring-2 ring-white/10">
            {initial}
          </div>
          <div className="min-w-0 flex-1 pb-0.5">
            {editing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) saveName()
                  }}
                  autoFocus
                  className="glass h-10 border-0"
                />
                <button
                  aria-label="Enregistrer le nom"
                  onClick={saveName}
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform active:scale-95"
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
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <Stat label={games.length > 1 ? 'jeux' : 'jeu'} value={games.length} />
              <Stat
                label={completed > 1 ? 'terminés' : 'terminé'}
                value={completed}
              />
              {avg !== undefined && (
                <Stat label="note moy." value={`${formatRating10(avg)}/10`} />
              )}
            </div>
          </div>
        </div>
      </div>

      <Section title="Mon top">
        {top.length === 0 ? (
          <EmptyHint text="Ajoute des jeux à ton classement ou marque des favoris pour composer ton top." />
        ) : (
          <div className="grid grid-cols-4 gap-2.5">
            {top.map((g, i) => (
              <button
                key={g.id}
                onClick={() => onOpen(g)}
                className="group relative transition-all duration-200 ease-out hover:scale-[1.02] active:scale-95"
              >
                <GameCover
                  src={g.cover}
                  title={g.title}
                  className="transition-transform duration-200 group-hover:-translate-y-0.5"
                />
                <span
                  className={cn(
                    'absolute -left-1 -top-2 flex size-6 items-center justify-center rounded-full font-display text-xs font-bold ring-2 ring-[#09090b]',
                    i === 0
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white/10 text-foreground backdrop-blur-md',
                  )}
                >
                  {i + 1}
                </span>
              </button>
            ))}
          </div>
        )}
        <ShareTopButton
          onClick={() => setShareOpen(true)}
          disabled={top.length === 0}
        />
      </Section>

      <Section title="Derniers jeux joués">
        {recent.length === 0 ? (
          <EmptyHint text="Rien pour l'instant." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {recent.map((g) => (
              <button
                key={g.id}
                onClick={() => onOpen(g)}
                className="glass flex items-stretch gap-3 rounded-xl p-2 text-left transition-all duration-200 ease-out hover:scale-[1.02] active:scale-95"
              >
                <div className="w-16 shrink-0">
                  <GameCover src={g.cover} title={g.title} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                  <div className="flex flex-col gap-1.5">
                    <span className="line-clamp-1 text-sm font-semibold tracking-tight text-foreground">
                      {g.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={g.status} />
                    </div>
                  </div>
                  {g.rating !== undefined && (
                    <div className="self-start">
                      <RatingBadge value={g.rating} />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </Section>

      <ShareTopModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        profileName={profileName}
        top={top}
      />
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
    <p
      className="rounded-xl p-4 text-sm text-muted-foreground"
      style={{
        border: '1px dashed rgb(255 255 255 / 0.1)',
        background: 'rgb(255 255 255 / 0.02)',
      }}
    >
      {text}
    </p>
  )
}
