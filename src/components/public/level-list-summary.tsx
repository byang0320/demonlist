import Link from 'next/link'

import { LevelThumbnail } from '@/components/public/level-thumbnail'

type LevelListStats = {
  totalCompletions: number
  demotedCompletions: number
  unratedCompletions: number
  totalUniqueLevels: number
  demotedUniqueLevels: number
  unratedUniqueLevels: number
  hardestLevel: {
    ingameId: number
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
    <span className="summary-stat-annotations">
      <span>(+{demoted} demoted)</span>
      <span>(+{unrated} unrated)</span>
    </span>
  )
}

export function LevelListSummary({ title, href, stats }: LevelListSummaryProps) {
  const hardestLevelContent = stats.hardestLevel ? (
    <>
      <p className="summary-kicker">
        Hardest level
      </p>
      <p className="summary-hardest-name">
        {stats.hardestLevel.name}
      </p>
      <p className="summary-hardest-description">
        Completed by: {stats.hardestLevel.players.length > 0 ? stats.hardestLevel.players.join(', ') : 'No players yet'}
      </p>
    </>
  ) : (
    <>
      <p className="summary-kicker">
        Hardest level
      </p>
      <p className="summary-no-levels">No levels yet</p>
    </>
  )

  return (
    <article className="level-summary">
      <div className="level-summary-heading">
        <h2 className="level-summary-title">{title}</h2>
        <Link
          href={href}
          className="level-summary-link"
        >
          Check it out <span className="summary-link-arrow" aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="level-summary-stats">
        <div className="level-summary-stat">
          <p className="summary-kicker">Total</p>
          <div className="level-summary-stat-row">
            <p className="level-summary-number">
              {stats.totalCompletions}
            </p>
            <StatAnnotations
              demoted={stats.demotedCompletions}
              unrated={stats.unratedCompletions}
            />
          </div>
          <p className="level-summary-label">Completions</p>
        </div>
        <div className="level-summary-stat level-summary-stat-secondary">
          <p className="summary-kicker">Unique</p>
          <div className="level-summary-stat-row">
            <p className="level-summary-number">
              {stats.totalUniqueLevels}
            </p>
            <StatAnnotations
              demoted={stats.demotedUniqueLevels}
              unrated={stats.unratedUniqueLevels}
            />
          </div>
          <p className="level-summary-label">Levels</p>
        </div>
      </div>

      {stats.hardestLevel ? (
        <Link
          href={`/levels/${stats.hardestLevel.slug}`}
          className="level-summary-hardest-link"
        >
          <div className="level-summary-hardest-content">
            {hardestLevelContent}
          </div>
          <span
            className="level-summary-thumbnail level-thumbnail-frame"
            aria-hidden="true"
          >
            <LevelThumbnail
              levelId={stats.hardestLevel.ingameId}
            />
          </span>
        </Link>
      ) : (
        <div className="level-summary-hardest-empty">{hardestLevelContent}</div>
      )}
    </article>
  )
}
