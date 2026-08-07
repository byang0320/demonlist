import 'dotenv/config'

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { prisma } from '../lib/db'
import { slugify } from '../lib/slugs'

type CsvRow = string[]

type LevelImport = {
  ingameId: number
  name: string
  slug: string
  rank: number
  type: 'Classic' | 'Platformer'
  demoted: boolean
  unrated: boolean
  publishedBy: string
  createdBy: string | null
  verifiedBy: string | null
  description: string | null
}

type PlayerImport = {
  name: string
  slug: string
}

type CompletionImport = {
  playerName: string
  levelName: string
  levelId: number
  times: number
  notes: string | null
}

const DATA_DIRECTORY = join(process.cwd(), 'src', 'data')

const LEVEL_HEADERS = [
  'Rank',
  'Level Name',
  'Level ID',
  'Level Type',
  'Unrated?',
  'Demoted?',
  'Published by',
  'Created by',
  'Verified by',
  'Description',
]

const PLAYER_HEADERS = ['Player Name']

const APPLICATION_TABLES = ['Completion', 'Level', 'Player', 'AdminUser'] as const

function normalizeWhitespace(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function matchKey(value: string) {
  return normalizeWhitespace(value).toLowerCase()
}

function parseCsv(text: string, fileName: string): CsvRow[] {
  const rows: CsvRow[] = []
  let row: CsvRow = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    const nextCharacter = text[index + 1]

    if (quoted) {
      if (character === '"' && nextCharacter === '"') {
        cell += '"'
        index += 1
      } else if (character === '"') {
        quoted = false
      } else {
        cell += character
      }
    } else if (character === '"') {
      quoted = true
    } else if (character === ',') {
      row.push(cell)
      cell = ''
    } else if (character === '\n') {
      row.push(cell.replace(/\r$/, ''))
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += character
    }
  }

  if (quoted) {
    throw new Error(`${fileName}: unterminated quoted field`)
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.replace(/\r$/, ''))
    rows.push(row)
  }

  return rows
}

function readCsv(fileName: string, expectedHeaders: string[]) {
  const filePath = join(DATA_DIRECTORY, fileName)
  const text = readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '')
  const rows = parseCsv(text, fileName)
  const headers = rows.shift()

  if (!headers || headers.length !== expectedHeaders.length || headers.some((header, index) => header !== expectedHeaders[index])) {
    throw new Error(
      `${fileName}: expected headers ${JSON.stringify(expectedHeaders)}, received ${JSON.stringify(headers ?? [])}`,
    )
  }

  rows.forEach((row, index) => {
    if (row.length !== expectedHeaders.length) {
      throw new Error(
        `${fileName}: row ${index + 2} has ${row.length} columns; expected ${expectedHeaders.length}`,
      )
    }
  })

  return rows
}

function parsePositiveInteger(value: string, field: string, context: string) {
  const normalized = normalizeWhitespace(value)
  const parsed = Number(normalized)

  if (!/^\d+$/.test(normalized) || !Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error(`${context}: ${field} must be a positive integer; received ${JSON.stringify(value)}`)
  }

  return parsed
}

function nullableText(value: string) {
  const normalized = normalizeWhitespace(value)
  return normalized || null
}

function parseBoolean(value: string, field: string, context: string) {
  const normalized = normalizeWhitespace(value).toLowerCase()

  if (!normalized) {
    return false
  }

  if (normalized === 'yeah') {
    return true
  }

  throw new Error(`${context}: ${field} must be blank or "yeah"; received ${JSON.stringify(value)}`)
}

function appendSlugSuffix(baseSlug: string, suffix: string) {
  const normalizedSuffix = slugify(suffix) || 'level'
  const separatorLength = normalizedSuffix.length + 1
  const base = baseSlug.slice(0, Math.max(1, 100 - separatorLength))
  return `${base}-${normalizedSuffix}`
}

