import Link from 'next/link'

import CompletionFilters from '@/components/admin/CompletionFilters'
import { getCompletionFormOptions } from '@/features/completions/queries'
import { listCompletionsForAdmin } from '@/features/completions/queries'

export const dynamic = 'force-dynamic'

function formatCompletionDate(date: Date | null) {
  if (!date) {
    return null
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export default async function AdminCompletionsPage({
  searchParams,
}: {
  searchParams: Promise<{ levelId?: string; playerId?: string }>
}) {
  const { levelId, playerId } = await searchParams
  const [{ levels, players }, completions] = await Promise.all([
    getCompletionFormOptions(),
    listCompletionsForAdmin({ levelId, playerId }),
  ])

  return (
    <main className="min-h-screen bg-[#080b14] px-4 py-8 text-[#f4f6ff] sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-280">
        <Link
          href="/admin"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#b9c2d8] no-underline transition hover:text-[#c6beff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25"
        >
          <span aria-hidden="true">←</span> Back to Admin Panel
        </Link>
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mt-3 text-4xl font-bold sm:text-6xl">Manage Completions</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#b9c2d8]">
              Newest completion records appear at the top. Click on any record to edit it.
            </p>
          </div>
          <Link
            href="/admin/completions/new"
            className="inline-flex min-h-11 items-center self-start rounded-xl border border-[#ae9dff]/30 px-4 text-sm font-bold text-[#c6beff] no-underline transition hover:border-[#c6beff] hover:bg-[#9c8cff]/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25 sm:self-auto"
          >
            + Create New Completion
          </Link>
        </header>

        <CompletionFilters
          levels={levels}
          players={players}
          selectedLevelId={levelId}
          selectedPlayerId={playerId}
        />

        {completions.length > 0 ? (
          <div className="grid gap-3">
            {completions.map((completion) => {
              const date = formatCompletionDate(completion.completedAt)

              return (
                <Link
                  key={completion.id}
                  href={`/admin/completions/${completion.id}/edit`}
                  className="block rounded-2xl border border-white/10 bg-[#0c1120]/70 p-5 text-white no-underline transition hover:border-[#ae9dff]/55 hover:bg-[#171e35] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25"
                >
                  <p className="m-0 text-base leading-7">
                    <strong>{completion.player.name}</strong> completed <strong>{completion.level.name}</strong> by <strong>{completion.level.publishedBy}</strong>{date ? <> on <strong>{date}</strong></> : null}
                  </p>
                  <p className="mt-2 m-0 text-xs text-[#8c97b2]">
                    Completion Slug: {completion.id}
                  </p>
                </Link>
              )
            })}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-[#8c97b2]">
            No completion records yet.
          </p>
        )}
      </div>
    </main>
  )
}
