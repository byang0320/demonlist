import LevelForm from '@/components/admin/LevelForm'
import { getNextAvailableRank } from '@/features/levels/queries'

export const metadata = { title: 'Create New Level' }

export default async function NewLevelPage() {
  const [classicMaxRank, platformerMaxRank] = await Promise.all([
    getNextAvailableRank('Classic'),
    getNextAvailableRank('Platformer'),
  ])

  return (
    <main className="admin-page">
      <div className="admin-form-content">
        <header>
          <h1 className="admin-page-title">Create New Level</h1>
          <p className="admin-page-description">
            Add a new level to a list.
          </p>
        </header>
        <LevelForm
          maxRanks={{ Classic: classicMaxRank, Platformer: platformerMaxRank }}
          allowAutofill
        />
      </div>
    </main>
  )
}
