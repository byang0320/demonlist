// TEST SEED FILE

import { prisma } from '../src/lib/db'

async function main() {
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@example.com' },
    update: {
      name: 'Demon List Admin',
    },
    create: {
      email: 'admin@example.com',
      name: 'Demon List Admin',
    },
  })

  const levels = await Promise.all([
    prisma.level.upsert({
      where: { slug: 'silent-clubstep' },
      update: {
        ingameId: 1,
        name: 'Silent Clubstep',
        rank: 1,
        type: 'Classic',
        publishedBy: 'Pointercrate',
        createdBy: 'true nature',
        status: 'ACTIVE',
      },
      create: {
        ingameId: 1,
        name: 'Silent Clubstep',
        slug: 'silent-clubstep',
        rank: 1,
        type: 'Classic',
        publishedBy: 'Pointercrate',
        createdBy: 'true nature',
      },
    }),
    prisma.level.upsert({
      where: { slug: 'slaughterhouse' },
      update: {
        ingameId: 2,
        name: 'Slaughterhouse',
        rank: 2,
        type: 'Classic',
        publishedBy: 'Pointercrate',
        createdBy: 'icing山',
        status: 'ACTIVE',
      },
      create: {
        ingameId: 2,
        name: 'Slaughterhouse',
        slug: 'slaughterhouse',
        rank: 2,
        type: 'Classic',
        publishedBy: 'Pointercrate',
        createdBy: 'icing山',
      },
    }),
    prisma.level.upsert({
      where: { slug: 'acheron' },
      update: {
        ingameId: 3,
        name: 'Acheron',
        rank: 3,
        type: 'Classic',
        publishedBy: 'Pointercrate',
        createdBy: 'Ryamu',
        status: 'ACTIVE',
      },
      create: {
        ingameId: 3,
        name: 'Acheron',
        slug: 'acheron',
        rank: 3,
        type: 'Classic',
        publishedBy: 'Pointercrate',
        createdBy: 'Ryamu',
      },
    }),
    prisma.level.upsert({
      where: { slug: 'tartarus' },
      update: {
        ingameId: 4,
        name: 'Tartarus',
        rank: 4,
        type: 'Classic',
        publishedBy: 'Pointercrate',
        createdBy: 'Riot',
        status: 'ACTIVE',
      },
      create: {
        ingameId: 4,
        name: 'Tartarus',
        slug: 'tartarus',
        rank: 4,
        type: 'Classic',
        publishedBy: 'Pointercrate',
        createdBy: 'Riot',
      },
    }),
    prisma.level.upsert({
      where: { slug: 'the-golden' },
      update: {
        ingameId: 5,
        name: 'The Golden',
        rank: 5,
        type: 'Classic',
        publishedBy: 'Pointercrate',
        createdBy: 'BoBoBoBoBoBoBo',
        status: 'ACTIVE',
      },
      create: {
        ingameId: 5,
        name: 'The Golden',
        slug: 'the-golden',
        rank: 5,
        type: 'Classic',
        publishedBy: 'Pointercrate',
        createdBy: 'BoBoBoBoBoBoBo',
      },
    }),
  ])

  const players = await Promise.all([
    prisma.player.upsert({
      where: { slug: 'player-one' },
      update: { name: 'Player One' },
      create: {
        name: 'Player One',
        slug: 'player-one',
        bio: 'A sample player profile.',
      },
    }),
    prisma.player.upsert({
      where: { slug: 'player-two' },
      update: { name: 'Player Two' },
      create: {
        name: 'Player Two',
        slug: 'player-two',
      },
    }),
    prisma.player.upsert({
      where: { slug: 'player-three' },
      update: { name: 'Player Three' },
      create: {
        name: 'Player Three',
        slug: 'player-three',
      },
    }),
    prisma.player.upsert({
      where: { slug: 'player-four' },
      update: { name: 'Player Four' },
      create: {
        name: 'Player Four',
        slug: 'player-four',
      },
    }),
  ])

  const completionData = [
    { playerId: players[0].id, levelId: levels[0].id, completedAt: new Date('2026-01-12') },
    { playerId: players[0].id, levelId: levels[2].id, completedAt: new Date('2026-02-03') },
    { playerId: players[1].id, levelId: levels[1].id, completedAt: new Date('2026-01-25') },
    { playerId: players[1].id, levelId: levels[3].id, completedAt: new Date('2026-02-18') },
    { playerId: players[2].id, levelId: levels[0].id, completedAt: new Date('2026-03-01') },
    { playerId: players[2].id, levelId: levels[4].id, completedAt: new Date('2026-03-15') },
    { playerId: players[3].id, levelId: levels[2].id, completedAt: new Date('2026-03-22') },
  ]

  for (const completion of completionData) {
    await prisma.completion.upsert({
      where: {
        playerId_levelId: {
          playerId: completion.playerId,
          levelId: completion.levelId,
        },
      },
      update: {
        completedAt: completion.completedAt,
      },
      create: completion,
    })
  }

  console.log(`Seeded administrator: ${admin.email}`)
  console.log(`Seeded ${levels.length} levels, ${players.length} players, and ${completionData.length} completions.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
