'use client'

import { useActionState, useEffect, useMemo, useRef, useState } from 'react'

import {
  createCompletionAction,
  type CompletionActionState,
} from '@/app/admin/completions/new/actions'

type LevelOption = {
  id: string
  name: string
  publishedBy: string
}

type PlayerOption = {
  id: string
  name: string
}

type CompletionFormAction = (
  previousState: CompletionActionState,
  formData: FormData,
) => Promise<CompletionActionState>

export type CompletionFormValues = {
  levelId: string
  playerId: string
  levelLabel: string
  playerLabel: string
  times: string
  completedAt: string
  videoUrl: string
  notes: string
}

const inputClassName = 'form-input'

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null
  }

  return <p className="form-error">{errors[0]}</p>
}

export function SearchDropdown({
  label,
  name,
  options,
  value,
  search,
  onSearchChange,
  onSelect,
  onFocus,
  onClose,
  open,
  renderOption,
  renderSelected,
  error,
}: {
  label: string
  name: 'levelId' | 'playerId'
  options: Array<{ id: string }>
  value: string
  search: string
  onSearchChange: (value: string) => void
  onSelect: (id: string) => void
  onFocus: () => void
  onClose: () => void
  open: boolean
  renderOption: (option: { id: string }) => React.ReactNode
  renderSelected: (id: string) => string
  error?: string[]
}) {
  const containerRef = useRef<HTMLLabelElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [onClose, open])

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) {
      return options.slice(0, 50)
    }

    return options
      .filter((option) => renderSelected(option.id).toLowerCase().includes(query))
      .slice(0, 50)
  }, [options, renderSelected, search])

  return (
    <label ref={containerRef} className="form-label form-autocomplete-label">
      {label}
      <input
        autoComplete="off"
        className={inputClassName}
        name={`${name}Search`}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        onFocus={onFocus}
        placeholder={`Search ${label.toLowerCase()}...`}
        role="combobox"
        aria-expanded={open}
        aria-controls={`${name}-options`}
      />
      <input type="hidden" name={name} value={value} />
      {value && (
        <p className="form-hint">
          Selected: {renderSelected(value)}
        </p>
      )}
      {open && (
        <div
          id={`${name}-options`}
          className="autocomplete-menu"
          role="listbox"
        >
          {filteredOptions.length > 0 ? filteredOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              role="option"
              aria-selected={option.id === value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelect(option.id)}
              className="autocomplete-option"
            >
              {renderOption(option)}
            </button>
          )) : (
            <p className="autocomplete-empty">No matches found.</p>
          )}
        </div>
      )}
      <FieldError errors={error} />
    </label>
  )
}

