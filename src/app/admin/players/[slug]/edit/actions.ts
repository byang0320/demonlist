'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import {
  isPlayerSlugConflict,
  updatePlayer,
} from '@/features/players/actions'
import {
  getPlayerFormSubmittedValues,
  updatePlayerSchema,
} from '@/features/players/schemas'
import { requireAdmin } from '@/lib/auth'
import type { PlayerActionState } from '@/app/admin/players/new/actions'

export async function updatePlayerAction(
  playerId: string,
  _previousState: PlayerActionState,
  formData: FormData,
): Promise<PlayerActionState> {
  await requireAdmin()

  const values = getPlayerFormSubmittedValues(formData)
  const parsed = updatePlayerSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    id: playerId,
  })

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values,
    }
  }

  let updatedPlayer: Awaited<ReturnType<typeof updatePlayer>>

  try {
    updatedPlayer = await updatePlayer(parsed.data)
  } catch (error) {
    console.error('Unable to update player', error)

    return {
      formError: isPlayerSlugConflict(error)
        ? 'A player with this slug already exists.'
        : 'Unable to save the player. Please try again.',
      values,
    }
  }

  revalidatePath('/')
  revalidatePath('/admin/players')
  revalidatePath(`/players/${updatedPlayer.slug}`)

  redirect('/admin/players')
}
