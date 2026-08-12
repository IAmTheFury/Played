'use client'

import { GameCover } from '@/components/game-cover'
import { StatusBadge } from '@/components/status-badge'
import { StarRating, formatRating10 } from '@/components/star-rating'
import { formatGamePlatforms } from '@/lib/platforms'
import type { Game } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Play, Calendar, Library, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  games: Game[]
  onOpen: (game: Game) => void
}

export function HomeView({ games, onOpen }: Props) {
  const currentYear = new Date().getFullYear()

  // 1. CONTINUER - jeux en cours
  const playingGames = games.filter(g => g.status === 'playing')
  const latestPlayingGame = playingGames.length > 0 
    ? playingGames.reduce((latest, current) => 
        (current.updatedAt > latest.updatedAt) ? current : latest
      )
    : null
  const otherPlayingGames = playingGames.filter(g => g !== latestPlayingGame).slice(0, 3)

  // 2. RÉCEMMENT - derniers jeux ajoutés ou modifiés
  const recentGames = [...games]
    .sort((a, b) => Math.max(b.updatedAt, b.createdAt) - Math.max(a.updatedAt, a.createdAt))
    .slice(0, 4)

  // 3. TON ANNÉE - logique adaptative
  const gamesWithPlayedYear = games.filter(g => g.playedYear !== undefined)
  const currentYearGames = gamesWithPlayedYear.filter(g => g.playedYear === currentYear)
  const completedCurrentYearGames = currentYearGames.filter(g => g.status === 'completed')
  const averageRatingCurrentYear = currentYearGames.length > 0
    ? currentYearGames.reduce((sum, g) => sum + (g.rating || 0), 0) / currentYearGames.length
    : null

  // Années des jeux joués
  const playedYears = gamesWithPlayedYear.map(g => g.playedYear!).filter(Boolean)
  const minYear = playedYears.length > 0 ? Math.min(...playedYears) : null
  const maxYear = playedYears.length > 0 ? Math.max(...playedYears) : null

  // Logique adaptative pour "Ton année"
  let yearSectionContent: React.ReactNode = null
  let showYearSection = false

  if (gamesWithPlayedYear.length === 0) {
    // Aucune "année jouée" renseignée → masque la section
    showYearSection = false
  } else if (currentYearGames.length >= 3) {
    // Nombre significatif de jeux de l'année en cours
    showYearSection = true
    yearSectionContent = (
      <div className="space-y-2">
        <h3 className="font-display text-lg font-semibold">Ton année {currentYear}</h3>
        <p className="text-sm text-muted-foreground">
          {currentYearGames.length} jeu{currentYearGames.length > 1 ? 'x' : ''} joué{currentYearGames.length > 1 ? 's' : ''} cette année,
          dont {completedCurrentYearGames.length} terminé{completedCurrentYearGames.length > 1 ? 's' : ''}.
        </p>
      </div>
    )
  } else {
    // Phase de remplissage du backlog (jeux d'années antérieures)
    showYearSection = true
    yearSectionContent = (
      <div className="space-y-2">
        <h3 className="font-display text-lg font-semibold">Ta collection</h3>
        <p className="text-sm text-muted-foreground">
          {games.length} jeu{games.length > 1 ? 'x' : ''}
          {minYear && maxYear ? `, de ${minYear} à ${maxYear}.` : '.'}
        </p>
      </div>
    )
  }

  // 4. TA COLLECTION - aperçu
  const collectionPreview = games.slice(0, 6)

  // État vide
  if (games.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 py-12 text-center">
        <div className="mb-6 rounded-full bg-primary/10 p-6">
          <Library className="size-12 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-semibold mb-3">Ta collection commence ici.</h2>
        <p className="text-muted-foreground mb-8 max-w-sm">
          Ajoute ton premier jeu pour personnaliser cet espace.
        </p>
        <Button 
          size="lg" 
          className="gap-2 px-6"
          onClick={() => {
            // Le bouton "Ajouter" est géré par le parent
            const addButton = document.querySelector('[aria-label="Ajouter un jeu"]') as HTMLButtonElement
            addButton?.click()
          }}
        >
          <span>+</span>
          Ajouter un jeu
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-8">
      {/* 1. TON ANNÉE - maintenant en première position */}
      {showYearSection && (
        <section className="space-y-4">
          <div className="glass rounded-2xl p-5">
            {yearSectionContent}
          </div>
        </section>
      )}

      {/* 2. CONTINUER */}
      {playingGames.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Play className="size-5 text-chart-4" />
            <h2 className="font-display text-xl font-semibold">Continuer</h2>
          </div>
          
          {latestPlayingGame && (
            <div 
              className="glass rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.01] active:scale-95"
              onClick={() => onOpen(latestPlayingGame)}
            >
              <div className="flex gap-4">
                <div className="w-20 shrink-0">
                  <GameCover src={latestPlayingGame.cover} title={latestPlayingGame.title} className="h-full" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <h3 className="font-display text-lg font-semibold leading-tight">
                    {latestPlayingGame.title}
                  </h3>
                  <StatusBadge status={latestPlayingGame.status} className="text-xs px-2 py-0.5 self-start" />
                  {latestPlayingGame.platforms && latestPlayingGame.platforms.length > 0 && (
                    <p className="text-xs text-muted-foreground truncate">
                      {formatGamePlatforms(latestPlayingGame.platforms)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {otherPlayingGames.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 pt-2">
              {otherPlayingGames.map(game => (
                <div
                  key={game.id}
                  className="w-20 shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  onClick={() => onOpen(game)}
                >
                  <GameCover src={game.cover} title={game.title} />
                  <p className="mt-1.5 truncate text-[11px] font-medium">{game.title}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 3. RÉCEMMENT */}
      {recentGames.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="size-5 text-chart-2" />
            <h2 className="font-display text-xl font-semibold">Récemment</h2>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentGames.map(game => (
              <div
                key={game.id}
                className="w-20 shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                onClick={() => onOpen(game)}
              >
                <GameCover src={game.cover} title={game.title} />
                <p className="mt-1.5 truncate text-[11px] font-medium">{game.title}</p>
                <div className="mt-1">
                  <StatusBadge status={game.status} className="text-[10px] px-1 py-0.5" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
