import { DemonList } from '@/components/public/demon-list'

export const dynamic = 'force-dynamic'

export default async function DemonListPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const type = (await searchParams).type === 'platformer' ? 'Platformer' : 'Classic'

  return <DemonList initialType={type} />
}
