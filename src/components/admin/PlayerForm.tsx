'use client'

import { useActionState, useEffect, useRef, useState } from 'react'

import {
  createPlayerAction,
  type PlayerActionState,
} from '@/app/admin/players/new/actions'
import { slugify } from '@/lib/slugs'
import { countries } from '@/lib/countries'

export type PlayerFormValues = {
  name: string
  slug: string
  bio: string | null
  avatarUrl: string | null
  youtubeUrl: string | null
  twitchUrl: string | null
  discordHandle: string | null
  twitterUrl: string | null
  country1: string | null
  country2: string | null
}

type PlayerFormAction = (
  previousState: PlayerActionState,
  formData: FormData,
) => Promise<PlayerActionState>

const inputClassName =
  'mt-2 w-full rounded-xl border border-white/10 bg-[#0c1120] px-4 py-3 text-sm text-[#f4f6ff] outline-none transition placeholder:text-[#59627b] focus:border-[#9c8cff]/70 focus:ring-4 focus:ring-[#9c8cff]/15'

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null
  }

  return <p className="mt-2 text-sm text-red-300">{errors[0]}</p>
}

export default function PlayerForm({
  action = createPlayerAction,
  initialValues,
  submitLabel = 'Create',
}: {
  action?: PlayerFormAction
  initialValues?: PlayerFormValues
  submitLabel?: string
}) {
  const [state, formAction, pending] = useActionState(action, {})
  const slugInputRef = useRef<HTMLInputElement>(null)
  const [slugPreview, setSlugPreview] = useState(initialValues?.slug ?? '')
  const [country1, setCountry1] = useState(initialValues?.country1 ?? '')
  const submittedValues = state.values

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
        <p
          className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          {state.formError}
        </p>
      )}

      <section className="grid gap-5 rounded-2xl border border-white/10 bg-[#111725]/80 p-5 sm:grid-cols-2 sm:p-7">
        <div className="sm:col-span-2">
          <h2 className="m-0 text-xl font-bold">Player Information</h2>
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
            placeholder="e.g. Viprin"
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
            This will become your profile URL: /players/{submittedValues?.slug ?? (slugPreview || '[slug]')}
          </p>
          <FieldError errors={state.fieldErrors?.slug} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0] sm:col-span-2">
          Bio
          <textarea
            autoComplete="off"
            className={`${inputClassName} min-h-40 resize-y`}
            name="bio"
            maxLength={5000}
            defaultValue={submittedValues?.bio ?? initialValues?.bio ?? ''}
            placeholder="Write a short biography for this player (optional)"
          />
          <FieldError errors={state.fieldErrors?.bio} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0] sm:col-span-2">
          Avatar URL
          <input
            autoComplete="off"
            className={inputClassName}
            name="avatarUrl"
            type="url"
            defaultValue={submittedValues?.avatarUrl ?? initialValues?.avatarUrl ?? ''}
            placeholder="Paste an image link... (to be changed) (optional)"
          />
          <p className="mt-2 text-xs font-normal leading-5 text-[#8c97b2]">
            Any image link from the internet will work, but I&apos;ve found that Twitter has the highest quality. To use your Twitter profile picture, navigate to your Twitter profile, right click on the profile picture and click &quot;Copy image address&quot;. In the future, I might add the option to upload your own profile picture here... there just isn't enough database storage space to currently do that.
          </p>
          <FieldError errors={state.fieldErrors?.avatarUrl} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0]">
          Discord username
          <input
            autoComplete="off"
            className={inputClassName}
            name="discordHandle"
            type="text"
            maxLength={100}
            defaultValue={submittedValues?.discordHandle ?? initialValues?.discordHandle ?? ''}
            placeholder="e.g. player.1234 (optional)"
          />
          <FieldError errors={state.fieldErrors?.discordHandle} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0]">
          YouTube URL
          <input
            autoComplete="off"
            className={inputClassName}
            name="youtubeUrl"
            type="url"
            defaultValue={submittedValues?.youtubeUrl ?? initialValues?.youtubeUrl ?? ''}
            placeholder="Paste a YouTube channel link... (optional)"
          />
          <FieldError errors={state.fieldErrors?.youtubeUrl} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0]">
          Twitch URL
          <input
            autoComplete="off"
            className={inputClassName}
            name="twitchUrl"
            type="url"
            defaultValue={submittedValues?.twitchUrl ?? initialValues?.twitchUrl ?? ''}
            placeholder="Paste a Twitch channel link... (optional)"
          />
          <FieldError errors={state.fieldErrors?.twitchUrl} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0]">
          Twitter URL
          <input
            autoComplete="off"
            className={inputClassName}
            name="twitterUrl"
            type="url"
            defaultValue={submittedValues?.twitterUrl ?? initialValues?.twitterUrl ?? ''}
            placeholder="Paste a Twitter/X profile link... (optional)"
          />
          <FieldError errors={state.fieldErrors?.twitterUrl} />
        </label>

        <label className="text-sm font-semibold text-[#d7dcf0]">
          Country
          <select
            autoComplete="off"
            className={inputClassName}
            name="country1"
            onChange={(event) => setCountry1(event.target.value)}
            defaultValue={submittedValues?.country1 ?? initialValues?.country1 ?? ''}
          >
            <option value="">Select a country (optional)</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name} ({country.code})
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.country1} />
        </label>

        {country1 && (
          <label className="text-sm font-semibold text-[#d7dcf0]">
            Country 2
            <select
              autoComplete="off"
              className={inputClassName}
              name="country2"
              defaultValue={submittedValues?.country2 ?? initialValues?.country2 ?? ''}
            >
              <option value="">Select a second country (optional)</option>
              {countries.filter((country) => country.code !== country1).map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.code})
                </option>
              ))}
            </select>
            <FieldError errors={state.fieldErrors?.country2} />
          </label>
        )}
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
