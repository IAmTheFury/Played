'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Convertit une note interne sur 10 en affichage sur 5 (ex : 9 -> "4.5"). */
export function formatRating5(value: number) {
  const v = value / 2
  return Number.isInteger(v) ? String(v) : v.toFixed(1)
}

/**
 * Notation affichée en 5 étoiles avec demi-crans. La valeur est stockée sur 10
 * (chaque étoile = 2 points), mais l'affichage se fait sur 5. Interactive quand
 * `onChange` est fourni.
 */
export function StarRating({
  value = 0,
  onChange,
  size = 'md',
}: {
  value?: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
}) {
  const [hover, setHover] = useState<number | null>(null)
  const display = hover ?? value
  const interactive = Boolean(onChange)

  const px = size === 'lg' ? 'size-8' : size === 'sm' ? 'size-3.5' : 'size-5'
  const gap = size === 'lg' ? 'gap-1.5' : 'gap-1'

  return (
    <div
      className={cn('flex items-center', gap)}
      onMouseLeave={() => setHover(null)}
      role={interactive ? 'slider' : 'img'}
      aria-label={`Note : ${formatRating5(value)} sur 5`}
      aria-valuenow={interactive ? value / 2 : undefined}
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? 5 : undefined}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const starValue = i * 2
        const filled = display - starValue
        return (
          <div key={i} className={cn('relative', px)}>
            <Star
              className={cn(px, 'text-muted-foreground/25')}
              fill="currentColor"
              strokeWidth={0}
            />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                width: `${Math.max(0, Math.min(1, filled / 2)) * 100}%`,
              }}
            >
              <Star
                className={cn(px, 'text-primary')}
                fill="currentColor"
                strokeWidth={0}
              />
            </div>
            {interactive && (
              <>
                <button
                  type="button"
                  aria-label={`Noter ${(starValue + 1) / 2} sur 5`}
                  className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
                  onMouseEnter={() => setHover(starValue + 1)}
                  onClick={() => onChange?.(starValue + 1)}
                />
                <button
                  type="button"
                  aria-label={`Noter ${(starValue + 2) / 2} sur 5`}
                  className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
                  onMouseEnter={() => setHover(starValue + 2)}
                  onClick={() => onChange?.(starValue + 2)}
                />
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function RatingBadge({
  value,
  className,
}: {
  value?: number
  className?: string
}) {
  if (value === undefined) return null
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-background/70 px-2 py-0.5 font-display text-xs font-semibold text-foreground ring-1 ring-border/60 backdrop-blur-md',
        className,
      )}
    >
      <Star className="size-3 text-primary" fill="currentColor" strokeWidth={0} />
      {formatRating5(value)}
    </span>
  )
}
