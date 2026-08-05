import { notFound } from 'next/navigation'

import LevelForm, { type LevelFormValues } from '@/components/admin/LevelForm'
import { updateLevelAction } from '@/app/admin/levels/[slug]/edit/actions'
import { getLevelForAdminBySlug, getNextAvailableRank } from '@/features/levels/queries'

export default async function EditLevelPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const level = await getLevelForAdminBySlug(slug)

  if (!level) {
    notFound()
  }

  const [classicMaxRank, platformerMaxRank] = await Promise.all([
    getNextAvailableRank('Classic'),
    getNextAvailableRank('Platformer'),
  ])
  const updateAction = updateLevelAction.bind(null, level.id)
  const levelType = level.type as LevelFormValues['type']
  const maxRanks = {
    Classic: classicMaxRank,
    Platformer: platformerMaxRank,
  }

  if (level.status === 'ACTIVE') {
    maxRanks[levelType] = Math.max(1, maxRanks[levelType] - 1)
  }

  const initialValues: LevelFormValues = {
    name: level.name,
    slug: level.slug,
    rank: level.rank,
    type: levelType,
    demoted: level.demoted,
    unrated: level.unrated,
    publishedBy: level.publishedBy,
    createdBy: level.createdBy,
    verifiedBy: level.verifiedBy,
    description: level.description,
    thumbnailUrl: level.thumbnailUrl,
    externalUrl: level.externalUrl,
    status: level.status,
  }

  return (
    <main className="min-h-screen bg-[#080b14] px-4 py-8 text-[#f4f6ff] sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-240">
        <header>
          <h1 className="mt-3 text-4xl font-bold sm:text-6xl">Edit Level</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#b9c2d8]">
            Update the level&apos;s information, including rank, as well as metadata.
          </p>
        </header>
        <LevelForm
          action={updateAction}
          initialValues={initialValues}
          maxRanks={maxRanks}
          submitLabel="Save"
          typeLocked
        />
      </div>
    </main>
  )
}
