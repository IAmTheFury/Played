'use client'

import { useMemo, useState } from 'react'
import { Home, Library, User, Plus } from 'lucide-react'
import { useLudo, type NewGame } from '@/lib/store'
import type { Game } from '@/lib/types'
import { HomeView } from '@/components/home-view'
import { LibraryView } from '@/components/library-view'
import { RankingView } from '@/components/ranking-view'
import { ProfileView } from '@/components/profile-view'
import { GameFormDialog } from '@/components/game-form-dialog'
import { GameDetailDialog } from '@/components/game-detail-dialog'
import { cn } from '@/lib/utils'

type Tab = 'home' | 'library' | 'profile'

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'library', label: 'Collection', icon: Library },
  { id: 'profile', label: 'Profil', icon: User },
]

export default function Page() {
  const ludo = useLudo()
  const [tab, setTab] = useState<Tab>('home')

  const completedCount = useMemo(
    () => ludo.games.filter((g) => g.status === 'completed').length,
    [ludo.games],
  )

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Game | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)

  const detail = useMemo(
    () => ludo.games.find((g) => g.id === detailId) ?? null,
    [ludo.games, detailId],
  )

  function openAdd() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(game: Game) {
    setDetailId(null)
    setEditing(game)
    setFormOpen(true)
  }

  function handleSubmit(data: NewGame) {
    if (editing) {
      ludo.updateGame(editing.id, data)
    } else {
      ludo.addGame(data)
    }
    setEditing(null)
  }

  function toggleRanking(id: string) {
    if (ludo.ranking.includes(id)) ludo.removeFromRanking(id)
    else ludo.addToRanking(id)
  }

  return (
    <div className="app-gradient min-h-dvh">
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-2.5 backdrop-blur-xl"
          style={{
            borderBottom: '1px solid rgb(255 255 255 / 0.06)',
            background: 'rgb(9 9 11 / 0.72)',
          }}
        >
            <div className="flex items-baseline gap-2">
              <p className="font-display text-base font-semibold tracking-tight">
                PLAYED
              </p>
              <p className="text-xs text-muted-foreground">
              {ludo.games.length} jeu{ludo.games.length > 1 ? 'x' : ''}
              {completedCount > 0 && `, ${completedCount} terminé${completedCount > 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={openAdd}
            aria-label="Ajouter un jeu"
            className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-95"
          >
            <Plus className="size-4" strokeWidth={2.25} />
            Ajouter
          </button>
        </header>

        <main className="flex-1 px-4 py-5 pb-28">
          {!ludo.loaded ? null : tab === 'home' ? (
            <HomeView games={ludo.games} onOpen={(g) => setDetailId(g.id)} />
          ) : tab === 'library' ? (
            <LibraryView games={ludo.games} onOpen={(g) => setDetailId(g.id)} />
          ) : (
            <ProfileView
              games={ludo.games}
              ranking={ludo.ranking}
              profileName={ludo.profileName}
              profileImage={ludo.profileImage}
              onRename={ludo.setProfileName}
              onSetProfileImage={ludo.setProfileImage}
              onSetRanking={ludo.setRanking}
              onImport={ludo.importData}
              onOpen={(g) => setDetailId(g.id)}
            />
          )}
        </main>

        <nav
          className="fixed inset-x-0 bottom-0 z-20 backdrop-blur-xl"
          style={{
            borderTop: '1px solid rgb(255 255 255 / 0.06)',
            background: 'rgb(9 9 11 / 0.82)',
          }}
        >
          <div className="mx-auto flex max-w-2xl items-stretch justify-around px-2 py-2">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = tab === id
              return (
                <button
                  key={id}
                  data-tab={id}
                  onClick={() => setTab(id)}
                  className={cn(
                    'flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5 text-xs font-medium transition-all duration-200 ease-out active:scale-95',
                    active
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon
                    className="size-5"
                    fill={active ? 'currentColor' : 'none'}
                    strokeWidth={active ? 1.5 : 2}
                  />
                  {label}
                </button>
              )
            })}
          </div>
        </nav>
      </div>

      <GameFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        platforms={ludo.platforms}
        game={editing}
        onSubmit={handleSubmit}
        onRemovePlatform={ludo.removePlatform}
      />

      <GameDetailDialog
        game={detail}
        onOpenChange={(open) => {
          if (!open) setDetailId(null)
        }}
        onEdit={openEdit}
        onDelete={ludo.removeGame}
        onToggleFavorite={ludo.toggleFavorite}
        onToggleRanking={toggleRanking}
        inRanking={detail ? ludo.ranking.includes(detail.id) : false}
      />
    </div>
  )
}
