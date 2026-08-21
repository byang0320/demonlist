'use client'

import { useState } from 'react'

import { deleteCompletionAction } from '@/app/admin/completions/actions'

export default function DeleteCompletionButton({
  completionId,
  levelName,
  playerName,
}: {
  completionId: string
  levelName: string
  playerName: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const action = deleteCompletionAction.bind(null, completionId)

  return (
    <>
      <button
        type="button"
        className="admin-delete-button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
      >
        Delete
      </button>

      {isOpen ? (
        <div
          className="admin-confirmation-backdrop"
          role="presentation"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="admin-confirmation-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-completion-title-${completionId}`}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id={`delete-completion-title-${completionId}`} className="admin-confirmation-title">
              Are you sure you want to delete the following completion?
            </h2>
            <p className="admin-confirmation-detail">
              <strong>{levelName}</strong> completed by <strong>{playerName}</strong>
            </p>
            <div className="admin-confirmation-actions">
              <button
                type="button"
                className="admin-confirmation-cancel"
                onClick={() => setIsOpen(false)}
              >
                No, cancel
              </button>
              <form action={action} className="admin-confirmation-delete-form">
                <button type="submit" className="admin-confirmation-delete">
                  Yes, delete
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
