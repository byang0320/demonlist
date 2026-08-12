'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { LevelType } from '@/features/levels/queries'
import type { LevelCompletionSort } from '@/features/levels/queries'
import type { PlayerCompletionSort } from '@/features/players/queries'

type PlayerInfoCardsProps = {
  type: 'player'
  completionCount: number
  levelType: LevelType
  hardestLevel: {
    name: string
    slug: string
    rank: number
  } | null
}

type LevelInfoCardsProps = {
  type: 'level'
  description: string | null
  ingameId: number
}

export function ProfileInfoCards(props: PlayerInfoCardsProps | LevelInfoCardsProps) {
  if (props.type === 'player') {
    return (
      <div className="profile-info-cards">
        <InfoCard label={`Total ${props.levelType} completions`}>
          <p className="profile-info-card-number">
            {props.completionCount}
          </p>
        </InfoCard>
        {props.hardestLevel ? (
          <Link
            href={`/levels/${props.hardestLevel.slug}`}
            className="profile-hardest-link"
          >
            <p className="eyebrow">
              Hardest {props.levelType} Level Completed
            </p>
            <p className="profile-hardest-title">
              <span className="profile-hardest-rank">{props.hardestLevel.rank}.</span>{' '}
              {props.hardestLevel.name}
            </p>
          </Link>
        ) : (
          <InfoCard label={`Hardest ${props.levelType} Level Completed`}>
            <p className="profile-hardest-empty">
              No {props.levelType} completions yet
            </p>
          </InfoCard>
        )}
      </div>
    )
  }

  return (
    <div className="level-description-card">
      <div className="level-description-content">
        <p className="eyebrow level-description-label">
          Description
        </p>
        <p className="level-description">
          {props.description || '(No description provided)'}
        </p>
      </div>
      <div className="level-id-card">
        <p className="eyebrow level-id-label">ID</p>
        <p className="level-id-value">{props.ingameId}</p>
      </div>
    </div>
  )
}

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="profile-info-card">
      <p className="eyebrow">{label}</p>
      {children}
    </div>
  )
}

export type PlayerCompletion = {
  times: number
  completedAt: Date | null
  videoUrl: string | null
  level: {
    id: string
    name: string
    slug: string
    rank: number
    type: string
    videoUrl: string | null
  }
}

export type LevelCompletion = {
  times: number
  completedAt: Date | null
  videoUrl: string | null
  player: {
    name: string
    slug: string
    avatarUrl: string | null
  }
}

type CompletionTableProps =
  | {
      type: 'player'
      completions: PlayerCompletion[]
    }
  | {
      type: 'level'
      completions: LevelCompletion[]
    }

