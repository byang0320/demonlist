import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'

import AdminAuthControls from '@/components/admin/auth-controls'
import { getAdminSession } from '@/lib/auth'
import { isAdminEmail } from '@/lib/permissions'

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getAdminSession()

  if (!session) {
    redirect('/admin/login')
  }

  if (!isAdminEmail(session.user?.email)) {
    redirect('/admin/login?error=unauthorized')
  }

  return (
    <>
      <header className="flex items-center justify-between border-b border-white/10 bg-[#111725] px-5 py-4 text-[#f4f6ff]">
        <span className="text-sm font-semibold">Demonlist Admin</span>
        <AdminAuthControls />
      </header>
      {children}
    </>
  )
}
