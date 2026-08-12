'use client'

import { useActionState } from 'react'

import {
  saveAdminNotesAction,
  type AdminNotesActionState,
} from '@/features/admin/actions'

export default function AdminNotes({ initialNotes }: { initialNotes: string }) {
  const [state, formAction, pending] = useActionState<AdminNotesActionState, FormData>(
    saveAdminNotesAction,
    {},
  )

  return (
    <form action={formAction} className="admin-notes-panel">
      <textarea
        name="notes"
        className="form-input admin-notes-textarea"
        defaultValue={initialNotes}
        placeholder="Write down notes, issues, or reminders for the admin team..."
        aria-label="Admin notes"
      />
      <div className="admin-notes-actions">
        {state.saved && <p className="admin-notes-status" role="status">Notes saved.</p>}
        {state.error && <p className="form-error" role="alert">{state.error}</p>}
        <button type="submit" className="admin-save-notes-button" disabled={pending}>
          {pending ? 'Saving…' : 'Save Notes'}
        </button>
      </div>
    </form>
  )
}
