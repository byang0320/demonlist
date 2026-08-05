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
    <div className="border-t border-white/10 px-5 pb-5 pt-5 sm:px-8 sm:pb-8 sm:pt-8">
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
    </div>
  )
}
