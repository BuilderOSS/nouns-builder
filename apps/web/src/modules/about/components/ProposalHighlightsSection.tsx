import React from 'react'

import { proposalHighlights } from '../data'
import { DroposalHighlight } from '../types'
import { DroposalHighlightsSection } from './DroposalHighlightsSection'

type ProposalHighlightsSectionProps = {
  items?: DroposalHighlight[]
}

export const ProposalHighlightsSection: React.FC<ProposalHighlightsSectionProps> = ({
  items,
}) => {
  const highlights = items?.length ? items : proposalHighlights

  return (
    <DroposalHighlightsSection
      items={highlights}
      eyebrowText="Proposals"
      title="Onchain proposals fund work with transparent governance"
      copy="Use onchain proposals to fund projects and coordinate contributors with transparent governance."
      linkLabel="View proposal"
    />
  )
}
