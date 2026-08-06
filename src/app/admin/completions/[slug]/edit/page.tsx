import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import CompletionForm from '@/components/admin/CompletionForm'
import { updateCompletionAction } from '@/app/admin/completions/[slug]/edit/actions'
import { getCompletionForAdmin, getCompletionFormOptions } from '@/features/completions/queries'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const completion = await getCompletionForAdmin(slug)

  return {
    title: completion
      ? `Editing ${completion.player.name} Completion`
      : 'Editing Completion',
  }
}

export const dynamic = 'force-dynamic'

export default async function EditCompletionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [completion, options] = await Promise.all([
    getCompletionForAdmin(slug),
    getCompletionFormOptions(),
  ])

  if (!completion) {
    notFound()
  }

  const updateAction = updateCompletionAction.bind(null, completion.id)

  return (
    <main className="min-h-screen bg-[#080b14] px-4 py-8 text-[#f4f6ff] sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-240">
        <header>
          <h1 className="mt-3 text-4xl font-bold sm:text-6xl">Edit Completion</h1>
        </header>
        <CompletionForm
          action={updateAction}
          levels={options.levels}
          players={options.players}
          initialValues={{
            levelId: completion.levelId,
            playerId: completion.playerId,
            levelLabel: `${completion.level.name} by ${completion.level.publishedBy}`,
            playerLabel: completion.player.name,
            times: String(completion.times),
            completedAt: completion.completedAt?.toISOString().slice(0, 10) ?? '',
            videoUrl: completion.videoUrl ?? '',
            notes: completion.notes ?? '',
          }}
          submitLabel="Save"
        />
      </div>
    </main>
  )
}
