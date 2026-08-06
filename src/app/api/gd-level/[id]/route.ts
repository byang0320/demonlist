import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'Level ID must contain numbers only.' }, { status: 400 })
  }

  try {
    const response = await fetch(`https://gdbrowser.com/api/level/${id}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'That level could not be found.' }, { status: response.status })
    }

    return NextResponse.json(await response.json())
  } catch {
    return NextResponse.json({ error: 'The GD Browser API could not be reached.' }, { status: 502 })
  }
}
