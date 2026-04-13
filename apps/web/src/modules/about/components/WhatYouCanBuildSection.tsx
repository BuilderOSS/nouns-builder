import { Box, Text } from '@buildeross/zord'
import React from 'react'

import {
  compactValueCard,
  compactValueEmoji,
  compactValueImage,
  compactValueTitle,
  useCaseGrid,
} from '../AboutPage.css'
import { builderUseCases } from '../data'
import { SectionIntro } from './SectionIntro'

export const WhatYouCanBuildSection: React.FC = () => {
  return (
    <Box>
      <SectionIntro
        eyebrowText="Use Cases"
        title="What you can build"
        copy="Nouns Builder is a perfect solution for communities with all types of missions."
      />

      <Box className={useCaseGrid}>
        {builderUseCases.map((item) => (
          <Box className={compactValueCard} key={item.id}>
            {item.imageSrc ? (
              <Box
                as="img"
                alt={item.title}
                className={compactValueImage}
                src={item.imageSrc}
              />
            ) : item.emoji ? (
              <Text className={compactValueEmoji}>{item.emoji}</Text>
            ) : null}
            <Text as="h3" className={compactValueTitle}>
              {item.title}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
