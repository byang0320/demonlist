'use client'

import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useState } from 'react'

import type { LevelType } from '@/features/levels/queries'

export function DemonListToggle({
  initialType,
  classicCount,
  platformerCount,
  children,
}: {
  initialType: LevelType
  classicCount: number
  platformerCount: number
  children: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [type, setType] = useState<LevelType>(initialType)
  const isPlatformer = type === 'Platformer'
  const panels = Array.isArray(children) ? children : [children]

  function selectType(nextType: LevelType) {
    setType(nextType)
    router.replace(`${pathname}${nextType === 'Platformer' ? '?type=platformer' : ''}`, {
      scroll: false,
    })
  }

  return (
    <>
      <div className="demonlist-toggle-wrapper">
        <div className="demonlist-toggle">
          <button
            type="button"
            aria-pressed={!isPlatformer}
            onClick={() => selectType('Classic')}
            className={`demonlist-toggle-button ${!isPlatformer ? 'demonlist-toggle-button-active' : 'demonlist-toggle-button-inactive'}`}
          >
            Classic ({classicCount})
          </button>
          <button
            type="button"
            aria-pressed={isPlatformer}
            onClick={() => selectType('Platformer')}
            className={`demonlist-toggle-button demonlist-toggle-button-platformer ${isPlatformer ? 'demonlist-toggle-button-active' : 'demonlist-toggle-button-inactive'}`}
          >
            Platformer ({platformerCount})
          </button>
        </div>
        <p className="demonlist-description" aria-live="polite">
          {isPlatformer
            ? 'All levels on the Platformer Demonlist were rated either Extreme Demon or Insane Demon at the time they were placed.'
            : 'All levels on the Classic Demonlist were rated Extreme Demon at the time they were placed.'}
        </p>
      </div>
      <div hidden={isPlatformer}>{panels[0]}</div>
      <div hidden={!isPlatformer}>{panels[1]}</div>
    </>
  )
}
