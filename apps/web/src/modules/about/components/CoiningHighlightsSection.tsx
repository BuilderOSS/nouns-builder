import { Box } from '@buildeross/zord'
import React from 'react'

import { scrollRow } from '../AboutPage.css'
import { coiningHighlights } from '../data'
import { CoiningHighlight } from '../types'
import { CoiningCard } from './CoiningCard'
import { SectionIntro } from './SectionIntro'

type CoiningHighlightsSectionProps = {
  items?: CoiningHighlight[]
}

export const CoiningHighlightsSection: React.FC<CoiningHighlightsSectionProps> = ({
  items,
}) => {
  const highlights = items?.length ? items : coiningHighlights

  return (
    <Box>
      <SectionIntro
        eyebrowText="Coining"
        title="Coining turns content into contribution"
        copy="Turn posts, releases, and media into funding, discovery, and member participation."
      />

      <Box className={scrollRow}>
        {highlights.map((item) => (
          <CoiningCard item={item} key={item.id} />
        ))}
      </Box>
    </Box>
  )
}
