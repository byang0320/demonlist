import { Prisma } from '@prisma/client'

import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

type ReorderableLevel = {
  id: string
  rank: number
}

/**
 * Move an active level to a new rank while keeping all active ranks unique.
 *
 * The caller only needs to provide the level identity and its known rank. The
 * current row is read again inside the transaction so stale page data cannot
 * silently reorder the wrong range.
 */
export async function moveLevel(level: ReorderableLevel, newRank: number) {
  await requireAdmin()

  if (!Number.isInteger(newRank) || newRank < 1) {
    throw new Error('New rank must be a positive whole number')
  }

  return prisma.$transaction(
    async (tx) => {
      const currentLevel = await tx.level.findUnique({
        where: { id: level.id },
        select: {
          id: true,
          name: true,
          slug: true,
          rank: true,
          status: true,
        },
      })

      if (!currentLevel) {
        throw new Error('Level not found')
      }

      if (currentLevel.status !== 'ACTIVE') {
        throw new Error('Only active levels can be reordered')
      }

      if (currentLevel.rank === newRank) {
        return currentLevel
      }

      const activeLevels = await tx.level.findMany({
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          rank: true,
        },
        orderBy: { rank: 'asc' },
      })

      if (newRank > activeLevels.length) {
        throw new Error(`New rank must be between 1 and ${activeLevels.length}`)
      }

      const expectedRanks = activeLevels.map((activeLevel, index) => index + 1)
      const hasContiguousRanks = activeLevels.every(
        (activeLevel, index) => activeLevel.rank === expectedRanks[index],
      )

      if (!hasContiguousRanks) {
        throw new Error('Active levels must have contiguous ranks before reordering')
      }

      const rangeStart = Math.min(currentLevel.rank, newRank)
      const rangeEnd = Math.max(currentLevel.rank, newRank)
      const archivedLevelInRange = await tx.level.findFirst({
        where: {
          status: 'ARCHIVED',
          rank: {
            gte: rangeStart,
            lte: rangeEnd,
          },
        },
        select: { id: true },
      })

      if (archivedLevelInRange) {
        throw new Error('Cannot reorder across an archived level rank')
      }

      const affectedLevels = activeLevels.filter((activeLevel) => {
        if (newRank < currentLevel.rank) {
          return (
            activeLevel.rank >= newRank && activeLevel.rank < currentLevel.rank
          )
        }

        return (
          activeLevel.rank > currentLevel.rank && activeLevel.rank <= newRank
        )
      })

      // Move every row that would otherwise collide into a temporary range.
      // Negative ranks are temporary only; the transaction never commits them.
      await tx.level.update({
        where: { id: currentLevel.id },
        data: { rank: -1 },
      })

      for (const [index, affectedLevel] of affectedLevels.entries()) {
        await tx.level.update({
          where: { id: affectedLevel.id },
          data: { rank: -(index + 2) },
        })
      }

      const rankDelta = newRank < currentLevel.rank ? 1 : -1

      for (const affectedLevel of affectedLevels) {
        await tx.level.update({
          where: { id: affectedLevel.id },
          data: { rank: affectedLevel.rank + rankDelta },
        })
      }

      return tx.level.update({
        where: { id: currentLevel.id },
        data: { rank: newRank },
        select: {
          id: true,
          name: true,
          slug: true,
          rank: true,
          status: true,
        },
      })
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  )
}
