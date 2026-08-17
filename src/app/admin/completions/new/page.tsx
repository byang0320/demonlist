import Link from 'next/link'

import CompletionForm from '@/components/admin/CompletionForm'
import { getCompletionFormOptions } from '@/features/completions/queries'

export const metadata = { title: 'Create New Completion' }

export const dynamic = 'force-dynamic'

export default async function NewCompletionPage() {
  const { levels, players } = await getCompletionFormOptions()

  return (
    <main className="admin-page">
      <div className="admin-form-content">
        <Link href="/admin/completions" className="back-link">
          <span aria-hidden="true">←</span> Back to Completion Management
        </Link>
        <header>
          <h1 className="admin-page-title">Create New Completion</h1>
        </header>
        <CompletionForm levels={levels} players={players} />
      </div>
    </main>
  )
}
