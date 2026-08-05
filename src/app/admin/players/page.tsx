import Link from 'next/link'

import { listPlayersForAdmin } from '@/features/players/queries'

export const dynamic = 'force-dynamic'

export default async function AdminPlayersPage() {
  const players = await listPlayersForAdmin()

  return (
    <main className="min-h-screen bg-[#080b14] px-4 py-8 text-[#f4f6ff] sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-280">
        <header className="mb-8">
          <h1 className="mt-3 text-4xl font-bold sm:text-6xl">Manage Players</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#b9c2d8]">
            View and edit Stream VC player profiles.
          </p>
        </header>

        {players.length > 0 ? (
          <div className="grid gap-3">
            {players.map((player) => (
              <div
                key={player.slug}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0c1120]/70 p-4 text-white transition hover:border-[#ae9dff]/55 hover:bg-[#171e35]"
              >
                <Link
                  href={`/players/${player.slug}`}
                  className="group flex min-w-0 flex-1 items-center gap-4 no-underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25"
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
                <Link
                  href={`/admin/players/${player.slug}/edit`}
                  className="shrink-0 rounded-lg border border-[#ae9dff]/30 px-3 py-2 text-xs font-bold text-[#c6beff] no-underline transition hover:border-[#c6beff] hover:bg-[#9c8cff]/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25 sm:px-4 sm:text-sm"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-[#8c97b2]">
            No Stream VC players yet.
          </p>
        )}
      </div>
    </main>
  )
}
