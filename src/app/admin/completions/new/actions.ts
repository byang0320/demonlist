'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import {
  COMPLETION_DUPLICATE_ERROR,
  COMPLETION_REFERENCE_ERROR,
  createCompletion,
} from '@/features/completions/actions'
import {
  addCompletionSchema,
  getCompletionFormSubmittedValues,
  type AddCompletionInput,
  type CompletionFormSubmittedValues,
} from '@/features/completions/schemas'
import { requireAdmin } from '@/lib/auth'

export type CompletionActionState = {
  fieldErrors?: Partial<Record<keyof AddCompletionInput, string[]>>
  formError?: string
  values?: CompletionFormSubmittedValues
}

export async function createCompletionAction(
  _previousState: CompletionActionState,
  formData: FormData,
): Promise<CompletionActionState> {
  await requireAdmin()

  const values = getCompletionFormSubmittedValues(formData)
  const parsed = addCompletionSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values,
    }
  }

  try {
    await createCompletion(parsed.data)
  } catch (error) {
    console.error('Unable to create completion', error)

    return {
      formError:
        error instanceof Error &&
        [COMPLETION_DUPLICATE_ERROR, COMPLETION_REFERENCE_ERROR].includes(error.message)
          ? error.message
          : 'Unable to create the completion. Please try again.',
      values,
    }
  }

  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/admin/completions')
  revalidatePath('/demonlist')

  redirect('/admin/completions')
}
