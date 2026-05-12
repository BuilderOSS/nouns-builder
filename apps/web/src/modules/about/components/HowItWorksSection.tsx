import { Box, Text } from '@buildeross/zord'
import React from 'react'

import {
  stepBody,
  stepCard,
  stepHeader,
  stepMarker,
  stepsGrid,
  stepTitle,
} from '../AboutPage.css'
import { builderSteps } from '../data'
import { SectionIntro } from './SectionIntro'

export const HowItWorksSection: React.FC = () => {
  return (
    <Box>
      <SectionIntro eyebrowText="DAO Builder" title="How it works" />

      <Box className={stepsGrid}>
        {builderSteps.map((step) => (
          <Box className={stepCard} key={step.id}>
            <Box className={stepHeader}>
              <Text className={stepMarker}>{step.marker}</Text>
              <Text as="h3" className={stepTitle}>
                {step.title}
              </Text>
            </Box>
            <Text className={stepBody}>{step.body}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
