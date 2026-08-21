import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/db'
import type {
  AddCompletionInput,
  UpdateCompletionInput,
} from '@/features/completions/schemas'

export const COMPLETION_DUPLICATE_ERROR =
  'This player already has a completion record for that level.'

export const COMPLETION_REFERENCE_ERROR =
  'The selected level or player could not be found.'

export async function createCompletion(input: AddCompletionInput) {
  const [level, player] = await Promise.all([
    prisma.level.findUnique({ where: { id: input.levelId }, select: { id: true } }),
    prisma.player.findUnique({ where: { id: input.playerId }, select: { id: true } }),
  ])

  if (!level || !player) {
    throw new Error(COMPLETION_REFERENCE_ERROR)
  }

  try {
    return await prisma.completion.create({
      data: input,
      select: {
        id: true,
        playerId: true,
        levelId: true,
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error(COMPLETION_DUPLICATE_ERROR)
    }

    throw error
  }
}

export async function updateCompletion(input: UpdateCompletionInput) {
  const existingCompletion = await prisma.completion.findUnique({
    where: { id: input.id },
    select: { id: true },
  })

  if (!existingCompletion) {
    throw new Error('Completion not found.')
  }

  try {
    return await prisma.completion.update({
      where: { id: input.id },
      data: {
        times: input.times,
        completedAt: input.completedAt,
        videoUrl: input.videoUrl,
        notes: input.notes,
      },
      select: {
        id: true,
        playerId: true,
        levelId: true,
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error(COMPLETION_DUPLICATE_ERROR)
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new Error('Completion not found.')
    }

    throw error
  }
}

export async function deleteCompletion(id: string) {
  try {
    return await prisma.completion.delete({
      where: { id },
      select: { id: true },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new Error('Completion not found.')
    }

    throw error
  }
}
