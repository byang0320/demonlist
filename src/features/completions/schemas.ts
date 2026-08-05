import { z } from 'zod'

const optionalDate = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.coerce.date().optional(),
)

const optionalText = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().trim().max(2_000).optional(),
)

const optionalUrl = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.url().optional(),
)

export const addCompletionSchema = z.object({
  playerId: z.string().trim().min(1, 'Player is required'),
  levelId: z.string().trim().min(1, 'Level is required'),
  times: z.coerce.number().int('Times must be a whole number').positive('Times must be greater than zero').default(1),
  completedAt: optionalDate,
  videoUrl: optionalUrl,
  notes: optionalText,
})

export type AddCompletionInput = z.infer<typeof addCompletionSchema>
