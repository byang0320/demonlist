import { prisma } from '@/lib/db'

export async function getAdminDashboardCounts() {
  const [classicLevels, platformerLevels, players, completions] = await Promise.all([
    prisma.level.count({
      where: {
        status: 'ACTIVE',
        type: 'Classic',
      },
    }),
    prisma.level.count({
      where: {
        status: 'ACTIVE',
        type: 'Platformer',
      },
    }),
    prisma.player.count(),
    prisma.completion.count(),
  ])

  return {
    activeLevels: {
      classic: classicLevels,
      platformer: platformerLevels,
    },
    players,
    completions,
  }
}
