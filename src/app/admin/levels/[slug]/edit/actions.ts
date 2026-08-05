'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import {
  LEVEL_NAME_PUBLISHER_CONFLICT,
  updateLevel,
} from '@/features/levels/actions'
import { getLevelFormSubmittedValues, updateLevelSchema } from '@/features/levels/schemas'
import { requireAdmin } from '@/lib/auth'
import type { LevelActionState } from '@/app/admin/levels/new/actions'

export async function updateLevelAction(
  levelId: string,
  _previousState: LevelActionState,
  formData: FormData,
): Promise<LevelActionState> {
  await requireAdmin()

  const values = getLevelFormSubmittedValues(formData)
  const parsed = updateLevelSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    id: levelId,
  })

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values,
    }
  }

  let updatedLevel: Awaited<ReturnType<typeof updateLevel>>

  try {
    updatedLevel = await updateLevel(parsed.data)
  } catch (error) {
    console.error('Unable to update level', error)

    return {
      formError:
        error instanceof Error && error.message.startsWith('Rank must be')
          ? error.message
          : error instanceof Error && error.message === LEVEL_NAME_PUBLISHER_CONFLICT
            ? error.message
          : 'Unable to save the level. Check that the slug and proposed rank are available.',
      values,
    }
  }

  revalidatePath('/')
  revalidatePath('/demonlist')
  revalidatePath(`/levels/${updatedLevel.slug}`)
  revalidatePath('/admin/demonlist')

  redirect(updatedLevel.type === 'Classic' ? '/admin/demonlist' : '/admin/demonlist?type=platformer')
}
