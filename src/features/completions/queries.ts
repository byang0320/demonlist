import { prisma } from '@/lib/db'

export function getCompletionFormOptions() {
  return Promise.all([
    prisma.level.findMany({
      select: {
        id: true,
        name: true,
        publishedBy: true,
      },
      orderBy: { name: 'asc' },
    }),
    prisma.player.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    }),
  ]).then(([levels, players]) => ({ levels, players }))
}

export function getCompletionForAdmin(id: string) {
  return prisma.completion.findUnique({
    where: { id },
    select: {
      id: true,
      playerId: true,
      levelId: true,
      times: true,
      completedAt: true,
      videoUrl: true,
      notes: true,
      player: {
        select: { name: true },
      },
      level: {
        select: { name: true, publishedBy: true },
      },
    },
  })
}

export function listCompletionsForAdmin(filters?: { levelId?: string; playerId?: string }) {
  return prisma.completion.findMany({
    where: {
      ...(filters?.levelId ? { levelId: filters.levelId } : {}),
      ...(filters?.playerId ? { playerId: filters.playerId } : {}),
    },
    select: {
      id: true,
      createdAt: true,
      completedAt: true,
      player: {
        select: { name: true },
      },
      level: {
        select: {
          name: true,
          publishedBy: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}
