import Link from 'next/link'

type LevelListStats = {
  totalCompletions: number
  demotedCompletions: number
  unratedCompletions: number
  totalUniqueLevels: number
  demotedUniqueLevels: number
  unratedUniqueLevels: number
  hardestLevel: {
    name: string
    slug: string
    rank: number
    players: string[]
  } | null
}

type LevelListSummaryProps = {
  title: string
  href: string
  stats: LevelListStats
}

function StatAnnotations({ demoted, unrated }: { demoted: number; unrated: number }) {
  return (
    <span className="flex flex-col text-xs font-medium leading-5 text-[#69738e]">
      <span>(+{demoted} demoted)</span>
      <span>(+{unrated} unrated)</span>
    </span>
  )
}

export function LevelListSummary({ title, href, stats }: LevelListSummaryProps) {
  const hardestLevelContent = stats.hardestLevel ? (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.10em] text-[#8c97b2]">
        Hardest level
      </p>
      <p className="mt-3 truncate text-2xl font-bold tracking-[-0.02em]">
        {stats.hardestLevel.name}
      </p>
      <p className="mt-2 text-sm text-[#8c97b2]">
        Completed by: {stats.hardestLevel.players.length > 0 ? stats.hardestLevel.players.join(', ') : 'No players yet'}
      </p>
    </>
  ) : (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.10em] text-[#8c97b2]">
        Hardest level
      </p>
      <p className="mt-3 text-xl font-bold text-[#59627b]">No levels yet</p>
    </>
  )

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#111725]/80">
      <div className="flex items-center justify-between gap-3 p-5 pb-4 sm:p-6 sm:pb-5">
        <h2 className="m-0 text-2xl font-bold">{title}</h2>
        <Link
          href={href}
          className="inline-flex min-h-10 shrink-0 items-center rounded-xl bg-[#9c8cff] px-4 text-sm font-bold text-[#0b0d18] no-underline transition hover:bg-[#c6beff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/30"
        >
          Check it out <span className="ml-2" aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 border-t border-white/10">
        <div className="p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.10em] text-[#8c97b2]">Total</p>
          <div className="mt-3 flex items-center gap-2">
            <p className="m-0 text-4xl font-bold tracking-[-0.06em] text-white">
              {stats.totalCompletions}
            </p>
            <StatAnnotations
              demoted={stats.demotedCompletions}
              unrated={stats.unratedCompletions}
            />
          </div>
          <p className="mt-2 text-sm text-[#8c97b2]">Completions</p>
        </div>
        <div className="border-l border-white/10 p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.10em] text-[#8c97b2]">Unique</p>
          <div className="mt-3 flex items-center gap-2">
            <p className="m-0 text-4xl font-bold tracking-[-0.06em] text-white">
              {stats.totalUniqueLevels}
            </p>
            <StatAnnotations
              demoted={stats.demotedUniqueLevels}
              unrated={stats.unratedUniqueLevels}
            />
          </div>
          <p className="mt-2 text-sm text-[#8c97b2]">Levels</p>
        </div>
      </div>

      {stats.hardestLevel ? (
        <Link
          href={`/levels/${stats.hardestLevel.slug}`}
          className="block border-t border-white/10 p-5 text-white no-underline transition hover:bg-[#171e35] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#9c8cff]/25 sm:p-6"
        >
          {hardestLevelContent}
        </Link>
      ) : (
        <div className="border-t border-white/10 p-5 sm:p-6">{hardestLevelContent}</div>
      )}
    </article>
  )
}