function makeUniqueSlugs(levels: Omit<LevelImport, 'slug'>[]) {
  const baseCounts = new Map<string, number>()

  for (const level of levels) {
    const baseSlug = slugify(level.name) || `level-${level.ingameId}`
    baseCounts.set(baseSlug, (baseCounts.get(baseSlug) ?? 0) + 1)
  }

  const usedSlugs = new Set<string>()

  return levels.map((level) => {
    const baseSlug = slugify(level.name) || `level-${level.ingameId}`
    let candidate = baseCounts.get(baseSlug) === 1
      ? baseSlug
      : appendSlugSuffix(baseSlug, level.publishedBy)

    if (usedSlugs.has(candidate)) {
      candidate = appendSlugSuffix(candidate, String(level.ingameId))
    }

    if (usedSlugs.has(candidate)) {
      throw new Error(`Unable to generate a unique slug for level ${level.ingameId} (${level.name})`)
    }

    usedSlugs.add(candidate)
    return { ...level, slug: candidate }
  })
}

function buildLevels(rows: CsvRow[]) {
  const levelsWithoutSlugs: Omit<LevelImport, 'slug'>[] = []
  const ingameIds = new Set<number>()
  const ranksByType = new Map<string, Set<number>>()

  rows.forEach((row, index) => {
    const context = `level_profiles.csv row ${index + 2}`

    if (row.every((cell) => !normalizeWhitespace(cell))) {
      return
    }

    const rank = parsePositiveInteger(row[0], 'Rank', context)
    const name = normalizeWhitespace(row[1])
    const ingameId = parsePositiveInteger(row[2], 'Level ID', context)
    const type = normalizeWhitespace(row[3])
    const publishedBy = normalizeWhitespace(row[6])

    if (!name) {
      throw new Error(`${context}: Level Name is required`)
    }

    if (type !== 'Classic' && type !== 'Platformer') {
      throw new Error(`${context}: Level Type must be Classic or Platformer; received ${JSON.stringify(row[3])}`)
    }

    if (!publishedBy) {
      throw new Error(`${context}: Published by is required`)
    }

    if (ingameIds.has(ingameId)) {
      throw new Error(`${context}: duplicate Level ID ${ingameId}`)
    }

    const ranks = ranksByType.get(type) ?? new Set<number>()
    if (ranks.has(rank)) {
      throw new Error(`${context}: duplicate rank ${rank} for ${type}`)
    }

    ingameIds.add(ingameId)
    ranks.add(rank)
    ranksByType.set(type, ranks)

    const rawDescription = row[9].trim()
    const description = rawDescription || null
    levelsWithoutSlugs.push({
      ingameId,
      name,
      rank,
      type,
      demoted: parseBoolean(row[5], 'Demoted?', context),
      unrated: parseBoolean(row[4], 'Unrated?', context),
      publishedBy,
      createdBy: nullableText(row[7]),
      verifiedBy: nullableText(row[8]),
      description: description && !/^\(no description provided\)$/i.test(description)
        ? description
        : null,
    })
  })

  if (levelsWithoutSlugs.length !== 441) {
    throw new Error(`Expected 441 levels after removing blank separator rows; found ${levelsWithoutSlugs.length}`)
  }

  return makeUniqueSlugs(levelsWithoutSlugs)
}

function buildPlayers(rows: CsvRow[]) {
  const players: PlayerImport[] = []
  const names = new Set<string>()
  const slugs = new Set<string>()

  rows.forEach((row, index) => {
    const context = `player_names.csv row ${index + 2}`
    const name = normalizeWhitespace(row[0])

    if (!name) {
      throw new Error(`${context}: Player Name is required`)
    }

    const nameKey = matchKey(name)
    if (names.has(nameKey)) {
      throw new Error(`${context}: duplicate player name ${JSON.stringify(name)}`)
    }

    const slug = slugify(name)
    if (!slug || slugs.has(slug)) {
      throw new Error(`${context}: player name creates a duplicate or empty slug: ${JSON.stringify(name)}`)
    }

    names.add(nameKey)
    slugs.add(slug)
    players.push({ name, slug })
  })

  if (players.length !== 14) {
    throw new Error(`Expected 14 players; found ${players.length}`)
  }

  return players
}

function extractParentheticalValues(value: string) {
  return [...value.matchAll(/\(([^()]*)\)/g)].map((match) => normalizeWhitespace(match[1]))
}

function normalizeCompletionTitle(rawValue: string) {
  let title = normalizeWhitespace(rawValue)
  const partnerMatch = title.match(/\s+w\/\s+.+$/i)
  const partnerNote = partnerMatch?.[0].trim() ?? null

  if (partnerMatch) {
    title = title.slice(0, partnerMatch.index).trim()
  }

  title = title.replace(/\bx\s*~?\s*\d+\b/gi, '')
  title = title.replace(/\(\s*2p\s*,?\s*\)/gi, '(2P)')
  title = title.replace(/\(\s*solo\s*\)/gi, '(solo)')
  title = title.replace(/\(\s*,?\s*\)/g, '')
  title = normalizeWhitespace(title)

  return { title, partnerNote }
}

