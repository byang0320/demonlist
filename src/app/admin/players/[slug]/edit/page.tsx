export default async function EditPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <h1>Edit Player: {id}</h1>
}
