'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createPlayer, isPlayerSlugConflict } from '@/features/players/actions'
import {
  createPlayerSchema,
  getPlayerFormSubmittedValues,
  type CreatePlayerInput,
  type PlayerFormSubmittedValues,
} from '@/features/players/schemas'
import { requireAdmin } from '@/lib/auth'

export type PlayerActionState = {
  fieldErrors?: Partial<Record<keyof CreatePlayerInput, string[]>>
  formError?: string
  values?: PlayerFormSubmittedValues
}

export async function createPlayerAction(
  _previousState: PlayerActionState,
  formData: FormData,
): Promise<PlayerActionState> {
  await requireAdmin()

  const values = getPlayerFormSubmittedValues(formData)
  const parsed = createPlayerSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values,
    }
  }

  let createdPlayer: Awaited<ReturnType<typeof createPlayer>>

  try {
    createdPlayer = await createPlayer(parsed.data)
  } catch (error) {
    console.error('Unable to create player', error)

    return {
      formError: isPlayerSlugConflict(error)
        ? 'A player with this slug already exists.'
        : 'Unable to create the player. Please try again.',
      values,
    }
  }

  revalidatePath('/')
  revalidatePath('/admin/players')
  revalidatePath(`/players/${createdPlayer.slug}`)

  redirect('/admin/players')
}
