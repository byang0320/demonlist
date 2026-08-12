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
  selectedSearch = '',
}: {
  levels: LevelOption[]
  players: PlayerOption[]
  selectedLevelId?: string
  selectedPlayerId?: string
  selectedSearch?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [levelId, setLevelId] = useState(selectedLevelId)
  const [playerId, setPlayerId] = useState(selectedPlayerId)
  const [search, setSearch] = useState(selectedSearch)
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

  function updateSearch(nextSearch: string) {
    setSearch(nextSearch)
    setLevelId('')
    setPlayerId('')
    setLevelSearch('')
    setPlayerSearch('')

    const params = new URLSearchParams()
    if (nextSearch.trim()) params.set('search', nextSearch)
    const query = params.toString()
    router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false })
  }

  function clearFilters() {
    setLevelId('')
    setPlayerId('')
    setSearch('')
    setLevelSearch('')
    setPlayerSearch('')
    setLevelOpen(false)
    setPlayerOpen(false)
    router.replace(pathname, { scroll: false })
  }

  return (
    <section className="admin-filter-panel">
      <div className="admin-filter-header">
        <h2 className="form-section-title">Filter completions</h2>
        {(search || levelId || playerId) && (
          <button
            type="button"
            onClick={clearFilters}
            className="admin-clear-filters"
          >
            Clear filters
          </button>
        )}
      </div>
      <label className="admin-completion-search">
        Search all completions
        <input
          autoComplete="off"
          className="form-input"
          type="search"
          value={search}
          onChange={(event) => updateSearch(event.target.value)}
          placeholder="Search by player, level, publisher, date..."
        />
      </label>
      <div className="admin-filter-or" aria-hidden="true">- or -</div>
      <div className="form-grid">
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
            setSearch('')
            setLevelSearch(levelLabel(id))
            setLevelOpen(false)
            updateFilters(id, playerId)
          }}
          onFocus={() => setLevelOpen(true)}
          onClose={() => setLevelOpen(false)}
          open={levelOpen}
          renderOption={(option) => {
            const level = levelById.get(option.id)
            return level ? <><span className="form-option-name">{level.name}</span><span className="form-option-detail">by {level.publishedBy}</span></> : null
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
            setSearch('')
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
