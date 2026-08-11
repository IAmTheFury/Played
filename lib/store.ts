'use client'

import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_PLATFORM_CHIPS } from './platforms'
import type { Game, Ludo } from './types'

const STORAGE_KEY = 'ludo:v1'

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

function load(): Ludo {
  if (typeof window === 'undefined') return DEFAULT
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT
    const parsed = JSON.parse(raw) as Partial<Ludo>
    return {
      games: (parsed.games ?? []).map((g) => normalizeGame(g as Game)),
      ranking: parsed.ranking ?? [],
      platforms: parsed.platforms?.length ? parsed.platforms : DEFAULT.platforms,
      profileName: parsed.profileName ?? DEFAULT.profileName,
      profileImage: parsed.profileImage,
    }
  } catch {
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
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
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

  const importData = useCallback((incoming: Partial<Ludo>) => {
    setData((d) => ({
      ...d,
      ...incoming,
      // Ensure arrays are merged or overwritten correctly
      games: incoming.games ?? d.games,
      ranking: incoming.ranking ?? d.ranking,
      platforms: mergePlatforms(d.platforms, incoming.platforms),
      profileName: incoming.profileName ?? d.profileName,
      profileImage: incoming.profileImage ?? d.profileImage,
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
