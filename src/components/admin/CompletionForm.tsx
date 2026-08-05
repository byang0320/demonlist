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

const inputClassName =
  'mt-2 w-full rounded-xl border border-white/10 bg-[#0c1120] px-4 py-3 text-sm text-[#f4f6ff] outline-none transition placeholder:text-[#59627b] focus:border-[#9c8cff]/70 focus:ring-4 focus:ring-[#9c8cff]/15'

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null
  }

  return <p className="mt-2 text-sm text-red-300">{errors[0]}</p>
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
    <label ref={containerRef} className="relative text-sm font-semibold text-[#d7dcf0]">
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
        <p className="mt-2 text-xs font-normal text-[#8c97b2]">
          Selected: {renderSelected(value)}
        </p>
      )}
      {open && (
        <div
          id={`${name}-options`}
          className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-[#171e35] p-1 shadow-2xl"
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
              className="block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-semibold text-white transition hover:bg-[#9c8cff]/15 focus:bg-[#9c8cff]/15 focus:outline-none"
            >
              {renderOption(option)}
            </button>
          )) : (
            <p className="px-3 py-3 text-sm font-normal text-[#8c97b2]">No matches found.</p>
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
      className="mt-8 space-y-8"
    >
      {state.formError && (
        <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
          {state.formError}
        </p>
      )}

      <section className="grid gap-5 rounded-2xl border border-white/10 bg-[#111725]/80 p-5 sm:p-7">
        <div>
          <h2 className="m-0 text-xl font-bold">Completion Record</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#b9c2d8]">
            Did you beat a level? Congratulations! Submit your record here so that it appears on both your profile and the level.
          </p>
          <p className="mt-2 text-xs leading-5 text-[#8c97b2]">
            Before doing so, make sure that both the level you beat and your player profile have already been created.{' '}
            <a className="text-[#c6beff] underline underline-offset-4 hover:text-white" href="/admin/levels/new">Create New Level</a>{' '}
            <span>(if you are the first person to beat it)</span>{' '}
            <a className="text-[#c6beff] underline underline-offset-4 hover:text-white" href="/admin/players/new">Create New Player</a>{' '}
            <span>(if you have not created your Stream VC profile yet)</span>
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
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
              return level ? <><span className="block">{level.name}</span><span className="block text-xs font-normal text-[#8c97b2]">by {level.publishedBy}</span></> : null
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

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[#d7dcf0]">
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
          <label className="text-sm font-semibold text-[#d7dcf0]">
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
            <p className="mt-2 text-xs font-normal text-[#8c97b2]">Enter 1 for a single completion. This box is for people such as Star who have completed Reverie upwards of 100 times.</p>
            <FieldError errors={state.fieldErrors?.times} />
          </label>
        </div>

        <label className="text-sm font-semibold text-[#d7dcf0]">
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

        <label className="text-sm font-semibold text-[#d7dcf0]">
          Other notes
          <textarea
            autoComplete="off"
            className={`${inputClassName} min-h-32 resize-y`}
            name="notes"
            maxLength={2000}
            defaultValue={submittedValues?.notes ?? initialValues?.notes ?? ''}
            placeholder="Leave some notes about this completion that will be only visible to other admins (optional)"
          />
          <FieldError errors={state.fieldErrors?.notes} />
        </label>
      </section>

      <div className="flex justify-end">
        <button
          className="inline-flex min-h-12 cursor-pointer items-center rounded-xl bg-[#9c8cff] px-6 text-sm font-bold text-[#0b0d18] transition hover:bg-[#c6beff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/30 disabled:cursor-wait disabled:opacity-60"
          type="submit"
          disabled={pending}
        >
          {pending ? `${submitLabel}…` : submitLabel}
        </button>
      </div>
    </form>
  )
}
