import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ProfileInfoCards, SortableCompletionRecords } from '@/components/public/profile-components'
import { getLevelBySlugWithPlayers, type LevelCompletionSort } from '@/features/levels/queries'
import { getYouTubeThumbnailUrl } from '@/lib/youtube'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const level = await getLevelBySlugWithPlayers(slug)

  return {
    title: level?.name ?? 'Level Profile',
    description: level
      ? `View ${level.name} and its Geometry Dash completion records.`
      : 'View a Geometry Dash level profile and its completion records.',
  }
}

export const dynamic = 'force-dynamic'

function LevelPlaceholder() {
  return (
    <svg aria-hidden="true" className="level-placeholder-large" viewBox="0 0 48 48" fill="none">
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

export default async function LevelProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string }>
}) {
  const { slug } = await params
  const requestedSort = (await searchParams).sort
  const sort: LevelCompletionSort = requestedSort === 'alphabetically' || requestedSort === 'alphabetical'
    ? 'alphabetical'
    : 'date'
  const level = await getLevelBySlugWithPlayers(slug, sort)

  if (!level) {
    notFound()
  }

  const thumbnailUrl = getYouTubeThumbnailUrl(level.videoUrl)
  const thumbnail = (
    <div
      className="profile-thumbnail"
      style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : undefined}
      aria-hidden="true"
    >
      {!thumbnailUrl && <LevelPlaceholder />}
    </div>
  )

  return (
    <main className="public-page">
      <div className="content-width">
        <Link
          href={level.type === "Classic" ? "/demonlist" : "/demonlist?type=platformer"}
          className="back-link"
        >
          <span aria-hidden="true">←</span> Back to {level.type === "Classic" ? "Demonlist" : "Platformer Demonlist"}
        </Link>

        <header className="profile-header">
          <div className="level-profile-header-content">
            <div className="level-profile-rank">
              {level.rank}
            </div>

            <div className="profile-copy">
              <div className="level-profile-meta">
                <span className="level-profile-type">{level.type}</span>
                {level.demoted && (
                  <span className="level-profile-badge">
                    Demoted
                  </span>
                )}
                {level.unrated && (
                  <span className="level-profile-badge">
                    Unrated
                  </span>
                )}
              </div>
              <h1 className="profile-title">
                {level.name}
              </h1>
              <p className="level-profile-publisher">
                Published by {level.publishedBy}
              </p>
              {(level.createdBy || level.verifiedBy) && (
                <p className="level-profile-creator">
                  {level.createdBy
                    ? `Created by ${level.createdBy}${level.verifiedBy ? `, verified by ${level.verifiedBy}` : ''}`
                    : `Verified by ${level.verifiedBy}`}
                </p>
              )}
            </div>

            {level.videoUrl ? (
              <a
                href={level.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="level-profile-video-link"
                aria-label={`Watch the verification video for ${level.name}`}
              >
                {thumbnail}
              </a>
            ) : (
              <div className="level-profile-video-container">{thumbnail}</div>
            )}
          </div>

          <ProfileInfoCards
            type="level"
            description={level.description}
          />
        </header>

        <SortableCompletionRecords
          type="level"
          completions={level.completions}
          initialSort={sort}
          emptyMessage="No completion records have been added yet. Check back very soon..."
        />
      </div>
    </main>
  )
}
