import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import PlayerForm, { type PlayerFormValues } from '@/components/admin/PlayerForm'
import { updatePlayerAction } from '@/app/admin/players/[slug]/edit/actions'
import { getPlayerForAdminBySlug } from '@/features/players/queries'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const player = await getPlayerForAdminBySlug(slug)

  return { title: player?.name ? `Editing ${player.name}` : 'Editing Player' }
}

export default async function EditPlayerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const player = await getPlayerForAdminBySlug(slug)

  if (!player) {
    notFound()
  }

  const updateAction = updatePlayerAction.bind(null, player.id)
  const initialValues: PlayerFormValues = {
    name: player.name,
    slug: player.slug,
    bio: player.bio,
    avatarUrl: player.avatarUrl,
    youtubeUrl: player.youtubeUrl,
    twitchUrl: player.twitchUrl,
    discordHandle: player.discordHandle,
    twitterUrl: player.twitterUrl,
    country1: player.country1,
    country2: player.country2,
  }

  return (
    <main className="admin-page">
      <div className="admin-form-content">
        <header>
          <h1 className="admin-page-title-wrapped">
            Edit Player: {player.name}
          </h1>
          <p className="admin-page-description">
            Update {player.name}&apos;s profile information.
          </p>
        </header>
        <PlayerForm
          action={updateAction}
          initialValues={initialValues}
          submitLabel="Save"
        />
      </div>
    </main>
  )
}
