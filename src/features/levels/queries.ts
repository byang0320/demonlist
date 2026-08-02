import { prisma } from '@/lib/db'

export function listRankedLevels() {
  return prisma.level.findMany({
    where: {
      status: 'ACTIVE',
    },
    select: {
      id: true,
      name: true,
      slug: true,
      rank: true,
      creatorName: true,
      thumbnailUrl: true,
      _count: {
        select: {
          completions: true,
        },
      },
    },
    orderBy: {
      rank: 'asc',
    },
  })
}

export function getLevelBySlugWithPlayers(slug: string) {
  return prisma.level.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      rank: true,
      creatorName: true,
      description: true,
      thumbnailUrl: true,
      externalUrl: true,
      status: true,
      completions: {
        select: {
          completedAt: true,
          player: {
            select: {
              id: true,
              name: true,
              slug: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          player: {
            name: 'asc',
          },
        },
      },
      _count: {
        select: {
          completions: true,
        },
      },
    },
  })
}
