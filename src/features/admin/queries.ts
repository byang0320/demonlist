import { prisma } from '@/lib/db'

export async function getAdminDashboardCounts() {
  const [activeLevels, players, completions] = await Promise.all([
    prisma.level.count({
      where: {
        status: 'ACTIVE',
      },
    }),
    prisma.player.count(),
    prisma.completion.count(),
  ])

  return {
    activeLevels,
    players,
    completions,
  }
}
