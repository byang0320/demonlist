import { useState } from 'react'

type FormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

export type ClientFieldErrors<FieldName extends string> = Partial<Record<FieldName, string[] | null>>

export function getFieldValidationError(
  control: FormControl,
  label: string,
): string | undefined {
  if (control.required && !control.value.trim()) {
    return `${label} is required`
  }

  const { validity } = control

  if (validity.valid) {
    return undefined
  }

  if (validity.typeMismatch && control instanceof HTMLInputElement && control.type === 'url') {
    return 'Enter a valid URL.'
  }

  if (validity.badInput) {
    return `${label} must be a number.`
  }

  if (validity.rangeUnderflow && control instanceof HTMLInputElement) {
    return `${label} must be at least ${control.min}.`
  }

  if (validity.rangeOverflow && control instanceof HTMLInputElement) {
    return `${label} must be at most ${control.max}.`
  }

  if (validity.stepMismatch) {
    return `${label} must be a whole number.`
  }

  if (validity.tooLong && 'maxLength' in control) {
    return `${label} must be ${control.maxLength} characters or fewer.`
  }

  return `Enter a valid ${label.toLowerCase()}.`
}

export function useFormFieldValidation<FieldName extends string>(
  serverErrors?: Partial<Record<FieldName, string[]>>,
) {
  const [clientErrorState, setClientErrorState] = useState<{
    source: Partial<Record<FieldName, string[]>> | undefined
    errors: ClientFieldErrors<FieldName>
  }>({
    source: serverErrors,
    errors: {},
  })

  function setFieldError(field: FieldName, error?: string) {
    setClientErrorState((currentState) => ({
      source: serverErrors,
      errors: {
        ...(currentState.source === serverErrors ? currentState.errors : {}),
        [field]: error ? [error] : null,
      },
    }))
  }

  function validateField(
    field: FieldName,
    control: FormControl,
    label: string,
    customError?: string,
  ) {
    setFieldError(field, customError ?? getFieldValidationError(control, label))
  }

  function getErrors(field: FieldName) {
    const currentErrors: ClientFieldErrors<FieldName> = clientErrorState.source === serverErrors
      ? clientErrorState.errors
      : {}

    if (Object.prototype.hasOwnProperty.call(currentErrors, field)) {
      return currentErrors[field] ?? undefined
    }

    return serverErrors?.[field]
  }

  return { getErrors, setFieldError, validateField }
}
