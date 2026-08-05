import { Prisma } from '@prisma/client'

import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/slugs'
import type { CreateLevelInput, UpdateLevelInput } from '@/features/levels/schemas'

type ReorderableLevel = {
  id: string
  rank: number
}

export const LEVEL_NAME_PUBLISHER_CONFLICT =
  'A level with this name and publisher already exists.'

async function getUniqueLevelSlug(
  tx: Prisma.TransactionClient,
  input: { name: string; publishedBy: string; slug: string },
  excludeId?: string,
) {
  const duplicate = await tx.level.findFirst({
    where: {
      ...(excludeId ? { id: { not: excludeId } } : {}),
      name: { equals: input.name, mode: 'insensitive' },
      publishedBy: { equals: input.publishedBy, mode: 'insensitive' },
    },
    select: { id: true },
  })

  if (duplicate) {
    throw new Error(LEVEL_NAME_PUBLISHER_CONFLICT)
  }

  if (excludeId) {
    const submittedSlug = await tx.level.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    })

    if (submittedSlug?.id === excludeId) {
      return input.slug
    }
  }

  const baseSlug = slugify(input.name)
  const baseOwner = await tx.level.findUnique({
    where: { slug: baseSlug },
    select: { id: true },
  })

  if (!baseOwner || baseOwner.id === excludeId) {
    return baseSlug
  }

  const publisherSlug = slugify(input.publishedBy) || 'publisher'
  const suffixBase = `${baseSlug}-${publisherSlug}`.slice(0, 100)
  let candidate = suffixBase
  let suffix = 2

  while (true) {
    const owner = await tx.level.findUnique({
      where: { slug: candidate },
      select: { id: true },
    })

    if (!owner || owner.id === excludeId) {
      return candidate
    }

    const numericSuffix = `-${suffix}`
    candidate = `${suffixBase.slice(0, 100 - numericSuffix.length)}${numericSuffix}`
    suffix += 1
  }
}

/**
 * Create a level and insert it into the rank sequence for its type.
 * Active levels use the proposed rank; archived levels are appended after the
 * type's existing ranks so they do not create gaps in a public list.
 */
export async function createLevel(input: CreateLevelInput) {
  return prisma.$transaction(async (tx) => {
    const slug = await getUniqueLevelSlug(tx, input)
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
        slug,
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
 * Update a level while rebuilding the affected type rank sequences.
 * Rank changes and type changes are handled in one transaction.
 */
export async function updateLevel(input: UpdateLevelInput) {
  return prisma.$transaction(async (tx) => {
    const slug = await getUniqueLevelSlug(tx, input, input.id)
    const currentLevel = await tx.level.findUnique({
      where: { id: input.id },
      select: {
        id: true,
        type: true,
        status: true,
      },
    })

    if (!currentLevel) {
      throw new Error('Level not found')
    }

    if (input.type !== currentLevel.type) {
      throw new Error('A level type cannot be changed after creation')
    }

    const types = [currentLevel.type, input.type].filter(
      (type, index, allTypes) => allTypes.indexOf(type) === index,
    )
    const levels = await tx.level.findMany({
      where: { type: { in: types } },
      select: {
        id: true,
        type: true,
        status: true,
        rank: true,
      },
      orderBy: { rank: 'asc' },
    })
    const otherLevels = levels.filter((level) => level.id !== input.id)
    const targetLevels = otherLevels.filter((level) => level.type === input.type)
    const targetActiveLevels = targetLevels.filter((level) => level.status === 'ACTIVE')
    const targetArchivedLevels = targetLevels.filter((level) => level.status === 'ARCHIVED')

    if (input.status === 'ACTIVE' && input.rank > targetActiveLevels.length + 1) {
      throw new Error(`Rank must be between 1 and ${targetActiveLevels.length + 1}`)
    }

    const targetActive = [...targetActiveLevels]
    const targetArchived = [...targetArchivedLevels]

    if (input.status === 'ACTIVE') {
      targetActive.splice(input.rank - 1, 0, {
        id: input.id,
        type: input.type,
        status: 'ACTIVE',
        rank: input.rank,
      })
    } else {
      targetArchived.push({
        id: input.id,
        type: input.type,
        status: 'ARCHIVED',
        rank: targetActive.length + targetArchived.length + 1,
      })
    }

    const finalLevels = [...targetActive, ...targetArchived]
    const sourceLevels = otherLevels.filter((level) => level.type === currentLevel.type && level.type !== input.type)
    const finalRanks = new Map<string, number>()

    finalLevels.forEach((level, index) => finalRanks.set(level.id, index + 1))
    sourceLevels.forEach((level, index) => finalRanks.set(level.id, index + 1))

    // Temporarily free every affected type's unique rank values before writing
    // the final sequences, since rows may move into one another's old ranks.
    for (const [index, level] of levels.entries()) {
      await tx.level.update({
        where: { id: level.id },
        data: { rank: -(index + 1) },
      })
    }

    for (const level of levels) {
      const finalRank = finalRanks.get(level.id)

      if (finalRank === undefined) {
        continue
      }

      await tx.level.update({
        where: { id: level.id },
        data: { rank: finalRank },
      })
    }

    return tx.level.update({
      where: { id: input.id },
      data: {
        name: input.name,
        slug,
        type: input.type,
        demoted: input.demoted,
        unrated: input.unrated,
        publishedBy: input.publishedBy,
        createdBy: input.createdBy,
        verifiedBy: input.verifiedBy,
        description: input.description,
        thumbnailUrl: input.thumbnailUrl,
        externalUrl: input.externalUrl,
        status: input.status,
        rank: finalRanks.get(input.id) ?? input.rank,
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
