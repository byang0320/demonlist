import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '(Admin) Login',
  description: 'Sign in to manage the Stream VC Geometry Dash demonlist.',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children
}
