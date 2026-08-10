export type GameStatus = 'playing' | 'completed' | 'backlog' | 'abandoned'

export type Game = {
  id: string
  title: string
  year?: string
  platform?: string
  cover?: string
  /** Note personnelle sur 10 (par pas de 0,5). undefined = non noté. */
  rating?: number
  review?: string
  favorite: boolean
  status: GameStatus
  createdAt: number
  updatedAt: number
}

export type Ludo = {
  games: Game[]
  /** Ordre du classement personnel (liste d'ids). */
  ranking: string[]
  /** Plateformes déjà saisies, mémorisées pour l'autocomplétion. */
  platforms: string[]
  profileName: string
}

export const STATUS_META: Record<
  GameStatus,
  { label: string; short: string; className: string; dot: string }
> = {
  playing: {
    label: 'En cours',
    short: 'En cours',
    className: 'bg-chart-4/15 text-chart-4 ring-chart-4/30',
    dot: 'bg-chart-4',
  },
  completed: {
    label: 'Terminé',
    short: 'Terminé',
    className: 'bg-chart-2/15 text-chart-2 ring-chart-2/30',
    dot: 'bg-chart-2',
  },
  backlog: {
    label: 'À jouer',
    short: 'À jouer',
    className: 'bg-muted text-muted-foreground ring-border',
    dot: 'bg-muted-foreground',
  },
  abandoned: {
    label: 'Abandonné',
    short: 'Abandonné',
    className: 'bg-chart-3/15 text-chart-3 ring-chart-3/30',
    dot: 'bg-chart-3',
  },
}

export const STATUS_ORDER: GameStatus[] = [
  'playing',
  'completed',
  'backlog',
  'abandoned',
]
