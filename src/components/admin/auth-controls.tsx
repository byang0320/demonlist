'use client'

import { signOut } from 'next-auth/react'

export default function AdminAuthControls() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/admin/login' })}
      className="admin-auth-button"
    >
      Sign Out
    </button>
  )
}
