'use client'

import { useActionState, useEffect, useRef, useState } from 'react'

import {
  createLevelAction,
  type LevelActionState,
} from '@/app/admin/levels/new/actions'
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

const inputClassName =
  'mt-2 w-full rounded-xl border border-white/10 bg-[#0c1120] px-4 py-3 text-sm text-[#f4f6ff] outline-none transition placeholder:text-[#59627b] focus:border-[#9c8cff]/70 focus:ring-4 focus:ring-[#9c8cff]/15'

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null
  }

  return <p className="mt-2 text-sm text-red-300">{errors[0]}</p>
}

export default function LevelForm({
  maxRanks,
  action = createLevelAction,
  initialValues,
  submitLabel = 'Create',
  typeLocked = false,
  allowAutofill = false,
}: {
  maxRanks: Record<LevelType, number>
  action?: LevelFormAction
  initialValues?: LevelFormValues
  submitLabel?: string
  typeLocked?: boolean
  allowAutofill?: boolean
}) {
  const [state, formAction, pending] = useActionState(action, initialState)
  const [type, setType] = useState<LevelType>(initialValues?.type ?? 'Classic')
  const [slugPreview, setSlugPreview] = useState(initialValues?.slug ?? '')
  const maxRank = maxRanks[type]
  const submittedValues = state.values
  const slugInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [gdLevelId, setGdLevelId] = useState(initialValues?.ingameId?.toString() ?? '')
  const [autofilling, setAutofilling] = useState(false)
  const [autofilled, setAutofilled] = useState(false)
  const [autofillMessage, setAutofillMessage] = useState('')

  useEffect(() => {
    if (state.formError || Object.keys(state.fieldErrors ?? {}).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [state])

  async function autofillFromGDLevel() {
    if (!/^\d+$/.test(gdLevelId) || autofilling || autofilled) {
      setAutofillMessage('Enter a valid numeric Geometry Dash level ID.')
      return
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
          }
        }
      }

      setIfBlank('name', data.name)
      setIfBlank('publishedBy', data.author)
      setIfBlank('description', data.description)

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
      className="mt-8 space-y-8"
    >
      {state.formError && (
        <p
          className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          {state.formError}
        </p>
      )}

      <section className="grid gap-5 rounded-2xl border border-white/10 bg-[#111725]/80 p-5 sm:grid-cols-2 sm:p-7">
        <div className="sm:col-span-2">
          <h2 className="m-0 text-xl font-bold">Level Information</h2>
        </div>

        <div className={`grid gap-4 sm:col-span-2 ${allowAutofill ? 'sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end' : ''}`}>
          <label className="text-sm font-semibold text-[#d7dcf0]">
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
                setAutofilled(false)
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
              disabled={autofilling || autofilled}
              className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-[#ae9dff]/40 px-5 text-sm font-bold text-[#c6beff] transition hover:border-[#c6beff] hover:bg-[#9c8cff]/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {autofilling ? 'Autofilling…' : autofilled ? 'Autofilled' : 'Autofill'}
            </button>
          )}
          {allowAutofill && (
            <div className="sm:col-span-2">
              <p className="text-xs leading-5 text-[#8c97b2]">
                Enter the Geometry Dash level ID to pull its name, description, publisher, and type from the GDBrowser API. All fields remain editable after autofilling.
              </p>
              {autofillMessage && (
                <p className="mt-2 text-xs leading-5 text-[#8c97b2]" aria-live="polite">
                  {autofillMessage}
                </p>
              )}
            </div>
          )}
        </div>

        <label className="text-sm font-semibold text-[#d7dcf0]">
          Name
          <input
            autoComplete="off"
            className={inputClassName}
            name="name"
            onChange={(event) => {
              const nextSlug = slugify(event.target.value)
              setSlugPreview(nextSlug)
              if (slugInputRef.current) {
                slugInputRef.current.value = nextSlug
              }
            }}
            placeholder="e.g. Cosmic Cyclone"
            required
            maxLength={200}
            defaultValue={submittedValues?.name ?? initialValues?.name ?? ''}
          />
          <FieldError errors={state.fieldErrors?.name} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0]">
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
          <p className="mt-2 text-xs font-normal text-[#8c97b2]">
            This will become the URL: /levels/{submittedValues?.slug ?? (slugPreview || '[slug]')}. If it is already taken, the publisher name will be appended automatically.
          </p>
          <FieldError errors={state.fieldErrors?.slug} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0]">
          Level type
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
          <p className="mt-2 text-xs font-normal text-[#8c97b2]">
            {typeLocked
              ? 'You cannot change the level type retroactively. Delete this and create a new level if you need to change the type.'
              : 'Make sure the correct level type is chosen; it cannot be changed later.'}
          </p>
          <FieldError errors={state.fieldErrors?.type} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0]">
          Status
          <select autoComplete="off" className={inputClassName} name="status" defaultValue={submittedValues?.status ?? initialValues?.status ?? 'ACTIVE'}>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <FieldError errors={state.fieldErrors?.status} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0]">
          Proposed rank
          <input autoComplete="off" className={inputClassName} name="rank" type="number" min="1" max={maxRank} required defaultValue={submittedValues?.rank ?? initialValues?.rank ?? 1} placeholder="e.g. 67" />
          <p className="mt-2 text-xs font-normal text-[#8c97b2]">
            {typeLocked
              ? 'If changed, the ranks of other levels will be adjusted automatically!'
              : 'Active levels at this rank and below will move down one position.'}
          </p>
          <p className="mt-1 text-xs font-normal text-[#8c97b2]">
            This should be between 1 and {maxRank}
          </p>
          <FieldError errors={state.fieldErrors?.rank} />
        </label>

        <div className="flex flex-col justify-end gap-3 pb-1">
          <label className="flex items-center gap-3 text-sm font-semibold text-[#d7dcf0]">
            <input autoComplete="off" type="hidden" name="demoted" value="false" />
            <input autoComplete="off" defaultChecked={submittedValues?.demoted === 'true' || (submittedValues?.demoted === undefined && (initialValues?.demoted ?? false))} className="h-4 w-4 accent-[#9c8cff]" name="demoted" type="checkbox" value="true" />
            Demoted
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold text-[#d7dcf0]">
            <input autoComplete="off" type="hidden" name="unrated" value="false" />
            <input autoComplete="off" defaultChecked={submittedValues?.unrated === 'true' || (submittedValues?.unrated === undefined && (initialValues?.unrated ?? false))} className="h-4 w-4 accent-[#9c8cff]" name="unrated" type="checkbox" value="true" />
            Unrated
          </label>
        </div>
      </section>

      <section className="grid gap-5 rounded-2xl border border-white/10 bg-[#111725]/80 p-5 sm:p-7">
        <div className="sm:col-span-2">
          <h2 className="m-0 text-xl font-bold">Metadata</h2>
        </div>

        <label className="text-sm font-semibold text-[#d7dcf0] sm:col-span-2">
          Published by
          <input autoComplete="off" className={inputClassName} name="publishedBy" required maxLength={200} defaultValue={submittedValues?.publishedBy ?? initialValues?.publishedBy ?? ''} placeholder="e.g. APTeamOfficial" />
          <FieldError errors={state.fieldErrors?.publishedBy} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0]">
          Created by
          <input autoComplete="off" className={inputClassName} name="createdBy" maxLength={200} defaultValue={submittedValues?.createdBy ?? initialValues?.createdBy ?? ''} placeholder="e.g. Riot and more (optional)"/>
          <FieldError errors={state.fieldErrors?.createdBy} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0]">
          Verified by
          <input autoComplete="off" className={inputClassName} name="verifiedBy" maxLength={200} defaultValue={submittedValues?.verifiedBy ?? initialValues?.verifiedBy ?? ''} placeholder="e.g. DoSh7t (optional)" />
          <FieldError errors={state.fieldErrors?.verifiedBy} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0] sm:col-span-2">
          Level Description (copied from in-game)
          <textarea autoComplete="off" className={`${inputClassName} min-h-32 resize-y`} name="description" maxLength={5000} defaultValue={submittedValues?.description ?? initialValues?.description ?? ''} placeholder="e.g. Sequel to the legendary Sonic Wave by Cyclic. Verified by DoSh7t. Made by APTeam. (v1.3) (optional)" />
          <FieldError errors={state.fieldErrors?.description} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0] sm:col-span-2">
          Level Verification Video (YouTube link)
          <input autoComplete="off" className={inputClassName} name="videoUrl" type="url" defaultValue={submittedValues?.videoUrl ?? initialValues?.videoUrl ?? ''} placeholder="Paste the official verification video link from YouTube. The thumbnail will be derived from this video. (optional)" />
          <FieldError errors={state.fieldErrors?.videoUrl} />
        </label>
      </section>

      <div className="flex justify-end">
        <button
          className="inline-flex min-h-12 items-center rounded-xl bg-[#9c8cff] px-6 text-sm font-bold text-[#0b0d18] transition hover:bg-[#c6beff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/30 disabled:cursor-wait disabled:opacity-60 cursor-pointer"
          type="submit"
          disabled={pending}
        >
          {pending ? `${submitLabel}…` : submitLabel}
        </button>
      </div>
    </form>
  )
}
