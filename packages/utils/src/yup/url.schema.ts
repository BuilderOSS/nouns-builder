import * as Yup from 'yup'

export const urlValidationSchema = Yup.string()
  .optional()
  .transform((value) => (typeof value === 'string' ? value.replace(/\/$/, '') : value))
  .test('is-url', 'Invalid URL', (value) => {
    // Allow empty or undefined if optional
    if (!value) return true
    try {
      const parsed = new URL(value)
      return ['http:', 'https:'].includes(parsed.protocol) // only allow http/https
    } catch {
      return false
    }
  })