function stripNonOfficialParentheticals(value: string) {
  return normalizeWhitespace(
    value.replace(/\s*\((?!\s*(?:2P|solo)\s*\))[^()]*\)/gi, ' '),
  )
}

function parseCompletionCell(rawValue: string) {
  const raw = normalizeWhitespace(rawValue)
  const countMatches = [...raw.matchAll(/\bx\s*~?\s*(\d+)\b/gi)]

  if (countMatches.length > 1) {
    throw new Error(`Completion has multiple x-counts: ${JSON.stringify(rawValue)}`)
  }

  const times = countMatches.length === 1 ? Number(countMatches[0][1]) : 1
  const { title, partnerNote } = normalizeCompletionTitle(raw)
  const parentheticals = extractParentheticalValues(raw)
  const notes = [
    partnerNote,
    ...parentheticals.filter((value) => /(?:michi|normal|unnerfed)/i.test(value)),
  ]

  return {
    title,
    matchingTitle: stripNonOfficialParentheticals(title),
    times,
    notes: notes.length > 0 ? notes.join('; ') : null,
  }
}

function resolveLevel(rawValue: string, levels: LevelImport[], playerName: string) {
  const parsed = parseCompletionCell(rawValue)
  const exactKey = matchKey(parsed.title)
  const strippedKey = matchKey(parsed.matchingTitle)
  let candidates = levels.filter((level) => matchKey(level.name) === exactKey)

  if (candidates.length === 0) {
    candidates = levels.filter((level) => matchKey(level.name) === strippedKey)
  }

  if (candidates.length > 1) {
    const exactCaseCandidates = candidates.filter((level) => level.name === parsed.title)
    if (exactCaseCandidates.length === 1) {
      candidates = exactCaseCandidates
    }
  }

  if (candidates.length > 1) {
    const annotations = extractParentheticalValues(rawValue)
      .filter((value) => !/^(?:x\s*~?\s*\d+|2p|solo)$/i.test(value))
      .map(matchKey)

    const publisherCandidates = candidates.filter((level) =>
      annotations.includes(matchKey(level.publishedBy)),
    )

    if (publisherCandidates.length === 1) {
      candidates = publisherCandidates
    }
  }

  if (candidates.length === 0) {
    throw new Error(
      `Unable to match completion for ${playerName}: ${JSON.stringify(rawValue)} (normalized title: ${JSON.stringify(parsed.matchingTitle)})`,
    )
  }

  if (candidates.length > 1) {
    throw new Error(
      `Ambiguous completion for ${playerName}: ${JSON.stringify(rawValue)} matches ${candidates.map((level) => `${level.name} / ${level.publishedBy} / ${level.ingameId}`).join(', ')}`,
    )
  }

  return {
    level: candidates[0],
    times: parsed.times,
    notes: parsed.notes,
  }
}

function buildCompletions(rows: CsvRow[], playerNames: string[], levels: LevelImport[]) {
  const completions: CompletionImport[] = []
  const playerByKey = new Map(playerNames.map((name) => [matchKey(name), name]))
  const completionKeys = new Set<string>()

  rows.forEach((row, rowIndex) => {
    if (row.length !== playerNames.length) {
      throw new Error(`completions.csv row ${rowIndex + 2} has ${row.length} columns; expected ${playerNames.length}`)
    }

    row.forEach((cell, columnIndex) => {
      const rawValue = normalizeWhitespace(cell)
      if (!rawValue) {
        return
      }

      const headerPlayerName = playerNames[columnIndex]
      const playerName = playerByKey.get(matchKey(headerPlayerName))
      if (!playerName) {
        throw new Error(`completions.csv column ${columnIndex + 1}: unknown player ${JSON.stringify(headerPlayerName)}`)
      }

      const resolved = resolveLevel(rawValue, levels, playerName)
      const key = `${matchKey(playerName)}:${resolved.level.ingameId}`

      if (completionKeys.has(key)) {
        throw new Error(`Duplicate completion for ${playerName} and ${resolved.level.name}`)
      }

      completionKeys.add(key)
      completions.push({
        playerName,
        levelName: resolved.level.name,
        levelId: resolved.level.ingameId,
        times: resolved.times,
        notes: resolved.notes,
      })
    })

  })

  if (completions.length !== 869) {
    throw new Error(`Expected 869 completion records; found ${completions.length}`)
  }

  return completions
}

