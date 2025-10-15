import * as Yup from 'yup'

export interface ArtworkType {
  trait: string
  properties: string[]
}

export interface ArtworkFormValues {
  artwork: Array<ArtworkType>
  filesLength: number | string
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
