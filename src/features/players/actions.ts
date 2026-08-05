import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/db'
import type { CreatePlayerInput } from '@/features/players/schemas'

export function createPlayer(input: CreatePlayerInput) {
  return prisma.player.create({
    data: input,
    select: {
      id: true,
      slug: true,
    },
  })
}

export function isPlayerSlugConflict(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}
