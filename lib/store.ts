'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Game, Ludo } from './types'

const STORAGE_KEY = 'ludo:v1'

const DEFAULT: Ludo = {
  games: [],
  ranking: [],
  platforms: [
    'PC',
    'PlayStation 5',
    'Nintendo Switch',
    'Nintendo GameCube',
    'Nintendo 64',
  ],
  profileName: 'Mon profil',
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

function load(): Ludo {
  if (typeof window === 'undefined') return DEFAULT
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT
    const parsed = JSON.parse(raw) as Partial<Ludo>
    return {
      games: parsed.games ?? [],
      ranking: parsed.ranking ?? [],
      platforms: parsed.platforms?.length ? parsed.platforms : DEFAULT.platforms,
      profileName: parsed.profileName ?? DEFAULT.profileName,
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

  const rememberPlatform = useCallback((platform?: string) => {
    setData((d) => {
      const p = platform?.trim()
      if (!p || d.platforms.some((x) => x.toLowerCase() === p.toLowerCase())) {
        return d
      }
      return { ...d, platforms: [...d.platforms, p] }
    })
  }, [])

  const addGame = useCallback((game: NewGame) => {
    const now = Date.now()
    const full: Game = { ...game, id: uid(), createdAt: now, updatedAt: now }
    setData((d) => {
      const platforms =
        full.platform &&
        !d.platforms.some((x) => x.toLowerCase() === full.platform!.toLowerCase())
          ? [...d.platforms, full.platform]
          : d.platforms
      return { ...d, games: [full, ...d.games], platforms }
    })
    return full.id
  }, [])

  const updateGame = useCallback((id: string, patch: Partial<NewGame>) => {
    setData((d) => {
      const platforms =
        patch.platform &&
        !d.platforms.some(
          (x) => x.toLowerCase() === patch.platform!.toLowerCase(),
        )
          ? [...d.platforms, patch.platform]
          : d.platforms
      return {
        ...d,
        platforms,
        games: d.games.map((g) =>
          g.id === id ? { ...g, ...patch, updatedAt: Date.now() } : g,
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

  return {
    ...data,
    loaded,
    addGame,
    updateGame,
    removeGame,
    toggleFavorite,
    rememberPlatform,
    setRanking,
    moveInRanking,
    addToRanking,
    removeFromRanking,
    setProfileName,
  }
}