export default function CompletionForm({
  levels,
  players,
  action = createCompletionAction,
  initialValues,
  submitLabel = 'Create Completion',
}: {
  levels: LevelOption[]
  players: PlayerOption[]
  action?: CompletionFormAction
  initialValues?: CompletionFormValues
  submitLabel?: string
}) {
  const [state, formAction, pending] = useActionState(action, {})
  const submittedValues = state.values
  const [levelId, setLevelId] = useState(initialValues?.levelId ?? '')
  const [playerId, setPlayerId] = useState(initialValues?.playerId ?? '')
  const [levelSearch, setLevelSearch] = useState(initialValues?.levelLabel ?? '')
  const [playerSearch, setPlayerSearch] = useState(initialValues?.playerLabel ?? '')
  const [levelOpen, setLevelOpen] = useState(false)
  const [playerOpen, setPlayerOpen] = useState(false)

  const levelById = useMemo(() => new Map(levels.map((level) => [level.id, level])), [levels])
  const playerById = useMemo(() => new Map(players.map((player) => [player.id, player])), [players])

  const levelLabel = (id: string) => {
    const level = levelById.get(id)
    return level ? `${level.name} by ${level.publishedBy}` : ''
  }
  const playerLabel = (id: string) => playerById.get(id)?.name ?? ''

  useEffect(() => {
    if (state.formError || Object.keys(state.fieldErrors ?? {}).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [state])

  return (
    <form
      key={submittedValues ? JSON.stringify(submittedValues) : 'initial'}
      action={formAction}
      autoComplete="off"
      className="form-layout"
    >
      {state.formError && (
        <p className="form-error-summary" role="alert">
          {state.formError}
        </p>
      )}

      <section className="form-section">
        <div>
          <h2 className="form-section-title">Completion Record</h2>
          <p className="form-intro">
            Did you beat a level? Congratulations! Submit your record here so that it appears on both your profile and the level.
          </p>
          <p className="form-hint-leading">
            Before doing so, make sure that both the level you beat and your player profile have already been created.{' '}
            <a className="form-hint-link" href="/admin/levels/new">Create New Level</a>{' '}
            <span>(if you are the first person to beat it)</span>{' '}
            <a className="form-hint-link" href="/admin/players/new">Create New Player</a>{' '}
            <span>(if you have not created your Stream VC profile yet)</span>
          </p>
        </div>

        <div className="form-grid">
          <SearchDropdown
            label="Level"
            name="levelId"
            options={levels}
            value={levelId}
            search={levelSearch}
            onSearchChange={(value) => {
              setLevelSearch(value)
              setLevelId('')
              setLevelOpen(true)
            }}
            onSelect={(id) => {
              setLevelId(id)
              setLevelSearch(levelLabel(id))
              setLevelOpen(false)
            }}
            onFocus={() => setLevelOpen(true)}
            onClose={() => setLevelOpen(false)}
            open={levelOpen}
            renderOption={(option) => {
              const level = levelById.get(option.id)
              return level ? <><span className="form-option-name">{level.name}</span><span className="form-option-detail">by {level.publishedBy}</span></> : null
            }}
            renderSelected={levelLabel}
            error={state.fieldErrors?.levelId}
          />
          <SearchDropdown
            label="Player"
            name="playerId"
            options={players}
            value={playerId}
            search={playerSearch}
            onSearchChange={(value) => {
              setPlayerSearch(value)
              setPlayerId('')
              setPlayerOpen(true)
            }}
            onSelect={(id) => {
              setPlayerId(id)
              setPlayerSearch(playerLabel(id))
              setPlayerOpen(false)
            }}
            onFocus={() => setPlayerOpen(true)}
            onClose={() => setPlayerOpen(false)}
            open={playerOpen}
            renderOption={(option) => <span>{playerById.get(option.id)?.name}</span>}
            renderSelected={playerLabel}
            error={state.fieldErrors?.playerId}
          />
        </div>

        <div className="form-grid">
          <label className="form-label">
            Original completion date
            <input
              autoComplete="off"
              className={inputClassName}
              name="completedAt"
              type="date"
              defaultValue={submittedValues?.completedAt ?? initialValues?.completedAt ?? ''}
            />
            <FieldError errors={state.fieldErrors?.completedAt} />
          </label>
          <label className="form-label">
            How many times did you beat this?
            <input
              autoComplete="off"
              className={inputClassName}
              name="times"
              type="number"
              min="1"
              step="1"
              required
              defaultValue={submittedValues?.times ?? initialValues?.times ?? '1'}
            />
            <p className="form-hint">Enter 1 for a single completion. This box is for people such as Star who have completed Reverie upwards of 100 times.</p>
            <FieldError errors={state.fieldErrors?.times} />
          </label>
        </div>

        <label className="form-label">
          Video URL
          <input
            autoComplete="off"
            className={inputClassName}
            name="videoUrl"
            type="url"
            defaultValue={submittedValues?.videoUrl ?? initialValues?.videoUrl ?? ''}
            placeholder="Paste a video link... (optional)"
          />
          <FieldError errors={state.fieldErrors?.videoUrl} />
        </label>

        <label className="form-label">
          Other notes
          <textarea
            autoComplete="off"
            className={`${inputClassName} form-textarea-small`}
            name="notes"
            maxLength={2000}
            defaultValue={submittedValues?.notes ?? initialValues?.notes ?? ''}
            placeholder="Leave some notes about this completion that will be only visible to other admins (optional)"
          />
          <FieldError errors={state.fieldErrors?.notes} />
        </label>
      </section>

      <div className="form-actions">
        <button
          className="form-submit"
          type="submit"
          disabled={pending}
        >
          {pending ? `${submitLabel}…` : submitLabel}
        </button>
      </div>
    </form>
  )
}
