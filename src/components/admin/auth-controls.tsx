'use client'

import { signOut } from 'next-auth/react'

export default function AdminAuthControls() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/admin/login' })}
      className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-[#b9c2d8] transition hover:border-[#ae9dff]/50 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25 cursor-pointer"
    >
      Sign Out
    </button>
  )
}
