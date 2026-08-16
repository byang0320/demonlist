'use client'

import { useActionState, useEffect, useRef, useState } from 'react'

import {
  createLevelAction,
  type LevelActionState,
} from '@/app/admin/levels/new/actions'
import type { LevelRankName } from '@/features/levels/queries'
import { slugify } from '@/lib/slugs'

const initialState: LevelActionState = {}

type LevelType = 'Classic' | 'Platformer'

export type LevelFormValues = {
  ingameId: number
  name: string
  slug: string
  rank: number
  type: LevelType
  demoted: boolean
  unrated: boolean
  publishedBy: string
  createdBy: string | null
  verifiedBy: string | null
  description: string | null
  videoUrl: string | null
  status: 'ACTIVE' | 'ARCHIVED'
}

type LevelFormAction = (
  previousState: LevelActionState,
  formData: FormData,
) => Promise<LevelActionState>

const inputClassName = 'form-input'

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null
  }

  return <p className="form-error">{errors[0]}</p>
}

function getCreateChangelogNeighbors(levels: LevelRankName[], rank: number) {
  const lastPossibleRank = levels.length + 1

  if (rank === 1) {
    return {
      above: levels.find((level) => level.rank === 1),
      below: undefined,
    }
  }

  if (rank === lastPossibleRank) {
    return {
      above: undefined,
      below: levels.find((level) => level.rank === rank - 1),
    }
  }

  return {
    above: levels.find((level) => level.rank === rank),
    below: levels.find((level) => level.rank === rank - 1),
  }
}

function getEditChangelogNeighbors(
  levels: LevelRankName[],
  newRank: number,
  oldRank: number,
) {
  const lastPossibleRank = levels.length + 1

  if (newRank < oldRank) {
    return {
      above: levels.find((level) => level.rank === newRank),
      below: newRank === 1 ? undefined : levels.find((level) => level.rank === newRank - 1),
    }
  }

  return {
    above: newRank === lastPossibleRank ? undefined : levels.find((level) => level.rank === newRank + 1),
    below: levels.find((level) => level.rank === newRank),
  }
}

function buildChangelogMessage({
  name,
  rankValue,
  levels,
  originalRank,
  levelType,
}: {
  name: string
  rankValue: string
  levels: LevelRankName[]
  originalRank?: number
  levelType: LevelType
}) {
  const rank = Number(rankValue)

  if (
    !name.trim()
    || !Number.isInteger(rank)
    || rank < 1
    || rank > levels.length + 1
    || (originalRank !== undefined && rank === originalRank)
  ) {
    return ''
  }

  const { above, below } = originalRank === undefined
    ? getCreateChangelogNeighbors(levels, rank)
    : getEditChangelogNeighbors(levels, rank, originalRank)
  const isFirstCreatedLevel = originalRank === undefined && levels.length === 0 && rank === 1

  if (!isFirstCreatedLevel && rank > 1 && rank < levels.length + 1 && (!above || !below)) {
    return ''
  }

  if (!isFirstCreatedLevel && rank === 1 && !above) {
    return ''
  }

  if (!isFirstCreatedLevel && rank === levels.length + 1 && !below) {
    return ''
  }

  if (originalRank !== undefined && Math.abs(rank - originalRank) === 1) {
    const otherAffectedLevel = levels.find((level) => level.rank === rank)

    if (!otherAffectedLevel) {
      return ''
    }

    const higherUpLevel = rank < originalRank
      ? { name: name.trim(), rank }
      : { name: otherAffectedLevel.name, rank: originalRank }
    const platformerSwapText = levelType === 'Platformer' ? ' on the Platformer Demonlist' : ''

    return `${name.trim()} and ${otherAffectedLevel.name} have been swapped${platformerSwapText}, with ${higherUpLevel.name} now sitting above at #${higherUpLevel.rank}.`
  }

  const neighboringText = [
    above ? `above ${above.name}` : '',
    below ? `below ${below.name}` : '',
  ].filter(Boolean).join(' and ')
  const platformerText = levelType === 'Platformer' ? ' on the Platformer Demonlist' : ''

  if (originalRank === undefined) {
    return `${name.trim()} was placed at #${rank}${platformerText}${neighboringText ? `, ${neighboringText}` : ''}.`
  }

  const direction = rank < originalRank ? 'up' : 'down'
  return `${name.trim()} has been moved ${direction} from #${originalRank} to #${rank}${platformerText}${neighboringText ? `, ${neighboringText}` : ''}.`
}

