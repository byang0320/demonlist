'use server'

import { revalidatePath } from 'next/cache'

import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export type AdminNotesActionState = {
  saved?: boolean
  error?: string
}

export async function saveAdminNotesAction(
  _previousState: AdminNotesActionState,
  formData: FormData,
): Promise<AdminNotesActionState> {
  await requireAdmin()

  const notes = formData.get('notes')
  if (typeof notes !== 'string') {
    return { error: 'Unable to save the notes.' }
  }

  try {
    await prisma.adminNote.upsert({
      where: { id: 'global' },
      create: { id: 'global', content: notes },
      update: { content: notes },
    })
  } catch (error) {
    console.error('Unable to save admin notes', error)
    return { error: 'Unable to save the notes. Please try again.' }
  }

  revalidatePath('/admin')
  return { saved: true }
}
