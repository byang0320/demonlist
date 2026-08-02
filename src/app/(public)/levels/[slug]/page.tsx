export default async function LevelPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return <h1>Level: {slug}</h1>
}
