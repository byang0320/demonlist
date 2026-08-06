import { prisma } from '@/lib/db'

export type LevelType = 'Classic' | 'Platformer'

export function getNextAvailableRank(type: LevelType) {
  return prisma.level
    .count({
      where: {
        status: 'ACTIVE',
        type,
      },
    })
    .then((count) => count + 1)
}

export function listRankedLevels(type: LevelType) {
  return prisma.level.findMany({
    where: {
      status: 'ACTIVE',
      type,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      rank: true,
      type: true,
      demoted: true,
      unrated: true,
      publishedBy: true,
      createdBy: true,
      verifiedBy: true,
      videoUrl: true,
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
      type: true,
      demoted: true,
      unrated: true,
      publishedBy: true,
      createdBy: true,
      verifiedBy: true,
      description: true,
      videoUrl: true,
      status: true,
      completions: {
        select: {
          times: true,
          completedAt: true,
          videoUrl: true,
          player: {
            select: {
              id: true,
              name: true,
              slug: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: [
          {
            completedAt: {
              sort: 'asc',
              nulls: 'last',
            },
          },
          {
            player: {
              name: 'asc',
            },
          },
        ],
      },
      _count: {
        select: {
          completions: true,
        },
      },
    },
  })
}

export function getLevelForAdminBySlug(slug: string) {
  return prisma.level.findUnique({
    where: { slug },
    select: {
      id: true,
      ingameId: true,
      name: true,
      slug: true,
      rank: true,
      type: true,
      demoted: true,
      unrated: true,
      publishedBy: true,
      createdBy: true,
      verifiedBy: true,
      description: true,
      videoUrl: true,
      status: true,
    },
  })
}
