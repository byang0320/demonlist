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
      <div className="pointer-events-none fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
        <div className="pointer-events-auto">
          <AdminAuthControls />
        </div>
      </div>
      {children}
    </>
  )
}
