import CompletionForm from '@/components/admin/CompletionForm'
import { getCompletionFormOptions } from '@/features/completions/queries'

export const metadata = { title: 'Create New Completion' }

export const dynamic = 'force-dynamic'

export default async function NewCompletionPage() {
  const { levels, players } = await getCompletionFormOptions()

  return (
    <main className="min-h-screen bg-[#080b14] px-4 py-8 text-[#f4f6ff] sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-240">
        <header>
          <h1 className="mt-3 text-4xl font-bold sm:text-6xl">Create New Completion</h1>
        </header>
        <CompletionForm levels={levels} players={players} />
      </div>
    </main>
  )
}
