'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import {
  COMPLETION_DUPLICATE_ERROR,
  COMPLETION_REFERENCE_ERROR,
  updateCompletion,
} from '@/features/completions/actions'
import {
  getCompletionFormSubmittedValues,
  updateCompletionSchema,
} from '@/features/completions/schemas'
import { requireAdmin } from '@/lib/auth'
import type { CompletionActionState } from '@/app/admin/completions/new/actions'

export async function updateCompletionAction(
  completionId: string,
  _previousState: CompletionActionState,
  formData: FormData,
): Promise<CompletionActionState> {
  await requireAdmin()

  const values = getCompletionFormSubmittedValues(formData)
  const parsed = updateCompletionSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    id: completionId,
  })

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values,
    }
  }

  try {
    await updateCompletion(parsed.data)
  } catch (error) {
    console.error('Unable to update completion', error)

    return {
      formError:
        error instanceof Error &&
        [COMPLETION_DUPLICATE_ERROR, COMPLETION_REFERENCE_ERROR, 'Completion not found.'].includes(error.message)
          ? error.message
          : 'Unable to save the completion. Please try again.',
      values,
    }
  }

  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/admin/completions')
  revalidatePath('/demonlist')

  redirect('/admin/completions')
}
