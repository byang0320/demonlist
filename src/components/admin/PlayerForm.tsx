'use client'

import { useActionState, useEffect, useRef, useState } from 'react'

import {
  createPlayerAction,
  type PlayerActionState,
} from '@/app/admin/players/new/actions'
import { useFormFieldValidation } from '@/components/admin/form-validation'
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

type PlayerFieldName = keyof NonNullable<PlayerActionState['fieldErrors']>

const inputClassName = 'form-input'

function getInputClassName(hasError: boolean, additionalClassName = '') {
  return [inputClassName, additionalClassName, hasError ? 'form-input-error' : '']
    .filter(Boolean)
    .join(' ')
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null
  }

  return <p className="form-error" role="alert">{errors[0]}</p>
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
  const { getErrors, validateField } = useFormFieldValidation<PlayerFieldName>(state.fieldErrors)
  const fieldErrors = {
    name: getErrors('name'),
    slug: getErrors('slug'),
    bio: getErrors('bio'),
    avatarUrl: getErrors('avatarUrl'),
    discordHandle: getErrors('discordHandle'),
    youtubeUrl: getErrors('youtubeUrl'),
    twitchUrl: getErrors('twitchUrl'),
    twitterUrl: getErrors('twitterUrl'),
    country1: getErrors('country1'),
    country2: getErrors('country2'),
  }

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
      noValidate
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
          <h2 className="form-section-title">Player Information</h2>
        </div>

        <label className="form-label">
          Name
          <input
            autoComplete="off"
            className={getInputClassName(Boolean(fieldErrors.name?.length))}
            name="name"
            onChange={(event) => {
              const nextSlug = slugify(event.target.value)
              setSlugPreview(nextSlug)
              if (slugInputRef.current) {
                slugInputRef.current.value = nextSlug
              }
            }}
            onBlur={(event) => validateField('name', event.currentTarget, 'Name')}
            placeholder="e.g. Viprin"
            required
            maxLength={200}
            defaultValue={submittedValues?.name ?? initialValues?.name ?? ''}
          />
          <FieldError errors={fieldErrors.name} />
        </label>

        <label className="form-label">
          Slug
          <input
            autoComplete="off"
            className={getInputClassName(Boolean(fieldErrors.slug?.length))}
            name="slug"
            ref={slugInputRef}
            readOnly
            required
            maxLength={100}
            defaultValue={submittedValues?.slug ?? initialValues?.slug ?? ''}
            placeholder="No need to edit this manually!"
            onBlur={(event) => validateField('slug', event.currentTarget, 'Slug')}
          />
          <p className="form-hint">
            This will become your profile URL: /players/{submittedValues?.slug ?? (slugPreview || '[slug]')}
          </p>
          <FieldError errors={fieldErrors.slug} />
        </label>

        <label className="form-label form-section-full">
          Bio
          <textarea
            autoComplete="off"
            className={getInputClassName(Boolean(fieldErrors.bio?.length), 'form-textarea')}
            name="bio"
            maxLength={5000}
            defaultValue={submittedValues?.bio ?? initialValues?.bio ?? ''}
            placeholder="Write a short biography for this player (optional)"
            onBlur={(event) => validateField('bio', event.currentTarget, 'Bio')}
          />
          <FieldError errors={fieldErrors.bio} />
        </label>

        <label className="form-label form-section-full">
          Avatar URL
          <input
            autoComplete="off"
            className={getInputClassName(Boolean(fieldErrors.avatarUrl?.length))}
            name="avatarUrl"
            type="url"
            defaultValue={submittedValues?.avatarUrl ?? initialValues?.avatarUrl ?? ''}
            placeholder="Paste an image link... (to be changed) (optional)"
            onBlur={(event) => validateField('avatarUrl', event.currentTarget, 'Avatar URL')}
          />
          <p className="form-hint-leading">
            Any image link from the internet will work, but I&apos;ve found that Twitter has the highest quality. To use your Twitter profile picture, navigate to your Twitter profile, right click on the profile picture and click &quot;Copy image address&quot;. In the future, I might add the option to upload your own profile picture here... there just isn&apos;t enough database storage space to currently do that.
          </p>
          <FieldError errors={fieldErrors.avatarUrl} />
        </label>

        <label className="form-label">
          Discord username
          <input
            autoComplete="off"
            className={getInputClassName(Boolean(fieldErrors.discordHandle?.length))}
            name="discordHandle"
            type="text"
            maxLength={100}
            defaultValue={submittedValues?.discordHandle ?? initialValues?.discordHandle ?? ''}
            placeholder="e.g. player.1234 (optional)"
            onBlur={(event) => validateField('discordHandle', event.currentTarget, 'Discord username')}
          />
          <FieldError errors={fieldErrors.discordHandle} />
        </label>

        <label className="form-label">
          YouTube URL
          <input
            autoComplete="off"
            className={getInputClassName(Boolean(fieldErrors.youtubeUrl?.length))}
            name="youtubeUrl"
            type="url"
            defaultValue={submittedValues?.youtubeUrl ?? initialValues?.youtubeUrl ?? ''}
            placeholder="Paste a YouTube channel link... (optional)"
            onBlur={(event) => validateField('youtubeUrl', event.currentTarget, 'YouTube URL')}
          />
          <FieldError errors={fieldErrors.youtubeUrl} />
        </label>

        <label className="form-label">
          Twitch URL
          <input
            autoComplete="off"
            className={getInputClassName(Boolean(fieldErrors.twitchUrl?.length))}
            name="twitchUrl"
            type="url"
            defaultValue={submittedValues?.twitchUrl ?? initialValues?.twitchUrl ?? ''}
            placeholder="Paste a Twitch channel link... (optional)"
            onBlur={(event) => validateField('twitchUrl', event.currentTarget, 'Twitch URL')}
          />
          <FieldError errors={fieldErrors.twitchUrl} />
        </label>

        <label className="form-label">
          Twitter URL
          <input
            autoComplete="off"
            className={getInputClassName(Boolean(fieldErrors.twitterUrl?.length))}
            name="twitterUrl"
            type="url"
            defaultValue={submittedValues?.twitterUrl ?? initialValues?.twitterUrl ?? ''}
            placeholder="Paste a Twitter/X profile link... (optional)"
            onBlur={(event) => validateField('twitterUrl', event.currentTarget, 'Twitter URL')}
          />
          <FieldError errors={fieldErrors.twitterUrl} />
        </label>

        <label className="form-label">
          Country
          <select
            autoComplete="off"
            className={getInputClassName(Boolean(fieldErrors.country1?.length))}
            name="country1"
            onChange={(event) => setCountry1(event.target.value)}
            onBlur={(event) => validateField('country1', event.currentTarget, 'Country')}
            defaultValue={submittedValues?.country1 ?? initialValues?.country1 ?? ''}
          >
            <option value="">Select a country (optional)</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name} ({country.code})
              </option>
            ))}
          </select>
          <FieldError errors={fieldErrors.country1} />
        </label>

        {country1 && (
          <label className="form-label">
            Country 2
            <select
              autoComplete="off"
              className={getInputClassName(Boolean(fieldErrors.country2?.length))}
              name="country2"
              onBlur={(event) => validateField('country2', event.currentTarget, 'Country 2')}
              defaultValue={submittedValues?.country2 ?? initialValues?.country2 ?? ''}
            >
              <option value="">Select a second country (optional)</option>
              {countries.filter((country) => country.code !== country1).map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.code})
                </option>
              ))}
            </select>
            <FieldError errors={fieldErrors.country2} />
          </label>
        )}
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
