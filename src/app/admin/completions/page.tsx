import Link from 'next/link'

import DeleteCompletionButton from '@/components/admin/DeleteCompletionButton'
import CompletionFilters from '@/components/admin/CompletionFilters'
import { getCompletionFormOptions } from '@/features/completions/queries'
import { listCompletionsForAdmin } from '@/features/completions/queries'

export const metadata = { title: 'Completions' }

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
  searchParams: Promise<{ levelId?: string; playerId?: string; search?: string }>
}) {
  const { levelId, playerId, search } = await searchParams
  const [{ levels, players }, completions] = await Promise.all([
    getCompletionFormOptions(),
    listCompletionsForAdmin({ levelId, playerId, search }),
  ])

  return (
    <main className="admin-page">
      <div className="admin-page-content">
        <Link
          href="/admin"
          className="back-link"
        >
          <span aria-hidden="true">←</span> Back to Admin Panel
        </Link>
        <header className="admin-page-header-split">
          <div>
            <h1 className="admin-page-title">Manage Completions</h1>
            <p className="admin-page-description">
              Newest completion records appear at the top. Click on any record to edit it.
            </p>
          </div>
          <Link
            href="/admin/completions/new"
            className="admin-create-link"
          >
            + Create New Completion
          </Link>
        </header>

        <CompletionFilters
          levels={levels}
          players={players}
          selectedLevelId={levelId}
          selectedPlayerId={playerId}
          selectedSearch={search}
        />

        {completions.length > 0 ? (
          <div className="admin-record-list">
            {completions.map((completion) => {
              const date = formatCompletionDate(completion.completedAt)

              return (
                <div
                  key={completion.id}
                  className="admin-record-row"
                >
                  <Link
                    href={`/admin/completions/${completion.id}/edit`}
                    className="admin-record-card"
                  >
                    <p className="admin-record-card-text">
                      <strong>{completion.player.name}</strong> completed <strong>{completion.level.name}</strong> by <strong>{completion.level.publishedBy}</strong>{date ? <> on <strong>{date}</strong></> : null}
                    </p>
                    <p className="admin-record-card-meta">
                      Completion Slug: {completion.id}
                    </p>
                  </Link>
                  <DeleteCompletionButton
                    completionId={completion.id}
                    levelName={completion.level.name}
                    playerName={completion.player.name}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <p className="empty-state">
            No completion records yet.
          </p>
        )}
      </div>
    </main>
  )
}
