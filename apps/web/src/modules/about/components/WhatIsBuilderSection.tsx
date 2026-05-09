import { Box, Text } from '@buildeross/zord'
import React from 'react'

import {
  mutedText,
  stepHeader,
  stepMarker,
  valueCard,
  valueGrid,
  valueTitle,
} from '../AboutPage.css'
import { builderFeatures } from '../data'
import { SectionIntro } from './SectionIntro'

export const WhatIsBuilderSection: React.FC = () => {
  return (
    <Box>
      <SectionIntro
        eyebrowText="DAO Platform"
        title="The Nouns Builder Model"
        copy="Nouns Builder runs on a simple, infinitely repeatable loop."
      />

      <Box className={valueGrid}>
        {builderFeatures.map((item) => (
          <Box className={valueCard} key={item.id}>
            <Box className={stepHeader}>
              <Box className={stepMarker}>
                <Text>{item.marker}</Text>
              </Box>
              <Text as="h3" className={valueTitle}>
                {item.title}
              </Text>
            </Box>
            <Text className={mutedText} mt="x3">
              {item.body}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
