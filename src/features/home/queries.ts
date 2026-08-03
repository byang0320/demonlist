import { prisma } from '@/lib/db'

export function getHomePageData() {
  return Promise.all([
    prisma.level.count({
      where: { status: 'ACTIVE' },
    }),
    prisma.completion.count({
      where: {
        level: { status: 'ACTIVE' },
      },
    }),
    prisma.completion.findFirst({
      where: {
        level: { status: 'ACTIVE' },
      },
      select: {
        level: {
          select: {
            name: true,
            slug: true,
            rank: true,
          },
        },
      },
      orderBy: {
        level: { rank: 'asc' },
      },
    }),
    prisma.completion.findMany({
      where: {
        level: {
          status: 'ACTIVE',
          rank: 1,
        },
      },
      select: {
        player: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        player: { name: 'asc' },
      },
    }),
    prisma.player.findMany({
      select: {
        name: true,
        slug: true,
        avatarUrl: true,
        _count: {
          select: {
            completions: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
  ]).then(([totalUniqueLevels, totalCompletions, hardestCompletion, rankOneCompletions, players]) => {
    const collator = new Intl.Collator('en', {
      sensitivity: 'base',
      numeric: false,
    })

    players.sort((left, right) => {
      const leftStartsWithNumber = /^\d/.test(left.name)
      const rightStartsWithNumber = /^\d/.test(right.name)

      if (leftStartsWithNumber !== rightStartsWithNumber) {
        return leftStartsWithNumber ? -1 : 1
      }

      return collator.compare(left.name, right.name)
    })

    return {
      stats: {
        totalCompletions,
        totalUniqueLevels,
        hardestLevel: hardestCompletion?.level ?? null,
        rankOnePlayers: rankOneCompletions.map(({ player }) => player.name),
      },
      players,
    }
  })
}
