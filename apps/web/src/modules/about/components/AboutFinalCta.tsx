import { Box, Button, Text } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'

import {
  aboutCtaButton,
  finalActions,
  finalChecklist,
  finalChecklistItem,
  finalChecklistMarker,
  finalCta,
  finalCtaContent,
  finalCtaGlow,
  finalCtaTitle,
} from '../AboutPage.css'

export const AboutFinalCta: React.FC = () => {
  return (
    <Box className={finalCta}>
      <Box className={finalCtaGlow} />
      <Box className={finalCtaContent}>
        <Box>
          <Text className={finalCtaTitle}>Start your DAO today</Text>
          <Box as="ol" className={finalChecklist}>
            <Box as="li" className={finalChecklistItem}>
              <Text className={finalChecklistMarker}>1.</Text>
              <Text>Upload your art</Text>
            </Box>
            <Box as="li" className={finalChecklistItem}>
              <Text className={finalChecklistMarker}>2.</Text>
              <Text>Set your parameters</Text>
            </Box>
            <Box as="li" className={finalChecklistItem}>
              <Text className={finalChecklistMarker}>3.</Text>
              <Text>Launch your first auction</Text>
            </Box>
          </Box>
        </Box>

        <Box className={finalActions}>
          <Button
            as={Link}
            className={aboutCtaButton}
            href="/create"
            pill
            variant="primary"
          >
            Launch your DAO
          </Button>
          <Button
            as={Link}
            className={aboutCtaButton}
            href="/explore"
            pill
            variant="outline"
          >
            Explore the ecosystem
          </Button>
          <Button
            as="a"
            className={aboutCtaButton}
            href="https://docs.nouns.build"
            pill
            rel="noreferrer"
            target="_blank"
            variant="ghost"
          >
            Read the docs
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
