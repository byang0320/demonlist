import { prisma } from '@/lib/db'

export type PlayerCompletionSort = 'rank' | 'date'

export function getPlayerBySlugWithLevels(
  slug: string,
  sort: PlayerCompletionSort = 'rank',
) {
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
          videoUrl: true,
          level: {
            select: {
              id: true,
              name: true,
              slug: true,
              rank: true,
              publishedBy: true,
              createdBy: true,
              verifiedBy: true,
              thumbnailUrl: true,
              status: true,
            },
          },
        },
        orderBy:
          sort === 'date'
            ? [
                { completedAt: { sort: 'asc', nulls: 'last' } },
                { level: { rank: 'asc' } },
              ]
            : {
                level: {
                  rank: 'asc',
                },
              },
      },
    },
  })
}
