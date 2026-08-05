import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function AdminPemonListPage() {
  redirect('/admin/demonlist?type=platformer')
}
