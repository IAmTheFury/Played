'use client'

import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_PLATFORM_CHIPS } from './platforms'
import type { Game, Ludo } from './types'

const STORAGE_KEY = 'ludo:v1'

interface StoredData {
  version: 1
  data: Ludo
}

const DEFAULT: Ludo = {
  games: [],
  ranking: [],
  platforms: [...DEFAULT_PLATFORM_CHIPS],
  profileName: 'Mon profil',
  profileImage: undefined,
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

function normalizeGame(raw: Game): Game {
  const platforms =
    raw.platforms?.length
      ? raw.platforms
      : raw.platform
        ? [raw.platform]
        : undefined
  const { platform: _legacy, ...rest } = raw
  return platforms ? { ...rest, platforms } : rest
}

function mergePlatforms(existing: string[], incoming?: string[]) {
  if (!incoming?.length) return existing
  const next = [...existing]
  for (const p of incoming) {
    const trimmed = p.trim()
    if (
      trimmed &&
      !next.some((x) => x.toLowerCase() === trimmed.toLowerCase())
    ) {
      next.push(trimmed)
    }
  }
  return next
}

function migrateData(parsed: any): Ludo {
  // Version 1: format actuel (non versionné) ou format versionné
  if (parsed && typeof parsed === 'object') {
    // Si c'est déjà le format versionné
    if ('version' in parsed && parsed.version === 1 && 'data' in parsed) {
      return parsed.data
    }
    // Sinon, c'est l'ancien format (non versionné)
    return {
      games: (parsed.games ?? []).map((g: any) => normalizeGame(g as Game)),
      ranking: parsed.ranking ?? [],
      platforms: parsed.platforms?.length ? parsed.platforms : DEFAULT.platforms,
      profileName: parsed.profileName ?? DEFAULT.profileName,
      profileImage: parsed.profileImage,
    }
  }
  return DEFAULT
}

function validateImportData(data: unknown): Partial<Ludo> | null {
  if (!data || typeof data !== 'object') {
    return null
  }

  const obj = data as Record<string, unknown>
  const result: Partial<Ludo> = {}

  // Valider les jeux
  let validGames: Game[] = []
  if (Array.isArray(obj.games)) {
    validGames = obj.games
      .map((g: unknown) => {
        if (!g || typeof g !== 'object') return null
        const game = g as Record<string, unknown>
        // Validation minimale
        if (typeof game.id !== 'string' || !game.id.trim()) return null
        if (typeof game.title !== 'string' || !game.title.trim()) return null
        // Normaliser le jeu
        return normalizeGame(game as Game)
      })
      .filter((g): g is Game => g !== null)
    
    result.games = validGames
  }

  // Valider le ranking
  if (Array.isArray(obj.ranking)) {
    const validGameIds = new Set(validGames.map(g => g.id))
    const rankingIds = obj.ranking.filter((id: unknown) => typeof id === 'string' && id.trim())
    
    // Vérifier que tous les IDs du ranking référencent des jeux valides
    const invalidReferences = rankingIds.filter(id => !validGameIds.has(id as string))
    
    // Si le ranking contient des références invalides, rejeter l'import entier
    if (invalidReferences.length > 0) {
      return null
    }
    
    result.ranking = rankingIds
  }

  // Valider les plateformes
  if (Array.isArray(obj.platforms)) {
    result.platforms = obj.platforms.filter((p: unknown) => typeof p === 'string' && p.trim())
  }

  // Valider le nom de profil
  if (typeof obj.profileName === 'string' && obj.profileName.trim()) {
    result.profileName = obj.profileName.trim()
  }

  // Valider l'image de profil
  if (typeof obj.profileImage === 'string' || obj.profileImage === undefined) {
    result.profileImage = obj.profileImage
  }

  return result
}

function load(): Ludo {
  if (typeof window === 'undefined') return DEFAULT
  
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT
    
    const parsed = JSON.parse(raw)
    const migrated = migrateData(parsed)
    
    // Vérifier que les données migrées sont valides
    if (migrated && typeof migrated === 'object') {
      return migrated
    }
    
    // Si les données migrées sont invalides, conserver DEFAULT
    // mais NE PAS écraser le localStorage avec DEFAULT
    return DEFAULT
  } catch {
    // En cas d'erreur, ne pas écraser les données existantes
    // Retourner DEFAULT mais le localStorage conserve ses données
    return DEFAULT
  }
}

