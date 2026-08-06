import { redirect } from 'next/navigation'

export const metadata = { title: 'Demonlist' }

export default function PlayersRedirect() {
  redirect('/')
}
