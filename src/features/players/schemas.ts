import { z } from 'zod'

import { ISO_COUNTRY_CODES } from '@/lib/countries'

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().trim().max(max).optional(),
  )

const optionalUrl = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.url().optional(),
)

const optionalCountry = z.preprocess(
  (value) => {
    if (value === '') {
      return undefined
    }

    return typeof value === 'string' ? value.toUpperCase() : value
  },
  z.enum(ISO_COUNTRY_CODES).optional(),
)

const slug = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(100, 'Slug must be 100 characters or fewer')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain lowercase letters, numbers, and hyphens only')

export const playerFieldsSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  slug,
  bio: optionalText(5_000),
  avatarUrl: optionalUrl,
  discordHandle: optionalText(100),
  youtubeUrl: optionalUrl,
  twitchUrl: optionalUrl,
  twitterUrl: optionalUrl,
  country1: optionalCountry,
  country2: optionalCountry,
}).superRefine((values, context) => {
  if (values.country2 && !values.country1) {
    context.addIssue({
      code: 'custom',
      path: ['country2'],
      message: 'Choose Country 1 before selecting Country 2',
    })
  }

  if (values.country1 && values.country1 === values.country2) {
    context.addIssue({
      code: 'custom',
      path: ['country2'],
      message: 'Country 2 must be different from Country 1',
    })
  }
})

export const createPlayerSchema = playerFieldsSchema

export const updatePlayerSchema = playerFieldsSchema.extend({
  id: z.string().trim().min(1, 'Player ID is required'),
})

export type PlayerFields = z.infer<typeof playerFieldsSchema>
export type CreatePlayerInput = z.infer<typeof createPlayerSchema>
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>

export type PlayerFormSubmittedValues = Partial<Record<keyof CreatePlayerInput, string>>

const playerFormFields: (keyof CreatePlayerInput)[] = [
  'name',
  'slug',
  'bio',
  'avatarUrl',
  'discordHandle',
  'youtubeUrl',
  'twitchUrl',
  'twitterUrl',
  'country1',
  'country2',
]

export function getPlayerFormSubmittedValues(formData: FormData): PlayerFormSubmittedValues {
  return Object.fromEntries(
    playerFormFields.flatMap((field) => {
      const value = formData.get(field)
      return typeof value === 'string' ? [[field, value]] : []
    }),
  ) as PlayerFormSubmittedValues
}
