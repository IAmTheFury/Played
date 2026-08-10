'use client'

import { useId } from 'react'
import { Input } from '@/components/ui/input'

/**
 * Saisie libre de la plateforme avec autocomplétion des plateformes déjà
 * enregistrées (ex : "Nintendo GameCube", "Nintendo 64").
 */
export function PlatformField({
  value,
  onChange,
  suggestions,
}: {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
}) {
  const listId = useId()
  return (
    <>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        list={listId}
        placeholder="Ex : Nintendo GameCube, PC, PS5…"
        autoComplete="off"
      />
      <datalist id={listId}>
        {suggestions.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
    </>
  )
}
