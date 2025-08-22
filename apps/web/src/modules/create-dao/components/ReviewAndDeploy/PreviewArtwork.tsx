import { AnimatedModal } from '@buildeross/ui'
import { flatten } from '@buildeross/utils/helpers'
import { Button } from '@buildeross/zord'
import React, { BaseSyntheticEvent } from 'react'
import { Playground } from 'src/components/Artwork/Playground'

import { useFormStore } from '../../stores'

export const PreviewArtwork: React.FC = () => {
  const { ipfsUpload, orderedLayers } = useFormStore()

  const images = React.useMemo(() => {
    if (!ipfsUpload) return

    const entries = Object.entries(ipfsUpload)
    const uploads = entries.reduce((acc: any[] = [], cv) => {
      acc.push(cv[1])

      return acc
    }, [])

    return uploads.reduce((acc: any[] = [], cv) => {
      if (!cv || typeof cv !== 'object') return
      const image = flatten(cv)
      acc.push({
        cid: image.cid,
        name: image.name,
        trait: image.trait,
        uri: image.uri,
        url: image.url,
        content: cv.content,
      })

      return acc
    }, [])
  }, [ipfsUpload])

  const [isOpenModal, setIsOpenModal] = React.useState<boolean>(false)

  return (
    <>
      <Button
        width="100%"
        onClick={(e: BaseSyntheticEvent) => {
          e.stopPropagation()
          setIsOpenModal(true)
        }}
      >
        Preview Artwork
      </Button>
      {images && orderedLayers && (
        <AnimatedModal
          open={isOpenModal}
          close={() => setIsOpenModal(false)}
          size={'large'}
        >
          <Playground images={images} orderedLayers={orderedLayers} />
        </AnimatedModal>
      )}
    </>
  )
}
