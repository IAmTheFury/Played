import { STATUS_META, type GameStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

export function StatusBadge({
  status,
  className,
}: {
  status: GameStatus
  className?: string
}) {
  const meta = STATUS_META[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset',
        meta.className,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', meta.dot)} />
      {meta.short}
    </span>
  )
}
