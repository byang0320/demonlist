import { z } from 'zod'

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().trim().max(max).optional(),
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

export const playerFieldsSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  slug,
  bio: optionalText(5_000),
  avatarUrl: optionalUrl,
  externalUrl: optionalUrl,
})

export const createPlayerSchema = playerFieldsSchema

export const updatePlayerSchema = playerFieldsSchema.extend({
  id: z.string().trim().min(1, 'Player ID is required'),
})

export type PlayerFields = z.infer<typeof playerFieldsSchema>
export type CreatePlayerInput = z.infer<typeof createPlayerSchema>
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>