async function main() {
  const replace = process.argv.includes('--replace')
  const dryRun = process.argv.includes('--dry-run')

  if (!replace && !dryRun) {
    throw new Error(
      `This importer permanently deletes existing data from ${APPLICATION_TABLES.join(', ')}. Re-run with --replace to confirm, or use --dry-run to validate without writing.`,
    )
  }

  const levelRows = readCsv('level_profiles.csv', LEVEL_HEADERS)
  const playerRows = readCsv('player_names.csv', PLAYER_HEADERS)
  const completionFilePath = join(DATA_DIRECTORY, 'completions.csv')
  const completionText = readFileSync(completionFilePath, 'utf8').replace(/^\uFEFF/, '')
  const completionRows = parseCsv(completionText, 'completions.csv')
  const completionHeaders = completionRows.shift() ?? []

  if (completionHeaders.length !== 14 || completionHeaders.some((header) => !normalizeWhitespace(header))) {
    throw new Error(`completions.csv: expected 14 non-empty player columns, received ${JSON.stringify(completionHeaders)}`)
  }

  const levels = buildLevels(levelRows)
  const players = buildPlayers(playerRows)
  const playerNames = players.map((player) => player.name)

  if (completionHeaders.length !== playerNames.length) {
    throw new Error(`completions.csv has ${completionHeaders.length} players, but player_names.csv has ${playerNames.length}`)
  }

  completionHeaders.forEach((header, index) => {
    if (matchKey(header) !== matchKey(playerNames[index])) {
      throw new Error(
        `Player order mismatch at completions.csv column ${index + 1}: ${JSON.stringify(header)} vs ${JSON.stringify(playerNames[index])}`,
      )
    }
  })

  const completions = buildCompletions(completionRows, playerNames, levels)

  if (dryRun) {
    const typeCounts = levels.reduce<Record<string, number>>((counts, level) => {
      counts[level.type] = (counts[level.type] ?? 0) + 1
      return counts
    }, {})
    console.log(`Dry run passed: ${players.length} players, ${levels.length} levels, and ${completions.length} completions.`)
    console.log(`Level types: ${JSON.stringify(typeCounts)}`)
    return
  }

  const importedCounts = await prisma.$transaction(async (tx) => {
    await tx.completion.deleteMany()
    await tx.level.deleteMany()
    await tx.player.deleteMany()
    await tx.adminUser.deleteMany()

    await tx.player.createMany({ data: players })
    await tx.level.createMany({
      data: levels.map((level) => ({
        ingameId: level.ingameId,
        name: level.name,
        slug: level.slug,
        rank: level.rank,
        type: level.type,
        demoted: level.demoted,
        unrated: level.unrated,
        publishedBy: level.publishedBy,
        createdBy: level.createdBy,
        verifiedBy: level.verifiedBy,
        description: level.description,
        status: 'ACTIVE' as const,
      })),
    })

    const insertedPlayers = await tx.player.findMany({
      select: { id: true, name: true },
    })
    const insertedLevels = await tx.level.findMany({
      select: { id: true, ingameId: true },
    })
    const playerIds = new Map<string, string>(
      insertedPlayers.map((player) => [matchKey(player.name), player.id]),
    )
    const levelIds = new Map<number, string>(
      insertedLevels.map((level) => [level.ingameId, level.id]),
    )

    await tx.completion.createMany({
      data: completions.map((completion) => {
        const playerId = playerIds.get(matchKey(completion.playerName))
        const levelId = levelIds.get(completion.levelId)

        if (!playerId || !levelId) {
          throw new Error(`Unable to resolve inserted IDs for ${completion.playerName} / ${completion.levelName}`)
        }

        return {
          playerId,
          levelId,
          times: completion.times,
          notes: completion.notes,
        }
      }),
    })

    return {
      players: players.length,
      levels: levels.length,
      completions: completions.length,
    }
  })

  console.log(`Imported ${importedCounts.players} players, ${importedCounts.levels} levels, and ${importedCounts.completions} completions.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
