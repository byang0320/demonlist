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
      className={`profile-avatar ${size === 'large' ? 'profile-avatar-large' : 'profile-avatar-small'}`}
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
    <main className="public-page">
      <div className="content-width">
        <Link
          href="/"
          className="back-link"
        >
          <span aria-hidden="true">←</span> Back Home
        </Link>

        <header className="profile-header">
          <div className="player-profile-header-content">
            <PlayerAvatar name={player.name} avatarUrl={player.avatarUrl} />
            <div className="profile-copy">
              <p className="profile-label">
                Player profile
              </p>
              <h1 className="profile-title">
                {player.name}
              </h1>
              <p className="profile-bio">
                {player.bio || `No biography has been added for ${player.name} yet.`}
              </p>
              {(player.youtubeUrl || player.twitchUrl || player.discordHandle || player.twitterUrl) && (
                <div className="profile-links">
                  {player.discordHandle && (
                    <span className="profile-link-muted">
                      Discord: {player.discordHandle}
                    </span>
                  )}
                  {player.youtubeUrl && (
                    <a href={player.youtubeUrl} target="_blank" rel="noreferrer" className="profile-link">
                      YouTube ↗︎
                    </a>
                  )}
                  {player.twitchUrl && (
                    <a href={player.twitchUrl} target="_blank" rel="noreferrer" className="profile-link">
                      Twitch ↗︎
                    </a>
                  )}
                  {player.twitterUrl && (
                    <a href={player.twitterUrl} target="_blank" rel="noreferrer" className="profile-link">
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
