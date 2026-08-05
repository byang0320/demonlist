import { prisma } from '@/lib/db'

export type PlayerCompletionSort = 'alphabetical' | 'date'

const levelNameCollator = new Intl.Collator('en', {
  sensitivity: 'base',
  numeric: false,
})

function compareLevelCompletions(
  left: { level: { name: string; type: string } },
  right: { level: { name: string; type: string } },
) {
  const leftGroup = /^[0-9]/.test(left.level.name) ? 0 : /^[a-z]/i.test(left.level.name) ? 1 : 2
  const rightGroup = /^[0-9]/.test(right.level.name) ? 0 : /^[a-z]/i.test(right.level.name) ? 1 : 2

  if (leftGroup !== rightGroup) {
    return leftGroup - rightGroup
  }

  return (
    levelNameCollator.compare(left.level.name, right.level.name) ||
    levelNameCollator.compare(left.level.type, right.level.type)
  )
}

export function getPlayerBySlugWithLevels(
  slug: string,
  sort: PlayerCompletionSort = 'alphabetical',
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
              type: true,
              publishedBy: true,
              createdBy: true,
              verifiedBy: true,
              thumbnailUrl: true,
              status: true,
            },
          },
        },
      },
    },
  }).then((player) => {
    if (!player) {
      return player
    }

    const completions = [...player.completions]

    if (sort === 'date') {
      completions.sort((left, right) => {
        const leftDate = left.completedAt?.getTime() ?? Number.POSITIVE_INFINITY
        const rightDate = right.completedAt?.getTime() ?? Number.POSITIVE_INFINITY

        return leftDate - rightDate || compareLevelCompletions(left, right)
      })
    } else {
      completions.sort(compareLevelCompletions)
    }

    return { ...player, completions }
  })
}
