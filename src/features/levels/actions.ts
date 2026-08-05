import { Prisma } from '@prisma/client'

import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { CreateLevelInput } from '@/features/levels/schemas'

type ReorderableLevel = {
  id: string
  rank: number
}

/**
 * Create a level and insert it into the rank sequence for its type.
 * Active levels use the proposed rank; archived levels are appended after the
 * type's existing ranks so they do not create gaps in a public list.
 */
export async function createLevel(input: CreateLevelInput) {
  return prisma.$transaction(async (tx) => {
    const levels = await tx.level.findMany({
      where: { type: input.type },
      select: {
        id: true,
        rank: true,
        status: true,
      },
      orderBy: { rank: 'asc' },
    })

    const activeLevels = levels.filter((level) => level.status === 'ACTIVE')
    const activeRanks = activeLevels.map((level, index) => index + 1)

    if (activeLevels.some((level, index) => level.rank !== activeRanks[index])) {
      throw new Error('Active levels must have contiguous ranks before creating a level')
    }

    const rank = input.status === 'ACTIVE' ? input.rank : levels.length + 1

    if (input.status === 'ACTIVE' && rank > activeLevels.length + 1) {
      throw new Error(`Rank must be between 1 and ${activeLevels.length + 1}`)
    }

    const levelsToShift = levels.filter((level) => level.rank >= rank)

    if (levelsToShift.length > 0) {
      // Move all rows in this type into a temporary negative range first so
      // the composite unique constraint cannot be hit during the shift.
      for (const [index, level] of levels.entries()) {
        await tx.level.update({
          where: { id: level.id },
          data: { rank: -(index + 1) },
        })
      }

      for (const level of levels) {
        await tx.level.update({
          where: { id: level.id },
          data: { rank: level.rank >= rank ? level.rank + 1 : level.rank },
        })
      }
    }

    return tx.level.create({
      data: {
        ...input,
        rank,
      },
      select: {
        id: true,
        slug: true,
        type: true,
        rank: true,
      },
    })
  })
}

/**
 * Move an active level to a new rank while keeping ranks unique within its type.
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
          type: true,
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
        where: {
          status: 'ACTIVE',
          type: currentLevel.type,
        },
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
          type: currentLevel.type,
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
          type: true,
          status: true,
        },
      })
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  )
}
