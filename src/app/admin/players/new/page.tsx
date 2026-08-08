import PlayerForm from '@/components/admin/PlayerForm'

export const metadata = { title: 'Create New Player' }

export default function NewPlayerPage() {
  return (
    <main className="admin-page">
      <div className="admin-form-content">
        <header>
          <h1 className="admin-page-title">Create New Player</h1>
          <p className="admin-page-description">
            Add a new player to the Stream VC demonlist.
          </p>
        </header>
        <PlayerForm />
      </div>
    </main>
  )
}
