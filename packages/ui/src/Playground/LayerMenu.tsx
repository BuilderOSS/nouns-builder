import { ImageProps, SelectedTraitsProps } from '@buildeross/types'
import { Box, Stack } from '@buildeross/zord'
import React, { useCallback } from 'react'

import { selectTraitNameStyle, selectTraitNameWrapper } from '../Artwork/Artwork.css'
import { DropdownSelect, type SelectOption } from '../DropdownSelect'

interface LayerProps {
  trait: string
  images: ImageProps[]
}

export const LayerMenu: React.FC<{
  layers: LayerProps[]
  selectedTraits: SelectedTraitsProps[]
  setSelectedTraits: (selectedTraits: SelectedTraitsProps[]) => void
}> = ({ layers, selectedTraits, setSelectedTraits }) => {
  const handleChange = useCallback(
    (selectedValue: string, images: ImageProps[], trait: string) => {
      const isRandom = selectedValue === 'random'
      const imageIndex = isRandom
        ? Math.floor(Math.random() * images.length)
        : Number(selectedValue)
      const selectedImage = images[imageIndex]

      const traitIndex = selectedTraits.findIndex(
        (selected: SelectedTraitsProps) => selected.picker === trait
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
    },
    [selectedTraits, setSelectedTraits]
  )

  return (
    <Stack className={selectTraitNameWrapper}>
      {layers?.map((layer) => {
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
            <DropdownSelect
              value="random"
              onChange={(nextValue) => handleChange(String(nextValue), images, trait)}
              options={[
                { label: 'Random', value: 'random' } as SelectOption<string>,
                ...images.map((image: ImageProps, index: number) => ({
                  label: image.name,
                  value: String(index),
                })),
              ]}
              customLabel={'Random'}
              positioning="absolute"
            />
          </Stack>
        )
      })}
    </Stack>
  )
}
