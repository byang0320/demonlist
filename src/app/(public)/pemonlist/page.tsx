import { redirect } from 'next/navigation'

export const metadata = { title: 'Platformer Demonlist' }

export const dynamic = 'force-dynamic'

export default function PemonListPage() {
  redirect('/demonlist?type=platformer')
}
