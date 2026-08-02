import { prisma } from '@/lib/db'

export function getPlayerBySlugWithLevels(slug: string) {
  return prisma.player.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      bio: true,
      avatarUrl: true,
      externalUrl: true,
      completions: {
        select: {
          completedAt: true,
          level: {
            select: {
              id: true,
              name: true,
              slug: true,
              rank: true,
              creatorName: true,
              status: true,
            },
          },
        },
        orderBy: {
          level: {
            rank: 'asc',
          },
        },
      },
    },
  })
}
