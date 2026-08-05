'use client'

import { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { SearchDropdown } from '@/components/admin/CompletionForm'

type LevelOption = {
  id: string
  name: string
  publishedBy: string
}

type PlayerOption = {
  id: string
  name: string
}

export default function CompletionFilters({
  levels,
  players,
  selectedLevelId = '',
  selectedPlayerId = '',
}: {
  levels: LevelOption[]
  players: PlayerOption[]
  selectedLevelId?: string
  selectedPlayerId?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [levelId, setLevelId] = useState(selectedLevelId)
  const [playerId, setPlayerId] = useState(selectedPlayerId)
  const [levelSearch, setLevelSearch] = useState('')
  const [playerSearch, setPlayerSearch] = useState('')
  const [levelOpen, setLevelOpen] = useState(false)
  const [playerOpen, setPlayerOpen] = useState(false)

  const levelById = useMemo(() => new Map(levels.map((level) => [level.id, level])), [levels])
  const playerById = useMemo(() => new Map(players.map((player) => [player.id, player])), [players])

  const levelLabel = (id: string) => {
    const level = levelById.get(id)
    return level ? `${level.name} by ${level.publishedBy}` : ''
  }
  const playerLabel = (id: string) => playerById.get(id)?.name ?? ''

  function updateFilters(nextLevelId: string, nextPlayerId: string) {
    const params = new URLSearchParams()
    if (nextLevelId) params.set('levelId', nextLevelId)
    if (nextPlayerId) params.set('playerId', nextPlayerId)
    const query = params.toString()
    router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false })
  }

  function clearFilters() {
    setLevelId('')
    setPlayerId('')
    setLevelSearch('')
    setPlayerSearch('')
    setLevelOpen(false)
    setPlayerOpen(false)
    router.replace(pathname, { scroll: false })
  }

  return (
    <section className="mb-8 rounded-2xl border border-white/10 bg-[#111725]/80 p-5 sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="m-0 text-xl font-bold">Filter completions</h2>
        {(levelId || playerId) && (
          <button
            type="button"
            onClick={clearFilters}
            className="cursor-pointer text-xs font-semibold text-[#8c97b2] underline underline-offset-4 transition hover:text-white"
          >
            Clear filters
          </button>
        )}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <SearchDropdown
          label="Level"
          name="levelId"
          options={levels}
          value={levelId}
          search={levelSearch || (levelId ? levelLabel(levelId) : '')}
          onSearchChange={(value) => {
            setLevelSearch(value)
            setLevelId('')
            setLevelOpen(true)
          }}
          onSelect={(id) => {
            setLevelId(id)
            setLevelSearch(levelLabel(id))
            setLevelOpen(false)
            updateFilters(id, playerId)
          }}
          onFocus={() => setLevelOpen(true)}
          onClose={() => setLevelOpen(false)}
          open={levelOpen}
          renderOption={(option) => {
            const level = levelById.get(option.id)
            return level ? <><span className="block">{level.name}</span><span className="block text-xs font-normal text-[#8c97b2]">by {level.publishedBy}</span></> : null
          }}
          renderSelected={levelLabel}
        />
        <SearchDropdown
          label="Player"
          name="playerId"
          options={players}
          value={playerId}
          search={playerSearch || (playerId ? playerLabel(playerId) : '')}
          onSearchChange={(value) => {
            setPlayerSearch(value)
            setPlayerId('')
            setPlayerOpen(true)
          }}
          onSelect={(id) => {
            setPlayerId(id)
            setPlayerSearch(playerLabel(id))
            setPlayerOpen(false)
            updateFilters(levelId, id)
          }}
          onFocus={() => setPlayerOpen(true)}
          onClose={() => setPlayerOpen(false)}
          open={playerOpen}
          renderOption={(option) => <span>{playerById.get(option.id)?.name}</span>}
          renderSelected={playerLabel}
        />
      </div>
    </section>
  )
}
