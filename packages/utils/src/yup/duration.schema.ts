import * as Yup from 'yup'

import { toSeconds } from '../helpers'

export const durationValidationSchema = (
  min?: { value: number; description: string },
  max?: { value: number; description: string }
) =>
  Yup.object()
    .shape({
      seconds: Yup.number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .min(0, '>= 0')
        .max(60, '<= 60 seconds'),
      minutes: Yup.number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .min(0, '>= 0')
        .max(60, '<= 60 minutes'),
      days: Yup.number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .min(0, '>= 0'),
      hours: Yup.number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .min(0, '>= 0')
        .max(24, '<= 24 hours'),
    })
    .test('minValue', `Value is below minimum of ${min?.description}`, (value) => {
      if (min) {
        const valueInSeconds = toSeconds(value)
        return valueInSeconds >= min.value
      }
      return true
    })
    .test('maxValue', `Value is above maximum of ${max?.description}`, (value) => {
      if (max) {
        const valueInSeconds = toSeconds(value)
        return valueInSeconds <= max.value
      }
      return true
    })
