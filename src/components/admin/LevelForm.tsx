'use client'

import { useActionState, useEffect, useState } from 'react'

import {
  createLevelAction,
  type CreateLevelActionState,
} from '@/app/admin/levels/new/actions'

const initialState: CreateLevelActionState = {}

type LevelType = 'Classic' | 'Platformer'

const inputClassName =
  'mt-2 w-full rounded-xl border border-white/10 bg-[#0c1120] px-4 py-3 text-sm text-[#f4f6ff] outline-none transition placeholder:text-[#59627b] focus:border-[#9c8cff]/70 focus:ring-4 focus:ring-[#9c8cff]/15'

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null
  }

  return <p className="mt-2 text-sm text-red-300">{errors[0]}</p>
}

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

export default function LevelForm({
  maxRanks,
}: {
  maxRanks: Record<LevelType, number>
}) {
  const [state, formAction, pending] = useActionState(createLevelAction, initialState)
  const [name, setName] = useState('')
  const [type, setType] = useState<LevelType>('Classic')
  const slug = slugify(name)
  const maxRank = maxRanks[type]

  useEffect(() => {
    if (state.formError || Object.keys(state.fieldErrors ?? {}).length > 0) {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [state])

  return (
    <form action={formAction} autoComplete="off" className="mt-8 space-y-8">
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

        <label className="text-sm font-semibold text-[#d7dcf0]">
          Name
          <input
            autoComplete="off"
            className={inputClassName}
            name="name"
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Cosmic Cyclone"
            required
            maxLength={200}
            value={name}
          />
          <FieldError errors={state.fieldErrors?.name} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0]">
          Slug
          <input
            autoComplete="off"
            className={inputClassName}
            name="slug"
            readOnly
            required
            maxLength={100}
            value={slug}
            placeholder="No need to edit this manually!"
          />
          <p className="mt-2 text-xs font-normal text-[#8c97b2]">
            This will become the URL: /levels/{slug || '[slug]'}
          </p>
          <FieldError errors={state.fieldErrors?.slug} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0]">
          Level type
          <select
            autoComplete="off"
            className={inputClassName}
            name="type"
            onChange={(event) => setType(event.target.value as LevelType)}
            value={type}
          >
            <option value="Classic">Classic</option>
            <option value="Platformer">Platformer</option>
          </select>
          <FieldError errors={state.fieldErrors?.type} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0]">
          Status
          <select autoComplete="off" className={inputClassName} name="status" defaultValue="ACTIVE">
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <FieldError errors={state.fieldErrors?.status} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0]">
          Proposed rank
          <input autoComplete="off" className={inputClassName} name="rank" type="number" min="1" max={maxRank} required defaultValue="1" placeholder="e.g. 67" />
          <p className="mt-2 text-xs font-normal text-[#8c97b2]">
            Active levels at this rank and below will move down one position.
          </p>
          <p className="mt-1 text-xs font-normal text-[#8c97b2]">
            This should be between 1 and {maxRank}
          </p>
          <FieldError errors={state.fieldErrors?.rank} />
        </label>

        <div className="flex flex-col justify-end gap-3 pb-1">
          <label className="flex items-center gap-3 text-sm font-semibold text-[#d7dcf0]">
            <input autoComplete="off" type="hidden" name="demoted" value="false" />
            <input autoComplete="off" className="h-4 w-4 accent-[#9c8cff]" name="demoted" type="checkbox" value="true" />
            Demoted
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold text-[#d7dcf0]">
            <input autoComplete="off" type="hidden" name="unrated" value="false" />
            <input autoComplete="off" className="h-4 w-4 accent-[#9c8cff]" name="unrated" type="checkbox" value="true" />
            Unrated
          </label>
        </div>
      </section>

      <section className="grid gap-5 rounded-2xl border border-white/10 bg-[#111725]/80 p-5 sm:p-7">
        <div className="sm:col-span-2">
          <h2 className="m-0 text-xl font-bold">Metadata</h2>
          <p className="mt-2 text-sm font-normal text-[#8c97b2]">
            Hopefully I eventually find an API to automatically pull this information from the game. But for now, you&apos;ll have to enter this manually.
          </p>
        </div>

        <label className="text-sm font-semibold text-[#d7dcf0] sm:col-span-2">
          Published by
          <input autoComplete="off" className={inputClassName} name="publishedBy" required maxLength={200} placeholder="e.g. APTeamOfficial" />
          <FieldError errors={state.fieldErrors?.publishedBy} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0]">
          Created by
          <input autoComplete="off" className={inputClassName} name="createdBy" maxLength={200} placeholder="e.g. Riot and more (this field is optional)"/>
          <FieldError errors={state.fieldErrors?.createdBy} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0]">
          Verified by
          <input autoComplete="off" className={inputClassName} name="verifiedBy" maxLength={200} placeholder="e.g. DoSh7t (this field is optional)" />
          <FieldError errors={state.fieldErrors?.verifiedBy} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0] sm:col-span-2">
          Level Description (copied from in-game)
          <textarea autoComplete="off" className={`${inputClassName} min-h-32 resize-y`} name="description" maxLength={5000} placeholder="e.g. Sequel to the legendary Sonic Wave by Cyclic. Verified by DoSh7t. Made by APTeam. (v1.3) (this field is optional)" />
          <FieldError errors={state.fieldErrors?.description} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0]">
          Thumbnail URL
          <input autoComplete="off" className={inputClassName} name="thumbnailUrl" type="url" placeholder="Paste a link... (to be changed) (this field is optional)"/>
          <FieldError errors={state.fieldErrors?.thumbnailUrl} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0]">
          External URL
          <input autoComplete="off" className={inputClassName} name="externalUrl" type="url" placeholder="Paste a link... (to be changed) (this field is optional)" />
          <FieldError errors={state.fieldErrors?.externalUrl} />
        </label>
      </section>

      <div className="flex justify-end">
        <button
          className="inline-flex min-h-12 items-center rounded-xl bg-[#9c8cff] px-6 text-sm font-bold text-[#0b0d18] transition hover:bg-[#c6beff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9c8cff]/30 disabled:cursor-wait disabled:opacity-60 cursor-pointer"
          type="submit"
          disabled={pending}
        >
          {pending ? 'Creating…' : 'Create'}
        </button>
      </div>
    </form>
  )
}
