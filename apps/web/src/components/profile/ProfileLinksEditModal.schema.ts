import {
  normalizeFarcasterHandle,
  normalizeXHandle,
  validateWebsiteUrl,
} from 'src/utils/profileIdentity'
import * as Yup from 'yup'

export interface ProfileLinksFormValues {
  website: string
  xHandle: string
  farcasterHandle: string
}

export const websiteSchema = Yup.string()
  .optional()
  .test('is-valid-website', 'Enter a valid website URL.', (value: string | undefined) => {
    if (!value?.trim()) return true
    return validateWebsiteUrl(value) !== null
  })

export const xHandleSchema = Yup.string()
  .optional()
  .test('is-valid-x-handle', 'Enter a valid X handle.', (value: string | undefined) => {
    if (!value?.trim()) return true
    return normalizeXHandle(value) !== null
  })

export const farcasterHandleSchema = Yup.string()
  .optional()
  .test(
    'is-valid-farcaster',
    'Enter a valid Farcaster handle.',
    (value: string | undefined) => {
      if (!value?.trim()) return true
      return normalizeFarcasterHandle(value) !== null
    }
  )

export const profileLinksValidationSchema = Yup.object().shape({
  website: websiteSchema,
  xHandle: xHandleSchema,
  farcasterHandle: farcasterHandleSchema,
})
