'use client'

import { useEffect, useState } from 'react'
import { Gamepad2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function GameCover({
  src,
  title,
  className,
  bare,
}: {
  src?: string
  title: string
  className?: string
  /** Sans coins arrondis ni ring — pour bannières plein cadre. */
  bare?: boolean
}) {
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    setErrored(false)
  }, [src])

  const showImage = src && src.trim().length > 0 && !errored

  return (
    <div
      className={cn(
        'relative aspect-[3/4] w-full overflow-hidden bg-white/[0.03]',
        !bare && 'rounded-xl cover-ring',
        className,
      )}
    >
      {showImage ? (
        <img
          src={src || '/placeholder.svg'}
          alt={`Jaquette de ${title}`}
          loading="lazy"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-2 text-center">
          <Gamepad2 className="size-6 text-muted-foreground/50" />
          {!bare && (
            <span className="line-clamp-3 text-[11px] font-medium leading-tight text-muted-foreground">
              {title}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
