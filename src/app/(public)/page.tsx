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
    <main className="min-h-screen overflow-hidden bg-[#080b14] bg-[radial-gradient(circle_at_15%_0%,rgba(109,90,218,0.25),transparent_32rem)] px-3 py-6 text-[#f4f6ff] sm:px-5 sm:py-12">
      <div className="pointer-events-none fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
        <div className="pointer-events-auto">
          <Link
            href="/admin"
            className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-[#59627b] no-underline transition hover:border-[#ae9dff]/50 hover:text-[#8c97b2] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25"
          >
            Admin
          </Link>
        </div>
      </div>
      <div className="mx-auto w-full max-w-280">
        <header className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#1b2140]/95 via-[#11172a]/98 to-[#0f1422] p-6 shadow-2xl shadow-black/25 sm:p-12">
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#8e7af7]/15 blur-3xl" />
          <div className="relative">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#c6beff]">
              Welcome to the
            </p>
            <h1 className="text-5xl font-bold tracking-[-0.03em] leading-[0.92] sm:text-8xl">
              Stream VC Demonlist
            </h1>
            <p className="mt-6 text-base leading-7 text-[#b9c2d8] sm:text-lg">
              Explore the hardest levels the Stream VC has completed, and see who conquered them.
            </p>
          </div>
        </header>

        <section className="mt-5 grid gap-3 lg:grid-cols-2" aria-label="Demonlist statistics">
          <LevelListSummary title="Classic Demonlist" href="/demonlist" stats={stats.classic} />
          <LevelListSummary title="Platformer Demonlist" href="/demonlist?type=platformer" stats={stats.platformer} />
        </section>

        <section className="mt-5 rounded-2xl border border-white/10 bg-[#111725]/80 p-5 sm:p-7">
          <div className="mb-5">
            <h2 className="m-0 text-2xl font-bold">Jump to a profile</h2>
            <p className="mt-2 text-sm text-[#8c97b2]">
              Choose a Stream VC member to see their completed levels.
            </p>
          </div>
          {players.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {players.map((player) => (
                <Link
                  key={player.slug}
                  href={`/players/${player.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-[#0c1120]/70 p-4 text-white no-underline transition hover:-translate-y-0.5 hover:border-[#ae9dff]/55 hover:bg-[#171e35] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25"
                >
                  <span
                    className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#ae9dff]/25 bg-[#252d49] bg-cover bg-center text-lg font-bold text-[#c6beff]"
                    style={player.avatarUrl ? { backgroundImage: `url(${player.avatarUrl})` } : undefined}
                    aria-hidden="true"
                  >
                    {!player.avatarUrl && player.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold group-hover:text-[#c6beff]">
                      {player.name}
                    </span>
                    <span className="mt-1 block text-xs text-[#8c97b2]">
                      {player._count.completions}{' '}
                      {player._count.completions === 1 ? 'completion' : 'completions'}
                    </span>
                  </span>
                  <span className="text-lg text-[#8c97b2] transition group-hover:translate-x-1 group-hover:text-[#c6beff]" aria-hidden="true">
                    →
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="m-0 text-sm text-[#8c97b2]">No Stream VC players yet. Strange...</p>
          )}
        </section>
      </div>
    </main>
  )
}
