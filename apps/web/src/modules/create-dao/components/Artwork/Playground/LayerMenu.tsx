import { ImageProps } from '@buildeross/hooks'
import { SelectedTraitsProps } from '@buildeross/hooks/useArtworkPreview'
import { Box, Flex, Stack, atoms } from '@buildeross/zord'
import React, { BaseSyntheticEvent } from 'react'

import { Icon } from 'src/components/Icon'
import {
  layerSelectStyle,
  selectTraitNameStyle,
  selectTraitNameWrapper,
} from 'src/styles/Artwork.css'

interface layerProps {
  trait: string
  images: ImageProps[]
}

export const LayerMenu: React.FC<{
  layers: layerProps[]
  selectedTraits: SelectedTraitsProps[]
  setSelectedTraits: (selectedTraits: SelectedTraitsProps[]) => void
}> = ({ layers, selectedTraits, setSelectedTraits }) => {
  const handleChange = (e: BaseSyntheticEvent, images: ImageProps[], trait: string) => {
    const isRandom = Number.isNaN(Number(e.target.value))
    const imageIndex = isRandom
      ? Math.floor(Math.random() * images.length)
      : Number(e.target.value)
    const selectedImage = images[imageIndex]

    const traitIndex = selectedTraits.findIndex(
      (selected: SelectedTraitsProps) => selected.trait === trait
    )
    const picker = isRandom ? 'random' : trait

    if (traitIndex === -1) {
      setSelectedTraits([...selectedTraits, { picker, ...selectedImage }])
    } else {
      setSelectedTraits([
        ...selectedTraits.slice(0, traitIndex),
        { picker, ...selectedImage },
        ...selectedTraits.slice(traitIndex + 1),
      ])
    }
  }

  return (
    <Stack className={selectTraitNameWrapper}>
      {layers &&
        layers?.map((layer: any) => {
          const trait = layer.trait
          const images = layer.images

          return (
            <Stack key={trait} position={'relative'}>
              <Box
                position="absolute"
                top={'x1'}
                left={'x4'}
                fontSize={12}
                className={selectTraitNameStyle}
              >
                {trait}
              </Box>
              <Flex
                className={[
                  atoms({
                    position: 'absolute',
                    top: 'x3',
                    right: 'x2',
                    pointerEvents: 'none',
                  }),
                ]}
              >
                <Icon id="chevronDown" />
              </Flex>

              <select
                className={layerSelectStyle}
                name={trait}
                defaultValue="Random"
                onChange={(e: BaseSyntheticEvent) => handleChange(e, images, trait)}
              >
                <option key="random-property" value="random">
                  Random
                </option>
                {images.map((image: ImageProps, index: number) => (
                  <option key={image.name} value={index}>
                    {image.name}
                  </option>
                ))}
              </select>
            </Stack>
          )
        })}
    </Stack>
  )
}
