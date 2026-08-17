import Link from 'next/link'

import { LevelListSummary } from '@/components/public/level-list-summary'
import { getHomePageData } from '@/features/home/queries'

export const metadata = {
  title: 'Home',
  description: 'Browse the Stream VC Geometry Dash demonlists and player profiles.',
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const { stats, players } = await getHomePageData()

  return (
    <main className="home-page">
      <div className="home-admin-overlay">
        <div className="home-admin-overlay-inner">
          <Link
            href="/admin"
            className="admin-faint-link"
          >
            Admin
          </Link>
        </div>
      </div>
      <div className="content-width">
        <header className="home-header">
          <div className="home-header-glow" />
          <div className="home-header-content">
            <p className="home-kicker">
              Welcome to the
            </p>
            <h1 className="home-title">
              Stream VC Demonlist
            </h1>
            <p className="home-intro">
              Explore the hardest levels the Stream VC has completed, and see who beat them.
            </p>
          </div>
        </header>

        <section className="home-stats" aria-label="Demonlist statistics">
          <LevelListSummary title="Classic Demonlist" href="/demonlist" stats={stats.classic} />
          <LevelListSummary title="Platformer Demonlist" href="/demonlist?type=platformer" stats={stats.platformer} />
        </section>

        <section className="home-profiles-section">
          <div className="home-section-heading">
            <h2 className="home-section-title">Jump to a profile</h2>
            <p className="home-section-description">
              Choose a Stream VC member to see their completed levels.
            </p>
          </div>
          {players.length > 0 ? (
            <div className="home-player-grid">
              {players.map((player) => (
                <Link
                  key={player.slug}
                  href={`/players/${player.slug}`}
                  className="home-player-card"
                >
                  <span
                    className="player-avatar-card"
                    style={player.avatarUrl ? { backgroundImage: `url(${player.avatarUrl})` } : undefined}
                    aria-hidden="true"
                  >
                    {!player.avatarUrl && player.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="player-card-copy">
                    <span className="player-card-name">
                      {player.name}
                    </span>
                    <span className="player-card-count">
                      {player._count.completions}{' '}
                      {player._count.completions === 1 ? 'completion' : 'completions'}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="home-empty-message">No Stream VC players yet. Strange...</p>
          )}
        </section>
      </div>
    </main>
  )
}
