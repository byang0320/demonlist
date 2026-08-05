import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CompletionTable, ProfileInfoCards } from '@/components/public/profile-components'
import { getLevelBySlugWithPlayers } from '@/features/levels/queries'

export const dynamic = 'force-dynamic'

function LevelPlaceholder() {
  return (
    <svg aria-hidden="true" className="h-12 w-12" viewBox="0 0 48 48" fill="none">
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

export default async function LevelProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const level = await getLevelBySlugWithPlayers(slug)

  if (!level) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#080b14] bg-[radial-gradient(circle_at_15%_0%,rgba(109,90,218,0.2),transparent_32rem)] px-3 py-6 text-[#f4f6ff] sm:px-5 sm:py-12">
      <div className="mx-auto w-full max-w-280">
        <Link
          href={level.type === "Classic" ? "/demonlist" : "/pemonlist"}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#b9c2d8] no-underline transition hover:text-[#c6beff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25"
        >
          <span aria-hidden="true">←</span> Back to {level.type === "Classic" ? "Demonlist" : "Pemonlist"}
        </Link>

        <header className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-[#171e35]/98 to-[#0f1422]/98 shadow-2xl shadow-black/20">
          <div className="grid grid-cols-[5rem_minmax(0,1fr)_6rem] items-center gap-4 p-5 sm:grid-cols-[8rem_minmax(0,1fr)_8rem] sm:gap-8 sm:p-8">
            <div className="flex h-full items-center justify-center border-r border-white/10 pr-4 text-center text-7xl font-extrabold leading-none tracking-[-0.08em] text-[#c6beff] sm:pr-8 sm:text-9xl">
              {level.rank}
            </div>

            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-bold tracking-[0.05em] text-[#c6beff]">
                <span className="rounded-full bg-[#9c8cff]/15 px-3 py-1">{level.type}</span>
                {level.demoted && (
                  <span className="rounded-full bg-red-500/15 px-3 py-1 text-red-300">
                    Demoted
                  </span>
                )}
                {level.unrated && (
                  <span className="rounded-full bg-red-500/15 px-3 py-1 text-red-300">
                    Unrated
                  </span>
                )}
              </div>
              <h1 className="break-words text-4xl font-bold leading-none sm:text-6xl">
                {level.name}
              </h1>
              <p className="mt-4 text-base text-[#b9c2d8]">
                Published by {level.publishedBy}
              </p>
              {(level.createdBy || level.verifiedBy) && (
                <p className="text-base text-[#b9c2d8]">
                  {level.createdBy
                    ? `Created by ${level.createdBy}${level.verifiedBy ? `, verified by ${level.verifiedBy}` : ''}`
                    : `Verified by ${level.verifiedBy}`}
                </p>
              )}
            </div>

            <div
              className="grid h-24 w-24 place-items-center rounded-2xl border border-[#ae9dff]/25 bg-gradient-to-br from-[#8e7af7]/20 to-[#2c3456]/50 bg-cover bg-center text-[#c6beff]/80 shadow-[inset_0_0_2rem_rgba(5,7,15,0.45)] sm:h-32 sm:w-32"
              style={level.thumbnailUrl ? { backgroundImage: `url(${level.thumbnailUrl})` } : undefined}
              aria-hidden="true"
            >
              {!level.thumbnailUrl && <LevelPlaceholder />}
            </div>
          </div>

          <ProfileInfoCards
            type="level"
            description={level.description}
            externalUrl={level.externalUrl}
          />
        </header>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="m-0 text-2xl font-bold sm:text-3xl">
                Completion Records
              </h2>
            </div>
          </div>

          {level.completions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-[#8c97b2]">
              No completion records have been added yet.
            </div>
          ) : (
            <CompletionTable type="level" completions={level.completions} />
          )}
        </section>
      </div>
    </main>
  )
}
