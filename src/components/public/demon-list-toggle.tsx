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
      <div className="mb-6">
        <div className="flex w-full overflow-hidden rounded-2xl border border-[#ae9dff]/35 bg-[#111725] text-sm font-semibold text-[#b9c2d8]">
          <button
            type="button"
            aria-pressed={!isPlatformer}
            onClick={() => selectType('Classic')}
            className={`min-h-12 flex-1 px-4 py-3 transition focus-visible:z-10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25 ${!isPlatformer ? 'bg-[#9c8cff]/20 text-white' : 'hover:bg-white/[0.04] hover:text-white'} cursor-pointer`}
          >
            Classic ({classicCount})
          </button>
          <button
            type="button"
            aria-pressed={isPlatformer}
            onClick={() => selectType('Platformer')}
            className={`min-h-12 flex-1 border-l border-[#ae9dff]/35 px-4 py-3 transition focus-visible:z-10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25 ${isPlatformer ? 'bg-[#9c8cff]/20 text-white' : 'hover:bg-white/[0.04] hover:text-white'} cursor-pointer`}
          >
            Platformer ({platformerCount})
          </button>
        </div>
        <p className="mt-2 text-sm leading-6 text-[#8c97b2]" aria-live="polite">
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
