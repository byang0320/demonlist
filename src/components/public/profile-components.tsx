import Link from 'next/link'
import type { LevelType } from '@/features/levels/queries'
import { getYouTubeThumbnailUrl } from '@/lib/youtube'

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
}

export function ProfileInfoCards(props: PlayerInfoCardsProps | LevelInfoCardsProps) {
  if (props.type === 'player') {
    return (
      <div className="grid gap-3 border-t border-white/10 p-5 sm:grid-cols-2 sm:p-8">
        <InfoCard label={`Total ${props.levelType} completions`}>
          <p className="mt-2 text-3xl font-bold tracking-[-0.05em] text-white">
            {props.completionCount}
          </p>
        </InfoCard>
        {props.hardestLevel ? (
          <Link
            href={`/levels/${props.hardestLevel.slug}`}
            className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-white no-underline transition hover:border-[#ae9dff]/55 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25"
          >
            <p className="text-xs font-bold uppercase tracking-[0.10em] text-[#8c97b2]">
              Hardest {props.levelType} Level Completed
            </p>
            <p className="mt-2 break-words text-3xl font-bold leading-tight">
              <span className="text-[#c6beff]">{props.hardestLevel.rank}.</span>{' '}
              {props.hardestLevel.name}
            </p>
          </Link>
        ) : (
          <InfoCard label={`Hardest ${props.levelType} Level Completed`}>
            <p className="mt-2 text-lg font-semibold text-[#59627b]">
              No {props.levelType} completions yet
            </p>
          </InfoCard>
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-6 border-t border-white/10 p-5 sm:p-8">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.10em] text-[#8c97b2]">
          Description
        </p>
        <p className="m-0 w-full whitespace-pre-wrap text-base leading-7 text-[#d7dcf0]">
          {props.description || '(No description provided)'}
        </p>
      </div>
    </div>
  )
}

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.10em] text-[#8c97b2]">{label}</p>
      {children}
    </div>
  )
}

type PlayerCompletion = {
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

type LevelCompletion = {
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
      dateSortHref: string
    }
  | {
      type: 'level'
      completions: LevelCompletion[]
    }

export function CompletionTable(props: CompletionTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111725]/80">
      <div className="overflow-x-auto">
        {props.type === 'player' ? (
          <table className="w-full min-w-145 border-collapse text-left">
            <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-[0.07em] text-[#8c97b2]">
              <tr>
                <th className="w-20 px-5 py-4 font-semibold">Rank</th>
                <th className="px-5 py-4 font-semibold">Level</th>
                <th className="px-5 py-4 text-right font-semibold">
                  <Link
                    href={props.dateSortHref}
                    className="inline-flex items-center gap-1 text-[#8c97b2] no-underline hover:text-[#c6beff]"
                    title="Sort by chronological completion date"
                  >
                    Completed
                  </Link>
                </th>
                <th className="px-5 py-4 text-right font-semibold">Video</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {props.completions.map((completion) => (
                <tr key={completion.level.id} className="group relative transition hover:bg-white/[0.03]">
                  <td className="px-5 py-4 text-2xl font-extrabold tracking-[-0.06em] text-[#c6beff]">
                    {completion.level.rank}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/levels/${completion.level.slug}`}
                      aria-label={`View level ${completion.level.name}`}
                      className="text-[#c6beff] no-underline after:absolute after:inset-0 after:z-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25"
                    >
                      <span className="relative z-10 flex items-center gap-3 font-semibold text-white group-hover:text-[#c6beff]">
                        <LevelThumbnail videoUrl={completion.level.videoUrl} />
                        <span className="truncate">
                          {completion.level.name}
                          {completion.times >= 2 ? ` (x${completion.times})` : ''}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-[#b9c2d8]">
                    {formatCompletionDate(completion.completedAt)}
                  </td>
                  <td className="relative z-10 px-5 py-4 text-right">
                    {completion.videoUrl ? (
                      <a
                        href={completion.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-[#c6beff] underline decoration-[#9c8cff]/50 underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25"
                      >
                        YouTube ↗︎
                      </a>
                    ) : (
                      <span className="text-sm text-[#59627b]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-145 border-collapse text-left">
            <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-[0.07em] text-[#8c97b2]">
              <tr>
                <th className="px-5 py-4 font-semibold">Player</th>
                <th className="px-5 py-4 font-semibold">Completed</th>
                <th className="px-5 py-4 text-right font-semibold">Video</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {props.completions.map((completion) => (
                <tr
                  key={`${completion.player.slug}-${completion.completedAt?.toISOString() ?? 'undated'}`}
                  className="group relative transition hover:bg-white/[0.03]"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/players/${completion.player.slug}`}
                      aria-label={`View player ${completion.player.name}`}
                      className="flex items-center gap-3 font-semibold text-white no-underline after:absolute after:inset-0 after:z-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25"
                    >
                      <span className="relative z-10 flex items-center gap-3 group-hover:text-[#c6beff]">
                        <PlayerAvatar
                          name={completion.player.name}
                          avatarUrl={completion.player.avatarUrl}
                        />
                        <span className="truncate">
                          {completion.player.name}
                          {completion.times >= 2 ? ` (x${completion.times})` : ''}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-[#b9c2d8]">
                    {formatCompletionDate(completion.completedAt)}
                  </td>
                  <td className="relative z-10 px-5 py-4 text-right">
                    {completion.videoUrl ? (
                      <a
                        href={completion.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-[#c6beff] underline decoration-[#9c8cff]/50 underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25"
                      >
                        YouTube ↗︎
                      </a>
                    ) : (
                      <span className="text-sm text-[#59627b]">—</span>
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

function LevelThumbnail({ videoUrl }: { videoUrl: string | null }) {
  const thumbnailUrl = getYouTubeThumbnailUrl(videoUrl)

  return (
    <span
      className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#ae9dff]/20 bg-gradient-to-br from-[#8e7af7]/20 to-[#2c3456]/50 bg-cover bg-center text-[#c6beff]/80"
      style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : undefined}
      aria-hidden="true"
    >
      {!thumbnailUrl && <LevelPlaceholder className="h-7 w-7" />}
    </span>
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

function LevelPlaceholder({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 48 48" fill="none">
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
