import { prisma } from '@/lib/db'
import type { LevelType } from '@/features/levels/queries'

function getLevelTypeStats(type: LevelType) {
  const activeLevel = { status: 'ACTIVE' as const, type }
  const cleanLevel = { ...activeLevel, demoted: false, unrated: false }

  return Promise.all([
    prisma.completion.count({
      where: { level: cleanLevel },
    }),
    prisma.completion.count({
      where: { level: { ...activeLevel, demoted: true } },
    }),
    prisma.completion.count({
      where: { level: { ...activeLevel, unrated: true } },
    }),
    prisma.level.count({ where: cleanLevel }),
    prisma.level.count({ where: { ...activeLevel, demoted: true } }),
    prisma.level.count({ where: { ...activeLevel, unrated: true } }),
    prisma.level.findFirst({
      where: activeLevel,
      select: {
        ingameId: true,
        name: true,
        slug: true,
        rank: true,
        completions: {
          select: {
            player: {
              select: { name: true },
            },
          },
          orderBy: {
            player: { name: 'asc' },
          },
        },
      },
      orderBy: { rank: 'asc' },
    }),
  ]).then(
    ([
      totalCompletions,
      demotedCompletions,
      unratedCompletions,
      totalUniqueLevels,
      demotedUniqueLevels,
      unratedUniqueLevels,
      hardestLevel,
    ]) => ({
      totalCompletions,
      demotedCompletions,
      unratedCompletions,
      totalUniqueLevels,
      demotedUniqueLevels,
      unratedUniqueLevels,
      hardestLevel: hardestLevel
          ? {
            ingameId: hardestLevel.ingameId,
            name: hardestLevel.name,
            slug: hardestLevel.slug,
            rank: hardestLevel.rank,
            players: hardestLevel.completions.map(({ player }) => player.name),
          }
        : null,
    }),
  )
}

export function getHomePageData() {
  return Promise.all([
    getLevelTypeStats('Classic'),
    getLevelTypeStats('Platformer'),
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
  ]).then(([classic, platformer, players]) => {
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
        classic,
        platformer,
      },
      players,
    }
  })
}
