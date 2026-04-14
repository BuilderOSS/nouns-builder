import { ImageProps, SelectedTraitsProps } from '@buildeross/types'
import { atoms, Box, Flex, Icon, Stack } from '@buildeross/zord'
import React, { BaseSyntheticEvent, useCallback, useEffect, useState } from 'react'

import {
  layerSelectStyle,
  selectTraitNameStyle,
  selectTraitNameWrapper,
} from '../Artwork/Artwork.css'

interface LayerProps {
  trait: string
  images: ImageProps[]
}

const darkSelectText = '#1f2024'

export const LayerMenu: React.FC<{
  layers: LayerProps[]
  selectedTraits: SelectedTraitsProps[]
  setSelectedTraits: (selectedTraits: SelectedTraitsProps[]) => void
}> = ({ layers, selectedTraits, setSelectedTraits }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const updateThemeMode = () => {
      setIsDarkMode(document.documentElement.dataset.themeMode === 'dark')
    }

    updateThemeMode()

    const observer = new MutationObserver(updateThemeMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme-mode'],
    })

    return () => observer.disconnect()
  }, [])

  const handleChange = useCallback(
    (e: BaseSyntheticEvent, images: ImageProps[], trait: string) => {
      const isRandom = Number.isNaN(Number(e.target.value))
      const imageIndex = isRandom
        ? Math.floor(Math.random() * images.length)
        : Number(e.target.value)
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
            <Flex
              className={[
                atoms({
                  position: 'absolute',
                  top: 'x3',
                  right: 'x2',
                  pointerEvents: 'none',
                }),
              ]}
              style={isDarkMode ? { color: darkSelectText } : undefined}
            >
              <Icon id="chevronDown" />
            </Flex>

            <select
              className={layerSelectStyle}
              name={trait}
              defaultValue="Random"
              onChange={(e: BaseSyntheticEvent) => handleChange(e, images, trait)}
              style={
                isDarkMode
                  ? {
                      color: darkSelectText,
                      WebkitTextFillColor: darkSelectText,
                    }
                  : undefined
              }
            >
              <option
                key="random-property"
                value="random"
                style={isDarkMode ? { color: darkSelectText } : undefined}
              >
                Random
              </option>
              {images.map((image: ImageProps, index: number) => (
                <option
                  key={image.name}
                  value={index}
                  style={isDarkMode ? { color: darkSelectText } : undefined}
                >
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
