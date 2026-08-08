import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import AdminAuthControls from '@/components/admin/auth-controls'
import { getAdminSession } from '@/lib/auth'
import { isAdminEmail } from '@/lib/permissions'

export const metadata: Metadata = {
  title: {
    template: '(Admin) %s | Stream VC Demonlist',
    default: '(Admin) Demonlist',
  },
  description: 'Admin tools for the Stream VC Geometry Dash demonlist.',
}

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
      <div className="admin-auth-overlay">
        <div className="admin-auth-overlay-inner">
          <AdminAuthControls />
        </div>
      </div>
      {children}
    </>
  )
}
