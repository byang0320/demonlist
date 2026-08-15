import { z } from 'zod'

const optionalDate = z.preprocess(
  (value) => (value === '' ? null : value),
  z.coerce.date().nullable().optional(),
)

const optionalText = z.preprocess(
  (value) => (value === '' ? null : value),
  z.string().trim().max(2_000).nullable().optional(),
)

const optionalUrl = z.preprocess(
  (value) => (value === '' ? null : value),
  z.url().nullable().optional(),
)

export const addCompletionSchema = z.object({
  playerId: z.string().trim().min(1, 'Player is required'),
  levelId: z.string().trim().min(1, 'Level is required'),
  times: z.coerce.number().int('Times must be a whole number').positive('Times must be greater than zero').default(1),
  completedAt: optionalDate,
  videoUrl: optionalUrl,
  notes: optionalText,
})

export const updateCompletionSchema = addCompletionSchema.extend({
  id: z.string().trim().min(1, 'Completion ID is required'),
})

export type AddCompletionInput = z.infer<typeof addCompletionSchema>
export type UpdateCompletionInput = z.infer<typeof updateCompletionSchema>

export type CompletionFormSubmittedValues = Partial<Record<keyof AddCompletionInput, string>>

const completionFormFields: (keyof AddCompletionInput)[] = [
  'playerId',
  'levelId',
  'times',
  'completedAt',
  'videoUrl',
  'notes',
]

export function getCompletionFormSubmittedValues(formData: FormData): CompletionFormSubmittedValues {
  return Object.fromEntries(
    completionFormFields.flatMap((field) => {
      const value = formData.get(field)
      return typeof value === 'string' ? [[field, value]] : []
    }),
  ) as CompletionFormSubmittedValues
}
