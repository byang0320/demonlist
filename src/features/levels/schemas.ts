import { z } from 'zod'

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().trim().max(max).optional(),
  )

const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required`).max(max)

const optionalBoolean = z.preprocess(
  (value) => {
    if (value === '' || value === undefined || value === false || value === 'false') {
      return false
    }

    if (value === true || value === 'true' || value === 'on') {
      return true
    }

    return value
  },
  z.boolean().default(false),
)

const optionalUrl = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.url().optional(),
)

const slug = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(100, 'Slug must be 100 characters or fewer')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain lowercase letters, numbers, and hyphens only')

const rank = z.coerce
  .number()
  .int('Rank must be a whole number')
  .positive('Rank must be greater than zero')

export const levelFieldsSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  slug,
  rank,
  type: z.enum(['Classic', 'Platformer']),
  demoted: optionalBoolean,
  unrated: optionalBoolean,
  publishedBy: requiredText('Published by', 200),
  createdBy: optionalText(200),
  verifiedBy: optionalText(200),
  description: optionalText(5_000),
  videoUrl: optionalUrl,
  status: z.enum(['ACTIVE', 'ARCHIVED']).default('ACTIVE'),
})

export const createLevelSchema = levelFieldsSchema

export const updateLevelSchema = levelFieldsSchema.extend({
  id: z.string().trim().min(1, 'Level ID is required'),
})

export const moveLevelSchema = z.object({
  levelId: z.string().trim().min(1, 'Level ID is required'),
  targetRank: rank,
})

export type LevelFields = z.infer<typeof levelFieldsSchema>
export type CreateLevelInput = z.infer<typeof createLevelSchema>
export type UpdateLevelInput = z.infer<typeof updateLevelSchema>
export type MoveLevelInput = z.infer<typeof moveLevelSchema>

export type LevelFormSubmittedValues = Partial<Record<keyof CreateLevelInput, string>>

const levelFormFields: (keyof CreateLevelInput)[] = [
  'name',
  'slug',
  'rank',
  'type',
  'demoted',
  'unrated',
  'publishedBy',
  'createdBy',
  'verifiedBy',
  'description',
  'videoUrl',
  'status',
]

export function getLevelFormSubmittedValues(formData: FormData): LevelFormSubmittedValues {
  return Object.fromEntries(
    levelFormFields.flatMap((field) => {
      const fieldValues = formData.getAll(field)
      const value = fieldValues[fieldValues.length - 1]
      return typeof value === 'string' ? [[field, value]] : []
    }),
  ) as LevelFormSubmittedValues
}
