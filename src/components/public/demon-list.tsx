import Link from 'next/link'

import { listRankedLevels, type LevelType } from '@/features/levels/queries'

function LevelPlaceholder() {
  return (
    <svg
      aria-hidden="true"
      className="h-8 w-8"
      viewBox="0 0 48 48"
      fill="none"
    >
      <path
        d="M24 5 40.5 14.5v19L24 43 7.5 33.5v-19L24 5Z"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="m15 18 9-5 9 5-9 5-9-5Zm0 7 9 5 9-5M15 25v7l9 5 9-5v-7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export async function DemonList({ title, type }: { title: string; type: LevelType }) {
  const levels = await listRankedLevels(type)

  return (
    <main className="min-h-screen bg-[#080b14] bg-[radial-gradient(circle_at_15%_0%,rgba(109,90,218,0.2),transparent_32rem)] px-3 py-6 text-[#f4f6ff] sm:px-5 sm:py-12">
      <div className="mx-auto w-full max-w-280">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#b9c2d8] no-underline transition hover:text-[#c6beff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25"
        >
          <span aria-hidden="true">←</span> Back Home
        </Link>
        <header className="flex flex-col items-start justify-between gap-5 pb-6 pt-4 sm:flex-row sm:items-end sm:gap-8 sm:pb-9">
          <div>
            <h1 className="text-5xl font-bold leading-[0.95] sm:text-7xl">{title}</h1>
          </div>
          <p className="mb-1 flex-1 text-sm text-[#8c97b2] sm:flex-none sm:text-right">
            <span className="mr-1 text-4xl font-bold tracking-[-0.05em] text-white sm:block">
              {levels.length}
            </span>{' '}
            {levels.length === 1 ? `placed ${type} level` : `placed ${type} levels`}
          </p>
        </header>

        {levels.length === 0 ? (
          <div className="grid min-h-64 place-items-center content-center gap-2 rounded-2xl border border-dashed border-white/10 text-center text-[#8c97b2]">
            <div className="text-[#c6beff]">
              <LevelPlaceholder />
            </div>
            <h2 className="m-0 text-lg font-semibold text-white">No ranked levels yet</h2>
            <p className="m-0">The list will appear here once levels have been added.</p>
          </div>
        ) : (
          <ol className="m-0 grid list-none gap-3 p-0" aria-label="Ranked demon levels">
            {levels.map((level) => (
              <li key={level.id}>
                <Link
                  className="group grid min-h-22 grid-cols-[3.4rem_minmax(0,1fr)_3.5rem_1.25rem] items-center overflow-hidden rounded-[1.1rem] border border-white/10 bg-gradient-to-br from-[#141b2d]/98 to-[#0f1422]/98 text-inherit no-underline transition duration-150 hover:-translate-y-0.5 hover:border-[#ae9dff]/60 hover:from-[#1d223e]/98 hover:to-[#12182b]/98 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25 sm:min-h-26 sm:grid-cols-[4.5rem_minmax(0,1fr)_5rem_1.5rem]"
                  href={`/levels/${level.slug}`}
                  aria-label={`Rank ${level.rank}: ${level.name}`}
                >
                  <span className="pl-4 text-[1.3rem] font-extrabold tracking-[-0.06em] text-[#c6beff] sm:pl-6 sm:text-[1.65rem]">
                    {level.rank}
                  </span>
                  <span className="min-w-0 py-4 pr-3">
                    {(level.demoted || level.unrated) && (
                      <span className="mb-1 flex flex-wrap gap-1 text-[0.62rem] font-bold uppercase tracking-[0.04em]">
                        {level.demoted && (
                          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-red-300">
                            Demoted
                          </span>
                        )}
                        {level.unrated && (
                          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-red-300">
                            Unrated
                          </span>
                        )}
                      </span>
                    )}
                    <span className="block truncate text-base font-bold sm:text-[1.05rem]">
                      {level.name}
                    </span>
                    <span className="mt-1 block truncate text-[0.84rem] text-[#b9c2d8]">
                      by {level.publishedBy}
                    </span>
                    <span className="mt-2 block truncate text-[0.7rem] uppercase tracking-[0.04em] text-[#8c97b2]">
                      {level._count.completions}{' '}
                      {level._count.completions === 1 ? 'completion' : 'completions'}
                    </span>
                  </span>
                  <span
                    className="grid h-11 w-11 place-items-center rounded-xl border border-[#ae9dff]/20 bg-gradient-to-br from-[#8e7af7]/20 to-[#2c3456]/50 bg-cover bg-center text-[#c6beff]/80 shadow-[inset_0_0_1.5rem_rgba(5,7,15,0.4)] sm:h-16 sm:w-16"
                    style={
                      level.thumbnailUrl
                        ? { backgroundImage: `url(${level.thumbnailUrl})` }
                        : undefined
                    }
                    aria-hidden="true"
                  >
                    {!level.thumbnailUrl && <LevelPlaceholder />}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  )
}