export type NewGame = Omit<Game, 'id' | 'createdAt' | 'updatedAt'>

export function useLudo() {
  const [data, setData] = useState<Ludo>(DEFAULT)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setData(load())
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      const storedData: StoredData = {
        version: 1,
        data
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData))
    } catch {
      // ignore quota errors
    }
  }, [data, loaded])

  const addGame = useCallback((game: NewGame) => {
    const now = Date.now()
    const full: Game = normalizeGame({
      ...game,
      id: uid(),
      createdAt: now,
      updatedAt: now,
    })
    setData((d) => ({
      ...d,
      games: [full, ...d.games],
      platforms: mergePlatforms(d.platforms, full.platforms),
    }))
    return full.id
  }, [])

  const updateGame = useCallback((id: string, patch: Partial<NewGame>) => {
    setData((d) => {
      const platforms = mergePlatforms(d.platforms, patch.platforms)
      return {
        ...d,
        platforms,
        games: d.games.map((g) =>
          g.id === id
            ? normalizeGame({
                ...g,
                ...patch,
                updatedAt: Date.now(),
              })
            : g,
        ),
      }
    })
  }, [])

  const removeGame = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      games: d.games.filter((g) => g.id !== id),
      ranking: d.ranking.filter((x) => x !== id),
    }))
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      games: d.games.map((g) =>
        g.id === id
          ? { ...g, favorite: !g.favorite, updatedAt: Date.now() }
          : g,
      ),
    }))
  }, [])

  const setRanking = useCallback((ranking: string[]) => {
    setData((d) => ({ ...d, ranking }))
  }, [])

  const moveInRanking = useCallback((id: string, dir: -1 | 1) => {
    setData((d) => {
      const idx = d.ranking.indexOf(id)
      if (idx === -1) return d
      const next = idx + dir
      if (next < 0 || next >= d.ranking.length) return d
      const ranking = [...d.ranking]
      ;[ranking[idx], ranking[next]] = [ranking[next], ranking[idx]]
      return { ...d, ranking }
    })
  }, [])

  const addToRanking = useCallback((id: string) => {
    setData((d) =>
      d.ranking.includes(id)
        ? d
        : { ...d, ranking: [...d.ranking, id] },
    )
  }, [])

  const removeFromRanking = useCallback((id: string) => {
    setData((d) => ({ ...d, ranking: d.ranking.filter((x) => x !== id) }))
  }, [])

  const setProfileName = useCallback((profileName: string) => {
    setData((d) => ({ ...d, profileName }))
  }, [])

  const removePlatform = useCallback((platform: string) => {
    setData((d) => ({
      ...d,
      platforms: d.platforms.filter((p) => p !== platform),
    }))
  }, [])

  const setProfileImage = useCallback((profileImage?: string) => {
    setData((d) => ({ ...d, profileImage }))
  }, [])

  const importData = useCallback((incoming: unknown) => {
    const validated = validateImportData(incoming)
    if (!validated) {
      throw new Error('Impossible d\'importer cette bibliothèque. Le fichier semble invalide ou incompatible.')
    }
    setData((d) => ({
      ...d,
      ...validated,
      // Ensure arrays are merged or overwritten correctly
      games: validated.games ?? d.games,
      ranking: validated.ranking ?? d.ranking,
      platforms: mergePlatforms(d.platforms, validated.platforms),
      profileName: validated.profileName ?? d.profileName,
      profileImage: validated.profileImage ?? d.profileImage,
    }))
  }, [])

  return {
    ...data,
    loaded,
    addGame,
    updateGame,
    removeGame,
    toggleFavorite,
    setRanking,
    moveInRanking,
    addToRanking,
    removeFromRanking,
    setProfileName,
    removePlatform,
    setProfileImage,
    importData,
  }
}
