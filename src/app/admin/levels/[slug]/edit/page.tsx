import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import LevelForm, { type LevelFormValues } from '@/components/admin/LevelForm'
import { updateLevelAction } from '@/app/admin/levels/[slug]/edit/actions'
import { getLevelForAdminBySlug, getNextAvailableRank, listLevelRankNames } from '@/features/levels/queries'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const level = await getLevelForAdminBySlug(slug)

  return { title: level?.name ? `Editing ${level.name}` : 'Editing Level' }
}

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

  const levelType = level.type as LevelFormValues['type']
  const [classicMaxRank, platformerMaxRank, nearbyLevels] = await Promise.all([
    getNextAvailableRank('Classic'),
    getNextAvailableRank('Platformer'),
    listLevelRankNames(levelType, level.id),
  ])
  const updateAction = updateLevelAction.bind(null, level.id)
  const maxRanks = {
    Classic: classicMaxRank,
    Platformer: platformerMaxRank,
  }

  if (level.status === 'ACTIVE') {
    maxRanks[levelType] = Math.max(1, maxRanks[levelType] - 1)
  }

  const initialValues: LevelFormValues = {
    ingameId: level.ingameId,
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
    videoUrl: level.videoUrl,
    status: level.status,
  }

  return (
    <main className="admin-page">
      <div className="admin-form-content">
        <header>
          <h1 className="admin-page-title-wrapped">
            Edit Level: {level.name}
          </h1>
          <p className="admin-page-description">
            Update {level.name}&apos;s information, including rank, as well as metadata.
          </p>
        </header>
        <LevelForm
          action={updateAction}
          initialValues={initialValues}
          maxRanks={maxRanks}
          rankedLevels={{
            Classic: levelType === 'Classic' ? nearbyLevels : [],
            Platformer: levelType === 'Platformer' ? nearbyLevels : [],
          }}
          submitLabel="Save"
          typeLocked
        />
      </div>
    </main>
  )
}
