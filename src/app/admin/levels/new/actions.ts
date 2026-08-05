'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createLevel } from '@/features/levels/actions'
import { createLevelSchema, type CreateLevelInput } from '@/features/levels/schemas'
import { requireAdmin } from '@/lib/auth'

export type LevelActionState = {
  fieldErrors?: Partial<Record<keyof CreateLevelInput, string[]>>
  formError?: string
}

export type CreateLevelActionState = LevelActionState

export async function createLevelAction(
  _previousState: LevelActionState,
  formData: FormData,
): Promise<LevelActionState> {
  await requireAdmin()

  const parsed = createLevelSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
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
          : 'Unable to create the level. Check that the slug and proposed rank are available.',
    }
  }

  revalidatePath('/')
  revalidatePath('/demonlist')
  revalidatePath('/admin/demonlist')

  redirect(createdLevel.type === 'Classic' ? '/admin/demonlist' : '/admin/demonlist?type=platformer')
}