export function CompletionTable(props: CompletionTableProps) {
  return (
    <div className="completion-table-shell">
      <div className="completion-table-scroll">
        {props.type === 'player' ? (
          <table className="completion-table">
            <thead className="completion-table-head">
              <tr>
                <th className="completion-table-heading completion-table-heading-rank">Rank</th>
                <th className="completion-table-heading">Level</th>
                <th className="completion-table-heading completion-table-heading-right">Completed</th>
                <th className="completion-table-heading completion-table-heading-right">Video</th>
              </tr>
            </thead>
            <tbody className="completion-table-body">
              {props.completions.map((completion) => (
                <tr key={completion.level.id} className="completion-table-row">
                  <td className="completion-table-rank">
                    {completion.level.rank}
                  </td>
                  <td className="completion-table-cell">
                    <Link
                      href={`/levels/${completion.level.slug}`}
                      aria-label={`View level ${completion.level.name}`}
                      className="completion-table-level-link"
                    >
                      <span className="completion-table-link-content">
                        <span className="completion-table-level-name">
                          {completion.level.name}
                          {completion.times >= 2 ? ` (x${completion.times})` : ''}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="completion-table-date">
                    {formatCompletionDate(completion.completedAt)}
                  </td>
                  <td className="completion-table-video">
                    {completion.videoUrl ? (
                      <a
                        href={completion.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="completion-video-link"
                      >
                        YouTube ↗︎
                      </a>
                    ) : (
                      <span className="completion-video-empty">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="completion-table">
            <thead className="completion-table-head">
              <tr>
                <th className="completion-table-heading">Player</th>
                <th className="completion-table-heading">Completed</th>
                <th className="completion-table-heading completion-table-heading-right">Video</th>
              </tr>
            </thead>
            <tbody className="completion-table-body">
              {props.completions.map((completion) => (
                <tr
                  key={`${completion.player.slug}-${completion.completedAt?.toISOString() ?? 'undated'}`}
                  className="completion-table-row"
                >
                  <td className="completion-table-cell">
                    <Link
                      href={`/players/${completion.player.slug}`}
                      aria-label={`View player ${completion.player.name}`}
                      className="completion-table-player-link"
                    >
                      <span className="completion-table-link-content">
                        <PlayerAvatar
                          name={completion.player.name}
                          avatarUrl={completion.player.avatarUrl}
                        />
                        <span className="completion-table-level-name">
                          {completion.player.name}
                          {completion.times >= 2 ? ` (x${completion.times})` : ''}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="completion-table-date completion-table-date-left">
                    {formatCompletionDate(completion.completedAt)}
                  </td>
                  <td className="completion-table-video">
                    {completion.videoUrl ? (
                      <a
                        href={completion.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="completion-video-link"
                      >
                        YouTube ↗︎
                      </a>
                    ) : (
                      <span className="completion-video-empty">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

type SortControlsProps = {
  sort: PlayerCompletionSort | LevelCompletionSort
  options: Array<{ value: PlayerCompletionSort | LevelCompletionSort; label: string }>
  onChange: (sort: PlayerCompletionSort | LevelCompletionSort) => void
}

function SortControls({ sort, options, onChange }: SortControlsProps) {
  return (
    <div className="sort-controls">
      <span>Sort by</span>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`sort-button ${sort === option.value ? 'sort-button-active' : 'sort-button-inactive'}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function SortableCompletionRecords(
  props:
    | {
        type: 'player'
        completions: PlayerCompletion[]
        initialSort: PlayerCompletionSort
        emptyMessage: string
      }
    | {
        type: 'level'
        completions: LevelCompletion[]
        initialSort: LevelCompletionSort
        emptyMessage: string
      },
) {
  const [sort, setSort] = useState(props.initialSort)

  const sortedCompletions = useMemo(() => {
    if (props.type === 'player') {
      const completions = [...props.completions]
      const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: false })

      if (sort === 'alphabetical') {
        completions.sort((left, right) => (
          collator.compare(left.level.name, right.level.name) || left.level.rank - right.level.rank
        ))
      } else if (sort === 'date') {
        completions.sort((left, right) => {
          const leftDate = left.completedAt?.getTime() ?? Number.POSITIVE_INFINITY
          const rightDate = right.completedAt?.getTime() ?? Number.POSITIVE_INFINITY

          return leftDate - rightDate || left.level.rank - right.level.rank
        })
      } else {
        completions.sort((left, right) => left.level.rank - right.level.rank || collator.compare(left.level.name, right.level.name))
      }
      return completions
    }

    const completions = [...props.completions]
    const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: false })

    if (sort === 'alphabetical') {
      completions.sort((left, right) => collator.compare(left.player.name, right.player.name))
    } else {
      completions.sort((left, right) => {
        const leftDate = left.completedAt?.getTime() ?? Number.POSITIVE_INFINITY
        const rightDate = right.completedAt?.getTime() ?? Number.POSITIVE_INFINITY

        return leftDate - rightDate || collator.compare(left.player.name, right.player.name)
      })
    }

    return completions
  }, [props.completions, props.type, sort])

  const isPlayer = props.type === 'player'

  return (
    <section className="completion-records-section">
      <div className="completion-records-heading">
        <h2 className="completion-records-title">
          {isPlayer ? 'Completed Levels' : 'Completion Records'}
        </h2>
        <SortControls
          sort={sort}
          onChange={setSort}
          options={isPlayer
            ? [
                { value: 'rank', label: 'rank' },
                { value: 'alphabetical', label: 'alphabetically' },
                { value: 'date', label: 'date' },
              ]
            : [
                { value: 'alphabetical', label: 'alphabetically' },
                { value: 'date', label: 'date' },
              ]}
        />
      </div>

      {sortedCompletions.length === 0 ? (
        <div className="empty-state">
          {props.emptyMessage}
        </div>
      ) : isPlayer ? (
        <CompletionTable type="player" completions={sortedCompletions as PlayerCompletion[]} />
      ) : (
        <CompletionTable type="level" completions={sortedCompletions as LevelCompletion[]} />
      )}
    </section>
  )
}

function PlayerAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  return (
    <span
      className="profile-table-avatar"
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
    return <span className="completion-video-empty">—</span>
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}
