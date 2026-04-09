import { urlValidationSchema } from '@buildeross/utils/yup'
import * as Yup from 'yup'

export interface GeneralFormValues {
  daoAvatar?: string
  daoName: string
  daoSymbol: string
  daoWebsite?: string
  projectDescription: string
  links: { key: string; url: string }[]
}

export const generalValidationSchema = Yup.object().shape({
  daoAvatar: Yup.string(),
  daoName: Yup.string().required('*').max(255),
  daoSymbol: Yup.string()
    .max(24, '<= 24 characters')
    .matches(/^[$]*[a-zA-Z0-9_-]*$/i)
    .required('*'),
  daoWebsite: urlValidationSchema,
  projectDescription: Yup.string().required('*').max(5000, '< 5000 characters'),
  links: Yup.array()
    .of(
      Yup.object().shape({
        key: Yup.string().trim().required('*'),
        url: urlValidationSchema.required('*'),
      })
    )
    .test('unique-link-keys', 'Link keys should be unique.', (values) => {
      const keys = (values || [])
        .map((link) => link?.key?.trim()?.toLowerCase() || '')
        .filter(Boolean)

      return keys.length === new Set(keys).size
    }),
})
