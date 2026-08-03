import Link from 'next/link'
import { notFound } from 'next/navigation'

import {
  getPlayerBySlugWithLevels,
  type PlayerCompletionSort,
} from '@/features/players/queries'

export const dynamic = 'force-dynamic'

function PlayerAvatar({
  name,
  avatarUrl,
  size = 'large',
}: {
  name: string
  avatarUrl: string | null
  size?: 'large' | 'small'
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-2xl border border-[#ae9dff]/25 bg-[#252d49] bg-cover bg-center font-bold text-[#c6beff] ${size === 'large' ? 'h-28 w-28 text-3xl sm:h-36 sm:w-36' : 'h-10 w-10 rounded-xl text-sm'}`}
      style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
      role="img"
      aria-label={`${name}'s avatar`}
    >
      {!avatarUrl && name.slice(0, 1).toUpperCase()}
    </span>
  )
}

function LevelPlaceholder() {
  return (
    <svg aria-hidden="true" className="h-7 w-7" viewBox="0 0 48 48" fill="none">
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

function formatCompletionDate(date: Date | null) {
  if (!date) {
    return 'Date not recorded'
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export default async function PlayerProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string }>
}) {
  const { slug } = await params
  const requestedSort = (await searchParams).sort
  const sort: PlayerCompletionSort = requestedSort === 'date' ? 'date' : 'rank'
  const player = await getPlayerBySlugWithLevels(slug, sort)

  if (!player) {
    notFound()
  }

  const hardestLevel = player.completions.reduce<typeof player.completions[number] | null>(
    (hardest, completion) => {
      if (!hardest || completion.level.rank < hardest.level.rank) {
        return completion
      }

      return hardest
    },
    null,
  )

  const rankSortHref = `/players/${player.slug}`
  const dateSortHref = `/players/${player.slug}?sort=date`

  return (
    <main className="min-h-screen bg-[#080b14] bg-[radial-gradient(circle_at_15%_0%,rgba(109,90,218,0.2),transparent_32rem)] px-3 py-6 text-[#f4f6ff] sm:px-5 sm:py-12">
      <div className="mx-auto w-full max-w-280">
        <Link
          href="/demonlist"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#b9c2d8] no-underline transition hover:text-[#c6beff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25"
        >
          <span aria-hidden="true">←</span> Back to Demon List
        </Link>

        <header className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-[#171e35]/98 to-[#0f1422]/98 shadow-2xl shadow-black/20">
          <div className="grid gap-6 p-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-8 sm:p-8">
            <PlayerAvatar name={player.name} avatarUrl={player.avatarUrl} />
            <div className="min-w-0">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#c6beff]">
                Player profile
              </p>
              <h1 className="break-words text-4xl font-bold leading-none sm:text-6xl">
                {player.name}
              </h1>
              <p className="mt-5 max-w-2xl whitespace-pre-wrap text-base leading-7 text-[#b9c2d8]">
                {player.bio || 'No biography has been added for this player yet.'}
              </p>
              {player.externalUrl && (
                <a
                  href={player.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex rounded-xl border border-[#ae9dff]/30 px-4 py-3 text-sm font-semibold text-[#c6beff] no-underline transition hover:border-[#c6beff] hover:bg-[#9c8cff]/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25"
                >
                  Open external profile <span className="ml-2" aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          </div>

          <div className="grid gap-3 border-t border-white/10 p-5 sm:grid-cols-2 sm:p-8">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.10em] text-[#8c97b2]">
                Total completions
              </p>
              <p className="mt-2 text-3xl font-bold tracking-[-0.05em] text-white">
                {player.completions.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.10em] text-[#8c97b2]">
                Hardest level completed
              </p>
              {hardestLevel ? (
                <Link
                  href={`/levels/${hardestLevel.level.slug}`}
                  className="mt-2 block truncate text-lg font-bold text-white no-underline hover:text-[#c6beff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25"
                >
                  <span className="mr-2 text-[#c6beff]">{hardestLevel.level.rank}</span>
                  {hardestLevel.level.name}
                </Link>
              ) : (
                <p className="mt-2 text-lg font-semibold text-[#59627b]">No completions yet</p>
              )}
            </div>
          </div>
        </header>

        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="m-0 text-2xl font-bold sm:text-3xl">
                Completed Levels
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#8c97b2]">
              <span>Sort by</span>
              <Link
                href={rankSortHref}
                className={`rounded-lg px-2 py-1 no-underline transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25 ${sort === 'rank' ? 'bg-[#9c8cff]/15 font-semibold text-[#c6beff]' : 'hover:text-white'}`}
              >
                rank
              </Link>
              <Link
                href={dateSortHref}
                className={`rounded-lg px-2 py-1 no-underline transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25 ${sort === 'date' ? 'bg-[#9c8cff]/15 font-semibold text-[#c6beff]' : 'hover:text-white'}`}
                title="Sort by chronological completion date"
              >
                date
              </Link>
            </div>
          </div>

          {player.completions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-[#8c97b2]">
              This player has no completion records yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111725]/80">
              <div className="overflow-x-auto">
                <table className="w-full min-w-145 border-collapse text-left">
                  <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-[0.07em] text-[#8c97b2]">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Level</th>
                      <th className="px-5 py-4 font-semibold">Rank</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        <Link
                          href={dateSortHref}
                          className="inline-flex items-center gap-1 text-[#8c97b2] no-underline hover:text-[#c6beff]"
                          title="Sort by chronological completion date"
                        >
                          Completed
                        </Link>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {player.completions.map((completion) => (
                      <tr key={completion.level.id} className="transition hover:bg-white/[0.03]">
                        <td className="px-5 py-4">
                          <Link
                            href={`/levels/${completion.level.slug}`}
                            className="flex items-center gap-3 font-semibold text-white no-underline hover:text-[#c6beff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25"
                          >
                            <span
                              className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#ae9dff]/20 bg-gradient-to-br from-[#8e7af7]/20 to-[#2c3456]/50 bg-cover bg-center text-[#c6beff]/80"
                              style={
                                completion.level.thumbnailUrl
                                  ? { backgroundImage: `url(${completion.level.thumbnailUrl})` }
                                  : undefined
                              }
                              aria-hidden="true"
                            >
                              {!completion.level.thumbnailUrl && <LevelPlaceholder />}
                            </span>
                            <span className="truncate">{completion.level.name}</span>
                          </Link>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-[#c6beff]">
                          {completion.level.rank}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-[#b9c2d8]">
                          {formatCompletionDate(completion.completedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
