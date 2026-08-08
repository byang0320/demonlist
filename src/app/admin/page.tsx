import Link from 'next/link'

import { getAdminDashboardCounts } from '@/features/admin/queries'

export const metadata = { title: 'Admin Dashboard' }

export const dynamic = 'force-dynamic'

const actionLinkClassName =
  'admin-action-link'

export default async function AdminDashboardPage() {
  const counts = await getAdminDashboardCounts()

  return (
    <main className="admin-page">
      <div className="admin-page-content">
        <Link
          href="/"
          className="back-link"
        >
          <span aria-hidden="true">←</span> Back Home
        </Link>
        <header className="admin-page-header">
          <h1 className="admin-page-title admin-page-title-no-margin">Admin Dashboard</h1>
        </header>

        <section className="admin-stat-grid" aria-label="Admin statistics">
          <div className="admin-stat-group">
            <div className="admin-stat-group-cell">
              <p className="admin-stat-label">Classic levels</p>
              <p className="admin-stat-number">{counts.activeLevels.classic}</p>
              <p className="admin-stat-suffix">active</p>
            </div>
            <div className="admin-stat-group-cell">
              <p className="admin-stat-label">Platformer levels</p>
              <p className="admin-stat-number">{counts.activeLevels.platformer}</p>
              <p className="admin-stat-suffix">active</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Registered players</p>
            <p className="admin-stat-number">{counts.players}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-label">Completions</p>
            <p className="admin-stat-number">{counts.completions}</p>
          </div>
        </section>

        <section className="admin-management-section" aria-labelledby="level-management-heading">
          <h2 id="level-management-heading" className="admin-management-title">Level management</h2>
          <div className="admin-management-grid">
            <Link href="/admin/demonlist" className={actionLinkClassName}>
              View/Edit Demonlists
            </Link>
            <Link href="/admin/levels/new" className={actionLinkClassName}>
              + Create New Level
            </Link>
          </div>
        </section>

        <section className="admin-management-section" aria-labelledby="player-management-heading">
          <h2 id="player-management-heading" className="admin-management-title">Player management</h2>
          <div className="admin-management-grid">
            <Link href="/admin/players" className={actionLinkClassName}>
              View/Edit Registered Players
            </Link>
            <Link href="/admin/players/new" className={actionLinkClassName}>
              + Create New Player
            </Link>
          </div>
        </section>

        <section className="admin-management-section" aria-labelledby="completion-management-heading">
          <h2 id="completion-management-heading" className="admin-management-title">Completion management</h2>
          <p className="admin-management-description">
            Before you create a record, make sure that both the level you beat and your player profile have already been created. Refer to the buttons above.
          </p>
          <div className="admin-management-grid">
            <Link href="/admin/completions" className={actionLinkClassName}>
              View/Edit Completions
            </Link>
            <Link
              href="/admin/completions/new"
              className="admin-action-link-primary"
            >
              + Create New Completion
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
