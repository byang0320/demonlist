import { notFound } from 'next/navigation'

import PlayerForm, { type PlayerFormValues } from '@/components/admin/PlayerForm'
import { updatePlayerAction } from '@/app/admin/players/[slug]/edit/actions'
import { getPlayerForAdminBySlug } from '@/features/players/queries'

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
    <main className="min-h-screen bg-[#080b14] px-4 py-8 text-[#f4f6ff] sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-240">
        <header>
          <h1 className="mt-3 text-4xl font-bold sm:text-6xl">Edit Player</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#b9c2d8]">
            Update this player&apos;s profile information.
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
