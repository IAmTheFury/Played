'use client'

import { useMemo, useState, useRef, useCallback } from 'react'
import { Check, Heart, Pencil, Download, Upload, Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Reorder } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { GameCover } from '@/components/game-cover'
import { RatingBadge, formatRating10 } from '@/components/star-rating'
import { ShareTopButton, ShareTopModal } from '@/components/share-top-modal'
import { StatusBadge } from '@/components/status-badge'
import type { Game, Ludo } from '@/lib/types'
import { cn, getCroppedImgDataURL } from '@/lib/utils'
import Cropper from 'react-easy-crop'

export function ProfileView({
  games,
  ranking,
  profileName,
  profileImage,
  onRename,
  onSetProfileImage,
  onSetRanking,
  onImport,
  onOpen,
}: {
  games: Game[]
  ranking: string[]
  profileName: string
  profileImage?: string
  onRename: (name: string) => void
  onSetProfileImage: (image?: string) => void
  onSetRanking: (ranking: string[]) => void
  onImport: (data: Partial<Ludo>) => void
  onOpen: (game: Game) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(profileName)
  const [shareOpen, setShareOpen] = useState(false)
  const [bannerErrored, setBannerErrored] = useState(false)

  // Profile Image State
  const [cropOpen, setCropOpen] = useState(false)
  const [tempImage, setTempImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [minZoom, setMinZoom] = useState(0.5)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null)

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
    () => {
      // Prendre les jeux terminés ou notés (qui ont une expérience de jeu)
      const gamesWithExperience = games.filter(g => 
        g.status === 'completed' || g.rating !== undefined
      )
      
      // Si aucun jeu n'a d'expérience, retourner tableau vide
      if (gamesWithExperience.length === 0) return []
      
      // Trier par année jouée (playedYear) décroissante, puis par date d'ajout (createdAt) décroissante
      return [...gamesWithExperience]
        .sort((a, b) => {
          // Priorité 1: année jouée (playedYear) - la plus récente d'abord
          const yearA = a.playedYear ?? 0
          const yearB = b.playedYear ?? 0
          if (yearB !== yearA) return yearB - yearA
          
          // Si même année jouée: trier par date d'ajout (createdAt) - la plus récente d'abord
          return b.createdAt - a.createdAt
        })
        .slice(0, 6)
    },
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

  // Import / Export Logic
  function handleExport() {
    const data = {
      games,
      ranking,
      profileName,
      profileImage,
      platforms: Array.from(new Set(games.flatMap(g => g.platforms || [])))
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `played-profile-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        onImport(data)
      } catch (err) {
        if (err instanceof Error && err.message.includes('Impossible d\'importer')) {
          alert(err.message)
        } else {
          alert("Erreur lors de l'importation du fichier. Le fichier semble invalide ou incompatible.")
        }
      }
    }
    reader.readAsText(file)
  }

  // Profile Image Logic
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setTempImage(event.target?.result as string)
      setZoom(1)
      setCrop({ x: 0, y: 0 })
      setCroppedAreaPixels(null)
      setCropOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  async function handleSaveCrop() {
    if (!tempImage || !croppedAreaPixels) return

    try {
      const croppedDataUrl = await getCroppedImgDataURL(tempImage, croppedAreaPixels, 400)
      onSetProfileImage(croppedDataUrl)
      setCropOpen(false)
    } catch (error) {
      console.error('Error cropping image:', error)
      alert("Une erreur s'est produite lors du rognage de l'image.")
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Bannière profil */}
      <div className="relative -mx-4 overflow-hidden rounded-b-2xl">
        <div className="absolute inset-0">
          {profileImage && !bannerErrored ? (
            <img
              src={profileImage}
              alt=""
              aria-hidden
              onError={() => setBannerErrored(true)}
              className="h-full w-full scale-110 object-cover blur-2xl brightness-[0.35] saturate-150"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/20 to-transparent" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#09090b]/80 to-[#09090b]" />
        </div>

        <div className="relative flex items-end gap-4 px-4 pb-5 pt-24">
          <div 
            className="group relative flex size-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 font-display text-3xl font-bold text-primary-foreground shadow-lg shadow-primary/25 ring-2 ring-white/10 overflow-hidden cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {profileImage ? (
              <img src={profileImage} alt="" className="h-full w-full object-cover" />
            ) : (
              initial
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Plus className="size-8 text-white" />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
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
            </div>
          </div>
        </div>
      </div>

      <Section 
        title={
          <div className="flex items-center justify-between w-full">
            <span>Mon top</span>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon-sm" 
                onClick={handleExport}
                title="Exporter les données"
                className="h-7 w-7 text-muted-foreground"
              >
                <Download className="size-4" />
              </Button>
              <label className="cursor-pointer">
                <div className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent text-muted-foreground">
                  <Upload className="size-4" />
                </div>
                <input type="file" className="hidden" accept=".json" onChange={handleImport} />
              </label>
            </div>
          </div>
        }
      >
        {top.length === 0 ? (
          <EmptyHint text="Ajoute des jeux à ton classement ou marque des favoris pour composer ton top." />
        ) : (
          <Reorder.Group
            axis="x"
            values={top}
            onReorder={(newTop) => {
              onSetRanking(newTop.map(g => g.id))
            }}
            className="grid grid-cols-4 gap-2.5"
            as="div"
          >
            {top.map((g, i) => (
              <Reorder.Item
                key={g.id}
                value={g}
                as="div"
                className="relative cursor-grab active:cursor-grabbing select-none"
              >
                <button
                  onClick={() => onOpen(g)}
                  className="group relative w-full transition-all duration-200 ease-out hover:scale-[1.02] active:scale-95"
                >
                  <GameCover
                    src={g.cover}
                    title={g.title}
                    className="transition-transform duration-200 group-hover:-translate-y-0.5 pointer-events-none select-none"
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
              </Reorder.Item>
            ))}
          </Reorder.Group>
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
                      <div className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 border border-white/10 backdrop-blur-md">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => {
                            const starValue = g.rating! / 2
                            const filled = i <= starValue
                            const halfFilled = i === Math.ceil(starValue) && starValue % 1 > 0.3
                            
                            return (
                              <div key={i} className="relative size-2.5">
                                {/* Fond vide */}
                                <div className="absolute inset-0">
                                  <div className={cn(
                                    "size-2.5 rounded-[0.5px]",
                                    "bg-white/20"
                                  )} />
                                </div>
                                {/* Partie remplie */}
                                {filled && (
                                  <div className="absolute inset-0">
                                    <div className="size-2.5 rounded-[0.5px] bg-primary" />
                                  </div>
                                )}
                                {/* Demi-carré avec séparation claire */}
                                {halfFilled && (
                                  <>
                                    <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                                      <div className="size-2.5 rounded-[0.5px] bg-primary" />
                                    </div>
                                    {/* Ligne de séparation */}
                                    <div className="absolute inset-0 left-1/2 w-[0.5px] bg-white/40" />
                                  </>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        <span className="text-[10px] font-bold tracking-tight text-white min-w-[12px] text-center ml-0.5">
                          {g.rating}
                        </span>
                      </div>
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

      <Dialog open={cropOpen} onOpenChange={setCropOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800">
          <DialogHeader>
            <DialogTitle>Ajuster la photo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="relative w-64 h-64 bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
              {tempImage && (
                <Cropper
                  image={tempImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="rect"
                  minZoom={1}
                  maxZoom={3}
                  restrictPosition={true}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  showGrid={false}
                  classes={{
                    containerClassName: "rounded-2xl",
                    cropAreaClassName: "rounded-2xl",
                    mediaClassName: "rounded-2xl"
                  }}
                />
              )}
            </div>
            
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Zoom</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="1"
                max="3" 
                step="0.01" 
                value={zoom} 
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setCropOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveCrop} disabled={!croppedAreaPixels}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
