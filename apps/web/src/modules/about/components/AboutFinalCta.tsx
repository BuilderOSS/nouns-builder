import { Box, Text } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'

import {
  finalActions,
  finalChecklist,
  finalChecklistItem,
  finalChecklistMarker,
  finalCta,
  finalCtaContent,
  finalCtaGlow,
  finalCtaTitle,
  finalPrimaryButton,
  ghostButton,
  subLink,
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
          <Link className={finalPrimaryButton} href="/create">
            Launch your DAO
          </Link>
          <Link className={ghostButton} href="/explore">
            Explore the ecosystem
          </Link>
          <Link className={subLink} href="https://docs.nouns.build">
            Read the docs
          </Link>
        </Box>
      </Box>
    </Box>
  )
}
