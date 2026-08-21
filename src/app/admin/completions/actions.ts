'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { deleteCompletion } from '@/features/completions/actions'
import { requireAdmin } from '@/lib/auth'

export async function deleteCompletionAction(completionId: string, _formData: FormData) {
  void _formData
  await requireAdmin()
  await deleteCompletion(completionId)

  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/admin/completions')
  revalidatePath('/demonlist')

  redirect('/admin/completions')
}
