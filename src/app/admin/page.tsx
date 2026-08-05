import Link from 'next/link'

import { getAdminDashboardCounts } from '@/features/admin/queries'

export const dynamic = 'force-dynamic'

const actionLinkClassName =
  'flex min-h-20 items-center justify-center rounded-2xl border border-[#ae9dff]/30 bg-[#111725]/80 px-5 py-4 text-center text-sm font-bold text-[#c6beff] no-underline transition hover:border-[#c6beff] hover:bg-[#171e35] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25 sm:text-base'

export default async function AdminDashboardPage() {
  const counts = await getAdminDashboardCounts()

  return (
    <main className="min-h-screen bg-[#080b14] px-4 py-8 text-[#f4f6ff] sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-280">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#b9c2d8] no-underline transition hover:text-[#c6beff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25"
        >
          <span aria-hidden="true">←</span> Back Home
        </Link>
        <header className="mb-8">
          <h1 className="m-0 text-4xl font-bold sm:text-6xl">Admin Dashboard</h1>
        </header>

        <section className="grid gap-3 md:grid-cols-4" aria-label="Admin statistics">
          <div className="grid grid-cols-2 divide-x divide-white/10 rounded-2xl border border-white/10 bg-[#111725]/80 md:col-span-2">
            <div className="p-5 sm:p-6">
              <p className="m-0 text-xs font-bold uppercase tracking-[0.08em] text-[#8c97b2]">Classic levels</p>
              <p className="mt-3 text-4xl font-bold tracking-[-0.05em] text-white">{counts.activeLevels.classic}</p>
              <p className="mt-1 text-xs text-[#8c97b2]">active</p>
            </div>
            <div className="p-5 sm:p-6">
              <p className="m-0 text-xs font-bold uppercase tracking-[0.08em] text-[#8c97b2]">Platformer levels</p>
              <p className="mt-3 text-4xl font-bold tracking-[-0.05em] text-white">{counts.activeLevels.platformer}</p>
              <p className="mt-1 text-xs text-[#8c97b2]">active</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#111725]/80 p-5 sm:p-6">
            <p className="m-0 text-xs font-bold uppercase tracking-[0.08em] text-[#8c97b2]">Registered players</p>
            <p className="mt-3 text-4xl font-bold tracking-[-0.05em] text-white">{counts.players}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#111725]/80 p-5 sm:p-6">
            <p className="m-0 text-xs font-bold uppercase tracking-[0.08em] text-[#8c97b2]">Completions</p>
            <p className="mt-3 text-4xl font-bold tracking-[-0.05em] text-white">{counts.completions}</p>
          </div>
        </section>

        <section className="mt-8" aria-labelledby="level-management-heading">
          <h2 id="level-management-heading" className="mb-4 text-2xl font-bold sm:text-3xl">Level management</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/demonlist" className={actionLinkClassName}>
              View/Edit Demonlists
            </Link>
            <Link href="/admin/levels/new" className={actionLinkClassName}>
              + Create New Level
            </Link>
          </div>
        </section>

        <section className="mt-8" aria-labelledby="player-management-heading">
          <h2 id="player-management-heading" className="mb-4 text-2xl font-bold sm:text-3xl">Player management</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/players" className={actionLinkClassName}>
              View/Edit Registered Players
            </Link>
            <Link href="/admin/players/new" className={actionLinkClassName}>
              + Create New Player
            </Link>
          </div>
        </section>

        <section className="mt-8" aria-labelledby="completion-management-heading">
          <h2 id="completion-management-heading" className="mb-4 text-2xl font-bold sm:text-3xl">Completion management</h2>
          <p className="-mt-2 mb-4 text-sm text-[#8c97b2]">
            Before you create a record, make sure that both the level you beat and your player profile have already been created. Refer to the buttons above.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/completions" className={actionLinkClassName}>
              View/Edit Completions
            </Link>
            <Link
              href="/admin/completions/new"
              className="flex min-h-20 items-center justify-center rounded-2xl border border-[#c6beff] bg-[#9c8cff] px-5 py-4 text-center text-sm font-bold text-[#0b0d18] no-underline shadow-lg shadow-[#9c8cff]/10 transition hover:bg-[#c6beff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/30 sm:text-base"
            >
              + Create New Completion
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
