export default async function EditLevelPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <h1>Edit Level: {id}</h1>
}
