import { Trait } from '@buildeross/types'
import * as Yup from 'yup'

export interface ArtworkFormValues {
  artwork: Trait[]
  filesLength: number | string
  fileType: string
  externalUrl?: string
  collectionName?: string
}

export const validationSchemaArtwork = Yup.object().shape({
  artwork: Yup.array()
    .of(
      Yup.object().shape({
        trait: Yup.string(),
        properties: Yup.array().of(Yup.string()),
      })
    )
    .min(1, 'Artwork required'),
})
