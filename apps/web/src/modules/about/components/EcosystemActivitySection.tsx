import { Box, Text } from '@buildeross/zord'
import React from 'react'

import {
  activityCard,
  activityList,
  activityMeta,
  activityTitle,
  mutedText,
} from '../AboutPage.css'
import { ecosystemActivity } from '../data'
import { SectionIntro } from './SectionIntro'

export const EcosystemActivitySection: React.FC = () => {
  return (
    <Box>
      <SectionIntro
        eyebrowText="Builder In Motion"
        title="The system keeps changing because the ecosystem keeps trying new things."
        copy="This is where Builder feels most alive: launches, creator experiments, proposal formats, and protocol upgrades feeding back into each other."
      />

      <Box className={activityList}>
        {ecosystemActivity.map((item) => (
          <Box className={activityCard} key={item.id}>
            <Text className={activityMeta}>{item.meta}</Text>
            <Box>
              <Text as="h3" className={activityTitle}>
                {item.title}
              </Text>
              <Text className={mutedText} mt="x2">
                {item.detail}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