export default function LevelForm({
  maxRanks,
  rankedLevels,
  action = createLevelAction,
  initialValues,
  submitLabel = 'Create',
  typeLocked = false,
  allowAutofill = false,
}: {
  maxRanks: Record<LevelType, number>
  rankedLevels: Record<LevelType, LevelRankName[]>
  action?: LevelFormAction
  initialValues?: LevelFormValues
  submitLabel?: string
  typeLocked?: boolean
  allowAutofill?: boolean
}) {
  const [state, formAction, pending] = useActionState(action, initialState)
  const [type, setType] = useState<LevelType>(initialValues?.type ?? 'Classic')
  const [levelName, setLevelName] = useState(initialValues?.name ?? '')
  const [rankValue, setRankValue] = useState(initialValues?.rank?.toString() ?? '1')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const [slugPreview, setSlugPreview] = useState(initialValues?.slug ?? '')
  const maxRank = maxRanks[type]
  const submittedValues = state.values
  const slugInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [gdLevelId, setGdLevelId] = useState(initialValues?.ingameId?.toString() ?? '')
  const [autofilling, setAutofilling] = useState(false)
  const [autofilled, setAutofilled] = useState(false)
  const [autofillMessage, setAutofillMessage] = useState('')
  const changelogMessage = buildChangelogMessage({
    name: levelName,
    rankValue,
    levels: rankedLevels[type],
    originalRank: initialValues?.rank,
    levelType: type,
  })

  useEffect(() => {
    if (state.formError || Object.keys(state.fieldErrors ?? {}).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [state])

  async function autofillFromGDLevel() {
    if (!/^\d+$/.test(gdLevelId) || autofilling) {
      setAutofillMessage('Enter a valid numeric Geometry Dash level ID.')
      return
    }

    if (autofilled) {
      const currentLevelId = gdLevelId
      formRef.current?.reset()

      const levelIdField = formRef.current?.elements.namedItem('ingameId')
      if (levelIdField instanceof HTMLInputElement) {
        levelIdField.value = currentLevelId
      }

      setLevelName('')
      setRankValue('1')
      setSlugPreview('')
      setType('Classic')
      setCopyStatus('idle')
      setAutofilled(false)
    }

    setAutofilling(true)
    setAutofillMessage('')

    try {
      const response = await fetch(`/api/gd-level/${gdLevelId}`)
      const data = await response.json() as {
        error?: string
        name?: string
        description?: string
        author?: string
        platformer?: boolean
        difficulty?: string
        stars?: number
      }

      if (!response.ok || !data.name) {
        throw new Error(data.error || 'The level data was not available.')
      }

      const setIfBlank = (name: string, value: string | undefined) => {
        if (!value) {
          return
        }

        const field = formRef.current?.elements.namedItem(name)
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
          if (!field.value.trim()) {
            field.value = value
            if (name === 'name') {
              setLevelName(value)
            }
          }
        }
      }

      setIfBlank('name', data.name)
      setIfBlank('publishedBy', data.author)
      setIfBlank('description', data.description)

      const demotedField = formRef.current?.querySelector<HTMLInputElement>('input[type="checkbox"][name="demoted"]')
      const unratedField = formRef.current?.querySelector<HTMLInputElement>('input[type="checkbox"][name="unrated"]')
      const shouldMarkUnrated = data.stars === 0
      const shouldMarkDemoted = !shouldMarkUnrated && data.stars !== undefined && data.stars > 0 && data.difficulty !== 'Extreme Demon'

      if (demotedField) {
        demotedField.checked = shouldMarkDemoted
      }
      if (unratedField) {
        unratedField.checked = shouldMarkUnrated
      }

      const nextType: LevelType = data.platformer ? 'Platformer' : 'Classic'
      const typeField = formRef.current?.elements.namedItem('type')
      if (typeField instanceof HTMLSelectElement) {
        typeField.value = nextType
      }
      setType(nextType)

      const generatedSlug = slugify(data.name)
      if (slugInputRef.current && !slugInputRef.current.value.trim()) {
        slugInputRef.current.value = generatedSlug
        setSlugPreview(generatedSlug)
      }

      setAutofilled(true)
      setAutofillMessage('Level information autofilled. You can edit any field before saving.')
    } catch (error) {
      setAutofillMessage(error instanceof Error ? error.message : 'Unable to autofill this level.')
    } finally {
      setAutofilling(false)
    }
  }

  return (
    <form
      ref={formRef}
      key={submittedValues ? JSON.stringify(submittedValues) : 'initial'}
      action={formAction}
      autoComplete="off"
      className="form-layout"
    >
      {state.formError && (
        <p
          className="form-error-summary"
          role="alert"
        >
          {state.formError}
        </p>
      )}

      <section className="form-section form-section-grid">
        <div className="form-section-full">
          <h2 className="form-section-title">Level Information</h2>
        </div>

        <div className={`form-row ${allowAutofill ? 'form-row-autofill' : ''}`}>
          <label className="form-label">
            Level ID
            <input
              autoComplete="off"
              className={inputClassName}
              inputMode="numeric"
              name="ingameId"
              required
              value={gdLevelId}
              onChange={(event) => {
                setGdLevelId(event.target.value.replace(/\D/g, ''))
                setAutofillMessage('')
              }}
              placeholder="e.g. 76159410"
            />
            <FieldError errors={state.fieldErrors?.ingameId} />
          </label>
          {allowAutofill && (
            <button
              type="button"
              onClick={autofillFromGDLevel}
              disabled={autofilling}
              className="form-secondary-button"
            >
              {autofilling ? 'Autofilling…' : autofilled ? 'Autofill Again' : 'Autofill'}
            </button>
          )}
          {allowAutofill && (
            <div className="form-section-full">
              <p className="form-hint-no-margin">
                Enter the Geometry Dash level ID to pull its name, description, publisher, and type from the GDBrowser API. All fields remain editable after autofilling.
              </p>
              {autofillMessage && (
                <p className="form-hint-leading" aria-live="polite">
                  {autofillMessage}
                </p>
              )}
            </div>
          )}
        </div>

        <label className="form-label">
          Name
          <input
            autoComplete="off"
            className={inputClassName}
            name="name"
            onChange={(event) => {
              setLevelName(event.target.value)
              setCopyStatus('idle')
              const nextSlug = slugify(event.target.value)
              setSlugPreview(nextSlug)
              if (slugInputRef.current) {
                slugInputRef.current.value = nextSlug
              }
            }}
            placeholder="e.g. Cosmic Cyclone"
            required
            maxLength={200}
            value={levelName}
          />
          <FieldError errors={state.fieldErrors?.name} />
        </label>

        <label className="form-label">
          Slug
          <input
            autoComplete="off"
            className={inputClassName}
            name="slug"
            ref={slugInputRef}
            readOnly
            required
            maxLength={100}
            defaultValue={submittedValues?.slug ?? initialValues?.slug ?? ''}
            placeholder="No need to edit this manually!"
          />
          <p className="form-hint">
            This will become the URL: /levels/{submittedValues?.slug ?? (slugPreview || '[slug]')}. If it is already taken, the publisher name will be appended automatically.
          </p>
          <FieldError errors={state.fieldErrors?.slug} />
        </label>

        <label className="form-label">
          Level Type
          <select
            autoComplete="off"
            className={inputClassName}
            disabled={typeLocked}
            name="type"
            onChange={(event) => setType(event.target.value as LevelType)}
            defaultValue={submittedValues?.type ?? type}
          >
            <option value="Classic">Classic</option>
            <option value="Platformer">Platformer</option>
          </select>
          {typeLocked && <input autoComplete="off" name="type" type="hidden" value={type} />}
          <p className="form-hint">
            {typeLocked
              ? 'You cannot change the level type retroactively. Delete this and create a new level if you need to change the type.'
              : 'Make sure the correct level type is chosen; it cannot be changed later.'}
          </p>
          <FieldError errors={state.fieldErrors?.type} />
        </label>

        <div className="form-toggle-stack form-toggle-pair">
          <label className="form-toggle-row form-toggle-copy">
            <input autoComplete="off" type="hidden" name="demoted" value="false" />
            <input autoComplete="off" defaultChecked={submittedValues?.demoted === 'true' || (submittedValues?.demoted === undefined && (initialValues?.demoted ?? false))} className="form-checkbox" name="demoted" type="checkbox" value="true" />
            Demoted
          </label>
          <label className="form-toggle-row form-toggle-copy">
            <input autoComplete="off" type="hidden" name="unrated" value="false" />
            <input autoComplete="off" defaultChecked={submittedValues?.unrated === 'true' || (submittedValues?.unrated === undefined && (initialValues?.unrated ?? false))} className="form-checkbox" name="unrated" type="checkbox" value="true" />
            Unrated
          </label>
        </div>
      </section>

      <section className="form-section form-section-grid">
        <div className="form-section-full">
          <h2 className="form-section-title">Metadata</h2>
        </div>

        <label className="form-label form-section-full">
          Published by
          <input autoComplete="off" className={inputClassName} name="publishedBy" required maxLength={200} defaultValue={submittedValues?.publishedBy ?? initialValues?.publishedBy ?? ''} placeholder="e.g. APTeamOfficial" />
          <FieldError errors={state.fieldErrors?.publishedBy} />
        </label>

        <label className="form-label">
          Created by
          <input autoComplete="off" className={inputClassName} name="createdBy" maxLength={200} defaultValue={submittedValues?.createdBy ?? initialValues?.createdBy ?? ''} placeholder="e.g. Riot and more (optional)"/>
          <FieldError errors={state.fieldErrors?.createdBy} />
        </label>

        <label className="form-label">
          Verified by
          <input autoComplete="off" className={inputClassName} name="verifiedBy" maxLength={200} defaultValue={submittedValues?.verifiedBy ?? initialValues?.verifiedBy ?? ''} placeholder="e.g. DoSh7t (optional)" />
          <FieldError errors={state.fieldErrors?.verifiedBy} />
        </label>

        <label className="form-label form-section-full">
          Level Description (copied from in-game)
          <textarea autoComplete="off" className={`${inputClassName} form-textarea-small`} name="description" maxLength={5000} defaultValue={submittedValues?.description ?? initialValues?.description ?? ''} placeholder="e.g. Sequel to the legendary Sonic Wave by Cyclic. Verified by DoSh7t. Made by APTeam. (v1.3) (optional)" />
          <FieldError errors={state.fieldErrors?.description} />
        </label>

        <label className="form-label form-section-full">
          Level Verification Video (YouTube link)
          <input autoComplete="off" className={inputClassName} name="videoUrl" type="url" defaultValue={submittedValues?.videoUrl ?? initialValues?.videoUrl ?? ''} placeholder="Paste the official verification video link from YouTube. (optional)" />
          <FieldError errors={state.fieldErrors?.videoUrl} />
        </label>
      </section>

      <section className="form-section form-section-grid">
        <div className="form-section-full">
          <h2 className="form-section-title">Proposed Rank</h2>
        </div>

        <label className="form-label form-section-full">
          Proposed Rank
          <input
            autoComplete="off"
            className={inputClassName}
            name="rank"
            type="number"
            min="1"
            max={maxRank}
            required
            value={rankValue}
            onChange={(event) => {
              setRankValue(event.target.value)
              setCopyStatus('idle')
            }}
            placeholder={`Enter a number between 1 and ${maxRank}...`}
          />
          <p className="form-rank-hint">
            {typeLocked
              ? 'If changed, the ranks of other levels will be adjusted automatically!'
              : 'Levels currently placed at this rank and below will move down by one.'} This number should be between 1 and {maxRank}
          </p>
          <FieldError errors={state.fieldErrors?.rank} />
        </label>

        <div className="form-copyable-field form-section-full">
          <span className="form-copyable-label">Copyable Changelog Message</span>
          <div className="form-copyable-controls">
            <textarea
              aria-label="Copyable Changelog Message"
              className="form-copyable-textarea"
              readOnly
              rows={3}
              value={changelogMessage}
            />
            <button
              className="form-copy-button"
              type="button"
              disabled={!changelogMessage}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(changelogMessage)
                  setCopyStatus('copied')
                } catch {
                  setCopyStatus('error')
                }
              }}
            >
              {copyStatus === 'copied' ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
          {copyStatus === 'error' && (
            <p className="form-hint" role="alert">
              Unable to copy the message. Please copy it manually.
            </p>
          )}
        </div>

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
