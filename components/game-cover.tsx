'use client'

import { useEffect, useState } from 'react'
import { Gamepad2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function GameCover({
  src,
  title,
  className,
}: {
  src?: string
  title: string
  className?: string
}) {
  const [errored, setErrored] = useState(false)

  // Reset error state whenever the source changes so a corrected URL retries.
  useEffect(() => {
    setErrored(false)
  }, [src])

  const showImage = src && src.trim().length > 0 && !errored

  return (
    <div
      className={cn(
        'relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-muted ring-1 ring-border',
        className,
      )}
    >
      {showImage ? (
        // Plain <img> (not next/image) so any external cover URL works
        // without configuring remotePatterns.
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
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted to-card p-2 text-center">
          <Gamepad2 className="size-6 text-muted-foreground/60" />
          <span className="line-clamp-3 text-[11px] font-medium leading-tight text-muted-foreground">
            {title}
          </span>
        </div>
      )}
    </div>
  )
}
