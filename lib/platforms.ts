/** Plateformes proposées par défaut dans le formulaire. */
export const DEFAULT_PLATFORM_CHIPS = [
  'PC',
  'PS5',
  'Nintendo Switch',
] as const

/** Formate la liste de plateformes d'un jeu pour l'affichage. */
export function formatGamePlatforms(platforms?: string[]): string {
  return platforms?.filter(Boolean).join(', ') ?? ''
}
