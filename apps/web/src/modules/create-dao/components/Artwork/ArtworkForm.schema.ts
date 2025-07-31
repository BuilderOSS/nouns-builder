import { ArtworkType } from '@buildeross/hooks/useArtworkUpload'
import * as Yup from 'yup'

export interface ArtworkFormValues {
  projectDescription: string
  artwork: Array<ArtworkType>
  filesLength: number | string
  externalUrl?: string
  collectionName?: string
}

export const validationSchemaArtwork = Yup.object().shape({
  projectDescription: Yup.string().required('*').max(5000, '< 5000 characters'),
  artwork: Yup.array()
    .of(
      Yup.object().shape({
        trait: Yup.string(),
        properties: Yup.array().of(Yup.string()),
      })
    )
    .min(1, 'Artwork required'),
})
