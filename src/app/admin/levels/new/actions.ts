'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import {
  createLevel,
  LEVEL_NAME_PUBLISHER_CONFLICT,
} from '@/features/levels/actions'
import {
  createLevelSchema,
  getLevelFormSubmittedValues,
  type CreateLevelInput,
  type LevelFormSubmittedValues,
} from '@/features/levels/schemas'
import { requireAdmin } from '@/lib/auth'

export type LevelActionState = {
  fieldErrors?: Partial<Record<keyof CreateLevelInput, string[]>>
  formError?: string
  values?: LevelFormSubmittedValues
}

export type CreateLevelActionState = LevelActionState

export async function createLevelAction(
  _previousState: LevelActionState,
  formData: FormData,
): Promise<LevelActionState> {
  await requireAdmin()

  const values = getLevelFormSubmittedValues(formData)
  const parsed = createLevelSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values,
    }
  }

  let createdLevel: Awaited<ReturnType<typeof createLevel>>

  try {
    createdLevel = await createLevel(parsed.data)
  } catch (error) {
    console.error('Unable to create level', error)

    return {
      formError:
        error instanceof Error && error.message.startsWith('Rank must be')
          ? error.message
          : error instanceof Error && error.message === LEVEL_NAME_PUBLISHER_CONFLICT
            ? error.message
          : 'Unable to create the level. Check that the slug and proposed rank are available.',
      values,
    }
  }

  revalidatePath('/')
  revalidatePath('/demonlist')
  revalidatePath('/admin/demonlist')

  redirect(createdLevel.type === 'Classic' ? '/admin/demonlist' : '/admin/demonlist?type=platformer')
}
