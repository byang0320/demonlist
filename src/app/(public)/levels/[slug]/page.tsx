import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getLevelBySlugWithPlayers } from '@/features/levels/queries'

export const dynamic = 'force-dynamic'

function LevelPlaceholder() {
  return (
    <svg aria-hidden="true" className="h-12 w-12" viewBox="0 0 48 48" fill="none">
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

function PlayerAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  return (
    <span
      className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-[#252d49] bg-cover bg-center text-sm font-bold text-[#c6beff]"
      style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
      role="img"
      aria-label={`${name}'s avatar`}
    >
      {!avatarUrl && name.slice(0, 1).toUpperCase()}
    </span>
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

export default async function LevelProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const level = await getLevelBySlugWithPlayers(slug)

  if (!level) {
    notFound()
  }

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
          <div className="grid gap-6 p-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-8 sm:p-8">
            <div
              className="grid h-32 w-32 place-items-center rounded-2xl border border-[#ae9dff]/25 bg-gradient-to-br from-[#8e7af7]/20 to-[#2c3456]/50 bg-cover bg-center text-[#c6beff]/80 shadow-[inset_0_0_2rem_rgba(5,7,15,0.45)]"
              style={level.thumbnailUrl ? { backgroundImage: `url(${level.thumbnailUrl})` } : undefined}
              aria-hidden="true"
            >
              {!level.thumbnailUrl && <LevelPlaceholder />}
            </div>

            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold tracking-[0.05em] text-[#c6beff]">
                <span className="rounded-full bg-[#9c8cff]/15 px-3 py-1">Rank {level.rank}</span>
              </div>
              <h1 className="break-words text-4xl font-bold leading-none sm:text-6xl">
                {level.name}
              </h1>
              <p className="mt-4 text-base text-[#b9c2d8]">
                {level.creatorName ? `Created by ${level.creatorName}` : 'Creator unknown'}
              </p>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#8c97b2]">
                <span>{level._count.completions} {level._count.completions === 1 ? "record" : "records"}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 border-t border-white/10 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-8">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.10em] text-[#8c97b2]">
                Description
              </p>
              <p className="m-0 max-w-3xl whitespace-pre-wrap text-base leading-7 text-[#d7dcf0]">
                {level.description || 'No description has been added for this level yet.'}
              </p>
            </div>
            {level.externalUrl && (
              <a
                href={level.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="self-start rounded-xl border border-[#ae9dff]/30 px-4 py-3 text-sm font-semibold text-[#c6beff] no-underline transition hover:border-[#c6beff] hover:bg-[#9c8cff]/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25"
              >
                Open level link <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </header>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="m-0 text-2xl font-bold sm:text-3xl">
                Completion Records
              </h2>
            </div>
          </div>

          {level.completions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-[#8c97b2]">
              No completion records have been added yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111725]/80">
              <div className="overflow-x-auto">
                <table className="w-full min-w-145 border-collapse text-left">
                  <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-[0.07em] text-[#8c97b2]">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Player</th>
                      <th className="px-5 py-4 font-semibold">Completed</th>
                      <th className="px-5 py-4 text-right font-semibold">Video</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {level.completions.map((completion) => (
                      <tr key={`${completion.player.slug}-${completion.completedAt?.toISOString() ?? 'undated'}`} className="transition hover:bg-white/[0.03]">
                        <td className="px-5 py-4">
                          <Link
                            href={`/players/${completion.player.slug}`}
                            className="flex items-center gap-3 font-semibold text-white no-underline hover:text-[#c6beff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25"
                          >
                            <PlayerAvatar
                              name={completion.player.name}
                              avatarUrl={completion.player.avatarUrl}
                            />
                            <span className="truncate">{completion.player.name}</span>
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-[#b9c2d8]">
                          {formatCompletionDate(completion.completedAt)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {completion.videoUrl ? (
                            <a
                              href={completion.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-semibold text-[#c6beff] underline decoration-[#9c8cff]/50 underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25"
                            >
                              Watch video ↗
                            </a>
                          ) : (
                            <span className="text-sm text-[#59627b]">—</span>
                          )}
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
