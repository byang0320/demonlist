import Link from 'next/link'

import { listPlayersForAdmin } from '@/features/players/queries'

export const metadata = { title: 'Players' }

export const dynamic = 'force-dynamic'

export default async function AdminPlayersPage() {
  const players = await listPlayersForAdmin()

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
            <h1 className="admin-page-title">Manage Players</h1>
            <p className="admin-page-description">
              View and edit Stream VC player profiles.
            </p>
          </div>
          <Link
            href="/admin/players/new"
            className="admin-create-link"
          >
            + Create New Player
          </Link>
        </header>

        {players.length > 0 ? (
          <div className="admin-player-list">
            {players.map((player) => (
              <div
                key={player.slug}
                className="admin-player-row"
              >
                <Link
                  href={`/players/${player.slug}`}
                  className="admin-player-link"
                >
                  <span
                    className="admin-player-avatar"
                    style={player.avatarUrl ? { backgroundImage: `url(${player.avatarUrl})` } : undefined}
                    aria-hidden="true"
                  >
                    {!player.avatarUrl && player.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="admin-player-copy">
                    <span className="admin-player-name">
                      {player.name}
                    </span>
                    <span className="admin-player-count">
                      {player._count.completions}{' '}
                      {player._count.completions === 1 ? 'completion' : 'completions'}
                    </span>
                  </span>
                </Link>
                <Link
                  href={`/admin/players/${player.slug}/edit`}
                  className="admin-edit-link"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">
            No Stream VC players yet.
          </p>
        )}
      </div>
    </main>
  )
}
