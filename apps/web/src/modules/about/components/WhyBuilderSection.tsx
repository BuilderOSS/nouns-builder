import { Box, Text } from '@buildeross/zord'
import React from 'react'

import {
  compactValueCard,
  compactValueGrid,
  compactValueTitle,
  mutedText,
  section,
} from '../AboutPage.css'
import { builderValueProps } from '../data'
import { SectionIntro } from './SectionIntro'

export const WhyBuilderSection: React.FC = () => {
  return (
    <Box className={section}>
      <SectionIntro
        eyebrowText="Why Builder"
        title="Why Nouns Builder"
        copy="Most DAO stacks require multiple tools to manage governance, funding, and coordination. Builder combines all of it into a single onchain system. You don't assemble a stack. You launch a DAO, with no coding required."
      />

      <Box className={compactValueGrid}>
        {builderValueProps.map((item) => (
          <Box className={compactValueCard} key={item.id}>
            <Text as="h3" className={compactValueTitle}>
              {item.title}
            </Text>
            {item.body ? (
              <Text className={mutedText} mt="x3">
                {item.body}
              </Text>
            ) : null}
          </Box>
        ))}
      </Box>
    </Box>
  )
}
