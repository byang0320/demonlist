import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  getPlayerBySlugWithLevels,
  type PlayerCompletionSort,
} from '@/features/players/queries'
import { PlayerCompletionToggle } from '@/components/public/player-completion-toggle'
import { ProfileInfoCards, SortableCompletionRecords } from '@/components/public/profile-components'
import type { LevelType } from '@/features/levels/queries'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const player = await getPlayerBySlugWithLevels(slug)

  return {
    title: player?.name ?? 'Player Profile',
    description: player
      ? `View ${player.name}'s completed Geometry Dash levels.`
      : 'View a player profile and completed Geometry Dash levels.',
  }
}

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

export default async function PlayerProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string; type?: string }>
}) {
  const { slug } = await params
  const requestedParams = await searchParams
  const requestedSort = requestedParams.sort
  const sort: PlayerCompletionSort = requestedSort === 'date'
    ? 'date'
    : requestedSort === 'alphabetically' || requestedSort === 'alphabetical'
      ? 'alphabetical'
      : 'rank'
  const levelType: LevelType = requestedParams.type === 'platformer' ? 'Platformer' : 'Classic'
  const player = await getPlayerBySlugWithLevels(slug, sort)

  if (!player) {
    notFound()
  }

  const completions = player.completions.filter((completion) => completion.level.type === levelType)
  const hardestLevel = completions.reduce<typeof completions[number] | null>(
    (hardest, completion) => {
      if (!hardest || completion.level.rank < hardest.level.rank) {
        return completion
      }

      return hardest
    },
    null,
  )

  return (
    <main className="min-h-screen bg-[#080b14] bg-[radial-gradient(circle_at_15%_0%,rgba(109,90,218,0.2),transparent_32rem)] px-3 py-6 text-[#f4f6ff] sm:px-5 sm:py-12">
      <div className="mx-auto w-full max-w-280">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#b9c2d8] no-underline transition hover:text-[#c6beff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25"
        >
          <span aria-hidden="true">←</span> Back Home
        </Link>

        <header className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-[#171e35]/98 to-[#0f1422]/98 shadow-2xl shadow-black/20">
          <div className="grid gap-6 p-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-8 sm:p-8">
            <PlayerAvatar name={player.name} avatarUrl={player.avatarUrl} />
            <div className="min-w-0">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.10em] text-[#c6beff]">
                Player profile
              </p>
              <h1 className="break-words text-4xl font-bold leading-none sm:text-6xl">
                {player.name}
              </h1>
              <p className="mt-5 max-w-2xl whitespace-pre-wrap text-base leading-7 text-[#b9c2d8]">
                {player.bio || `No biography has been added for ${player.name} yet.`}
              </p>
              {(player.youtubeUrl || player.twitchUrl || player.discordHandle || player.twitterUrl) && (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {player.discordHandle && (
                    <span className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-[#b9c2d8]">
                      Discord: {player.discordHandle}
                    </span>
                  )}
                  {player.youtubeUrl && (
                    <a href={player.youtubeUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-[#ae9dff]/30 px-3 py-2 text-sm font-semibold text-[#c6beff] no-underline transition hover:border-[#c6beff] hover:bg-[#9c8cff]/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25">
                      YouTube ↗︎
                    </a>
                  )}
                  {player.twitchUrl && (
                    <a href={player.twitchUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-[#ae9dff]/30 px-3 py-2 text-sm font-semibold text-[#c6beff] no-underline transition hover:border-[#c6beff] hover:bg-[#9c8cff]/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25">
                      Twitch ↗︎
                    </a>
                  )}
                  {player.twitterUrl && (
                    <a href={player.twitterUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-[#ae9dff]/30 px-3 py-2 text-sm font-semibold text-[#c6beff] no-underline transition hover:border-[#c6beff] hover:bg-[#9c8cff]/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25">
                      Twitter ↗︎
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          <PlayerCompletionToggle
            initialType={levelType}
            classicCount={player.completions.filter((completion) => completion.level.type === 'Classic').length}
            platformerCount={player.completions.filter((completion) => completion.level.type === 'Platformer').length}
            sort={sort}
          />

          <ProfileInfoCards
            type="player"
            completionCount={completions.length}
            levelType={levelType}
            hardestLevel={hardestLevel ? {
              name: hardestLevel.level.name,
              slug: hardestLevel.level.slug,
              rank: hardestLevel.level.rank,
            } : null}
          />
        </header>

        <SortableCompletionRecords
          type="player"
          completions={completions}
          initialSort={sort}
          emptyMessage={`${player.name} has no ${levelType} completion records yet.`}
        />
      </div>
    </main>
  )
}
