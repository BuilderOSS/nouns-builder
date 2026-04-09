import { Trait } from '@buildeross/types'
import { urlValidationSchema } from '@buildeross/utils/yup'
import * as Yup from 'yup'

export interface DaoLinkFormValue {
  key: string
  url: string
}

export interface ArtworkFormValues {
  projectDescription: string
  links: DaoLinkFormValue[]
  artwork: Trait[]
  filesLength: number | string
  fileType: string
  externalUrl?: string
  collectionName?: string
}

export const validationSchemaArtwork = Yup.object().shape({
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
  artwork: Yup.array()
    .of(
      Yup.object().shape({
        trait: Yup.string(),
        properties: Yup.array().of(Yup.string()),
      })
    )
    .min(1, 'Artwork required'),
})
