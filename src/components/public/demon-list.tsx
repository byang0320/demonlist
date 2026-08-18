import Link from 'next/link'
import type { ReactNode } from 'react'

import { listRankedLevels, type LevelType } from '@/features/levels/queries'
import { DemonListToggle } from '@/components/public/demon-list-toggle'
import { LevelPlaceholder, LevelThumbnail } from '@/components/public/level-thumbnail'
import { getLevelThumbnailUrl } from '@/lib/level-thumbnails'

export type RankedLevel = Awaited<ReturnType<typeof listRankedLevels>>[number]

const cardClassName = 'level-card'

function LevelCardDetails({ level }: { level: RankedLevel }) {
  return (
    <>
      <span className="level-card-rank">
        {level.rank}
      </span>
      <span className="level-card-details">
        {(level.demoted || level.unrated) && (
          <span className="level-card-badges">
            {level.demoted && (
              <span className="level-card-badge">
                Demoted
              </span>
            )}
            {level.unrated && (
              <span className="level-card-badge">
                Unrated
              </span>
            )}
          </span>
        )}
        <span className="level-card-name">
          {level.name}
        </span>
        <span className="level-card-publisher">
          by {level.publishedBy}
        </span>
        <span className="level-card-completions">
          {level._count.completions}{' '}
          {level._count.completions === 1 ? 'completion' : 'completions'}
        </span>
      </span>
      <span
        className="level-card-thumbnail level-thumbnail-frame"
        aria-hidden="true"
      >
        <LevelThumbnail
          levelId={level.ingameId}
        />
      </span>
    </>
  )
}

function ThumbnailPreloads({ levels }: { levels: RankedLevel[] }) {
  return (
    <>
      {levels.slice(0, 10).map((level) => (
        <link
          key={level.id}
          rel="preload"
          as="image"
          href={getLevelThumbnailUrl(level.ingameId)}
          fetchPriority="high"
        />
      ))}
    </>
  )
}

export function LevelCard({ level, admin = false }: { level: RankedLevel; admin?: boolean }) {
  const levelHref = `/levels/${level.slug}`

  if (admin) {
    return (
      <li>
        <div className={`${cardClassName} level-card-admin`}>
          <Link
            className="level-card-link-contents"
            href={levelHref}
            aria-label={`Rank ${level.rank}: ${level.name}`}
          >
            <LevelCardDetails level={level} />
          </Link>
          <Link
            className="level-card-edit-link"
            href={`/admin/levels/${level.slug}/edit`}
          >
            Edit
          </Link>
        </div>
      </li>
    )
  }

  return (
    <li>
      <Link
        className={`${cardClassName} level-card-public`}
        href={levelHref}
        aria-label={`Rank ${level.rank}: ${level.name}`}
      >
        <LevelCardDetails level={level} />
      </Link>
    </li>
  )
}

export async function DemonList({
  initialType = 'Classic',
  admin = false,
}: {
  initialType?: LevelType
  admin?: boolean
}) {
  const [classicLevels, platformerLevels] = await Promise.all([
    listRankedLevels('Classic'),
    listRankedLevels('Platformer'),
  ])

  const listPanel = (type: LevelType, levels: RankedLevel[]): ReactNode => (
    <section aria-label={`${type} demonlist`}>
      {levels.length === 0 ? (
        <div className="level-list-empty">
          <div className="level-list-empty-icon">
            <LevelPlaceholder className="level-placeholder-small" />
          </div>
          <h2 className="level-list-empty-title">No ranked levels yet</h2>
          <p className="level-list-empty-description">The list will appear here once levels have been added.</p>
        </div>
      ) : (
        <ol className="level-list" aria-label={`${type} ranked demon levels`}>
          {levels.map((level) => <LevelCard key={level.id} level={level} admin={admin} />)}
        </ol>
      )}
    </section>
  )

  return (
    <main className="public-page">
      <ThumbnailPreloads levels={classicLevels} />
      <ThumbnailPreloads levels={platformerLevels} />
      <div className="content-width">
        <Link
          href={admin ? '/admin' : '/'}
          className="back-link"
        >
          <span aria-hidden="true">←</span> {admin ? 'Back to Admin Panel' : 'Back Home'}
        </Link>
        <header className="demonlist-header">
          <div>
            <h1 className="demonlist-title">Stream VC Demonlist</h1>
          </div>
          {admin && (
            <Link
              href="/admin/levels/new"
              className="create-level-link"
            >
              + Create New Level
            </Link>
          )}
        </header>
        <DemonListToggle
          initialType={initialType}
          classicCount={classicLevels.length}
          platformerCount={platformerLevels.length}
        >
          {listPanel('Classic', classicLevels)}
          {listPanel('Platformer', platformerLevels)}
        </DemonListToggle>
      </div>
    </main>
  )
}
