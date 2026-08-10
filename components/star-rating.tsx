'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Retourne la note interne sur 10. */
export function formatRating10(value: number) {
  return String(value)
}

/** Affiche une note sous forme de fraction sur 10 (ex : 9 → "9/10"). */
export function formatRatingFraction(value: number) {
  return `${formatRating10(value)}/10`
}

/**
 * Notation en 5 étoiles avec demi-crans. Valeur interne sur 10 (pas de 0,5).
 * Clic gauche/droite d'une étoile = demi / plein.
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
  const gap = size === 'lg' ? 'gap-1.5' : 'gap-0.5'

  return (
    <div
      className={cn('flex items-center', gap)}
      onMouseLeave={() => setHover(null)}
      role={interactive ? 'slider' : 'img'}
      aria-label={`Note : ${formatRating10(value)} sur 10`}
      aria-valuenow={interactive ? value : undefined}
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? 10 : undefined}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const starValue = i * 2
        const filled = display - starValue
        return (
          <div
            key={i}
            className={cn(
              'relative flex items-center justify-center',
              interactive && 'size-11',
            )}
          >
            <div className={cn('relative', px)}>
              <Star
                className={cn(px, 'text-white/20')}
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
            </div>
            {interactive && (
              <>
                <button
                  type="button"
                  aria-label={`Noter ${starValue + 1} sur 10`}
                  className="absolute inset-0 right-1/2 cursor-pointer"
                  onMouseEnter={() => setHover(starValue + 1)}
                  onClick={() => onChange?.(starValue + 1)}
                />
                <button
                  type="button"
                  aria-label={`Noter ${starValue + 2} sur 10`}
                  className="absolute inset-0 left-1/2 cursor-pointer"
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
        'inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 font-display text-xs font-semibold text-foreground backdrop-blur-md',
        className,
      )}
      style={{ border: '1px solid rgb(255 255 255 / 0.1)' }}
    >
      <Star className="size-3 text-primary" fill="currentColor" strokeWidth={0} />
      {formatRatingFraction(value)}
    </span>
  )
}
