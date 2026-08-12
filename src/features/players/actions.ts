import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/db'
import type { CreatePlayerInput, UpdatePlayerInput } from '@/features/players/schemas'

export function createPlayer(input: CreatePlayerInput) {
  return prisma.player.create({
    data: input,
    select: {
      id: true,
      slug: true,
    },
  })
}

export function updatePlayer(input: UpdatePlayerInput) {
  return prisma.player.update({
    where: { id: input.id },
    data: {
      name: input.name,
      slug: input.slug,
      bio: input.bio,
      avatarUrl: input.avatarUrl,
      youtubeUrl: input.youtubeUrl,
      twitchUrl: input.twitchUrl,
      discordHandle: input.discordHandle,
      twitterUrl: input.twitterUrl,
      country1: input.country1 ?? null,
      country2: input.country2 ?? null,
    },
    select: {
      id: true,
      slug: true,
    },
  })
}

export function isPlayerSlugConflict(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}
