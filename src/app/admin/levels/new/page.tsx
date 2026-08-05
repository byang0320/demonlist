import LevelForm from '@/components/admin/LevelForm'
import { getNextAvailableRank } from '@/features/levels/queries'

export default async function NewLevelPage() {
  const [classicMaxRank, platformerMaxRank] = await Promise.all([
    getNextAvailableRank('Classic'),
    getNextAvailableRank('Platformer'),
  ])

  return (
    <main className="min-h-screen bg-[#080b14] px-4 py-8 text-[#f4f6ff] sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-240">
        <header>
          <h1 className="mt-3 text-4xl font-bold sm:text-6xl">Create New Level</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#b9c2d8]">
            Add a new level to a list.
          </p>
        </header>
        <LevelForm maxRanks={{ Classic: classicMaxRank, Platformer: platformerMaxRank }} />
      </div>
    </main>
  )
}
