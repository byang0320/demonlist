export default async function PlayerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return <h1>Player: {slug}</h1>
}
