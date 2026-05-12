import { Box, Text } from '@buildeross/zord'
import React from 'react'

import {
  featureIconBadge,
  featureItem,
  featureLabel,
  featureStrip,
  section,
} from '../AboutPage.css'
import { builderValueProps } from '../data'
import type { BuilderValueProp } from '../types'
import { SectionIntro } from './SectionIntro'

type FeatureIcon = 'rocket' | 'treasury' | 'governance' | 'creative'

const featureIconsById: Record<string, FeatureIcon> = {
  'launch-fast': 'rocket',
  'treasury-auctions': 'treasury',
  'governance-day-one': 'governance',
  'creative-output': 'creative',
}

const FeatureIconSvg = ({ icon }: { icon: FeatureIcon }) => {
  switch (icon) {
    case 'rocket':
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path
            d="M13.5 5.5c1.8-1.8 4.1-2.6 6.5-2.5.1 2.4-.7 4.7-2.5 6.5l-5.8 5.8-3-3 4.8-6z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M8.5 12.5 6 13l-2 3 3-.5.5 3 3-2 .5-2.5M15 8h.01"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      )
    case 'treasury':
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path
            d="M4 9h16M6 9l6-4 6 4M7 9v8M12 9v8M17 9v8M5 19h14"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      )
    case 'governance':
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path
            d="M7 4h10v16H7zM9.5 9.5l1.5 1.5 3.5-3.5M9.5 15h5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      )
    case 'creative':
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path
            d="M12 3c-4.4 0-8 3.1-8 7 0 2.7 2 5 4.5 5h1.3c.8 0 1.2.9.8 1.5-.7 1.1.1 2.5 1.4 2.5 4.4 0 8-3.6 8-8s-3.6-8-8-8Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M7.5 10h.01M10 7.5h.01M14 7.5h.01M16.5 10h.01"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      )
  }
}

const FeatureItem = ({ item }: { item: BuilderValueProp }) => (
  <Box className={featureItem}>
    <Box className={featureIconBadge}>
      <FeatureIconSvg icon={featureIconsById[item.id]} />
    </Box>
    <Text as="h3" className={featureLabel}>
      {item.title}
    </Text>
  </Box>
)

export const WhyBuilderSection: React.FC = () => {
  return (
    <Box className={section}>
      <SectionIntro
        eyebrowText="Why Builder"
        title="Why Nouns Builder"
        copy="Most DAO stacks require multiple tools to manage governance, funding, and coordination. Builder combines all of it into a single onchain system. You don't assemble a stack. You launch a DAO, with no coding required."
      />

      <Box className={featureStrip}>
        {builderValueProps.map((item) => (
          <FeatureItem item={item} key={item.id} />
        ))}
      </Box>
    </Box>
  )
}
