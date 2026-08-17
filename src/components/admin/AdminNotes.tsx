'use client'

import { useActionState, useEffect, useRef, useState } from 'react'

import {
  saveAdminNotesAction,
  type AdminNotesActionState,
} from '@/features/admin/actions'

export default function AdminNotes({ initialNotes }: { initialNotes: string }) {
  const [state, formAction, pending] = useActionState<AdminNotesActionState, FormData>(
    saveAdminNotesAction,
    {},
  )
  const [notes, setNotes] = useState(initialNotes)
  const [editStatus, setEditStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved')
  const formRef = useRef<HTMLFormElement>(null)
  const savedNotesRef = useRef(initialNotes)
  const submittedNotesRef = useRef<string | null>(null)
  const failedNotesRef = useRef<string | null>(null)
  const leaveWarningRef = useRef(false)

  useEffect(() => {
    if (state.saved && submittedNotesRef.current !== null) {
      savedNotesRef.current = submittedNotesRef.current
      submittedNotesRef.current = null
      failedNotesRef.current = null
    }

    if (state.error && submittedNotesRef.current !== null) {
      failedNotesRef.current = submittedNotesRef.current
      submittedNotesRef.current = null
    }
  }, [state.saved, state.error])

  useEffect(() => {
    if (pending || notes === savedNotesRef.current || notes === failedNotesRef.current) {
      return
    }

    const timeout = window.setTimeout(() => {
      formRef.current?.requestSubmit()
    }, 1500)

    return () => window.clearTimeout(timeout)
  }, [notes, pending])

  useEffect(() => {
    leaveWarningRef.current = pending || notes !== savedNotesRef.current
  }, [notes, pending])

  useEffect(() => {
    const warningMessage = 'Your admin notes are still being saved. Leave this page?'

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!leaveWarningRef.current) {
        return
      }

      event.preventDefault()
      event.returnValue = ''
    }

    const handleNavigationClick = (event: MouseEvent) => {
      if (
        !leaveWarningRef.current
        || event.defaultPrevented
        || event.button !== 0
        || event.metaKey
        || event.ctrlKey
        || event.shiftKey
        || event.altKey
      ) {
        return
      }

      const target = event.target
      if (!(target instanceof Element)) {
        return
      }

      const link = target.closest('a[href]') as HTMLAnchorElement | null
      const button = target.closest('button') as HTMLButtonElement | null
      const isExternalButton = button && button.form !== formRef.current

      if (
        (!link && !isExternalButton)
        || link?.target
        || link?.hasAttribute('download')
        || link?.getAttribute('href')?.startsWith('#')
      ) {
        return
      }

      if (!window.confirm(warningMessage)) {
        event.preventDefault()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('click', handleNavigationClick, true)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('click', handleNavigationClick, true)
    }
  }, [])

  const statusMessage = pending
    ? 'Saving…'
    : state.error
      ? state.error
      : editStatus === 'unsaved'
        ? 'Unsaved changes'
        : state.saved
          ? 'Saved automatically.'
          : 'Saved.'
  const statusClassName = pending
    ? 'admin-notes-status-saving'
    : state.error || editStatus === 'unsaved'
      ? 'admin-notes-status-unsaved'
      : 'admin-notes-status-saved'

  return (
    <form
      ref={formRef}
      action={formAction}
      className="admin-notes-panel"
      onSubmit={() => {
        submittedNotesRef.current = notes
        setEditStatus('saving')
      }}
    >
      <textarea
        name="notes"
        className="form-input admin-notes-textarea"
        value={notes}
        onChange={(event) => {
          setNotes(event.target.value)
          setEditStatus('unsaved')
          failedNotesRef.current = null
        }}
        placeholder="Write down notes, issues, or reminders for the admin team..."
        aria-label="Admin notes"
      />
      <div className="admin-notes-actions">
        <p
          className={`admin-notes-status ${statusClassName}`}
          role={state.error ? 'alert' : 'status'}
          aria-live="polite"
        >
          {statusMessage}
        </p>
      </div>
    </form>
  )
}
