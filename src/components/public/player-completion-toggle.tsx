'use client'

import { usePathname, useRouter } from 'next/navigation'

import type { LevelType } from '@/features/levels/queries'

export function PlayerCompletionToggle({
  initialType,
  classicCount,
  platformerCount,
  sort,
}: {
  initialType: LevelType
  classicCount: number
  platformerCount: number
  sort: 'rank' | 'alphabetical' | 'date'
}) {
  const router = useRouter()
  const pathname = usePathname()
  const isPlatformer = initialType === 'Platformer'

  function selectType(type: LevelType) {
    const params = new URLSearchParams()
    if (type === 'Platformer') {
      params.set('type', 'platformer')
    }
    if (sort === 'alphabetical') {
      params.set('sort', 'alphabetically')
    } else if (sort === 'date') {
      params.set('sort', 'date')
    }
    const query = params.toString()
    router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false })
  }

  return (
    <div className="completion-toggle-section">
      <div className="completion-toggle">
        <button
          type="button"
          aria-pressed={!isPlatformer}
          onClick={() => selectType('Classic')}
          className={`completion-toggle-button ${!isPlatformer ? 'completion-toggle-button-active' : 'completion-toggle-button-inactive'}`}
        >
          Classic ({classicCount})
        </button>
        <button
          type="button"
          aria-pressed={isPlatformer}
          onClick={() => selectType('Platformer')}
          className={`completion-toggle-button completion-toggle-button-platformer ${isPlatformer ? 'completion-toggle-button-active' : 'completion-toggle-button-inactive'}`}
        >
          Platformer ({platformerCount})
        </button>
      </div>
    </div>
  )
}
