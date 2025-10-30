import type { ProposalExecutedFeedItem } from '@buildeross/types'
import { Stack, Text } from '@buildeross/zord'
import React from 'react'

import { useLinks } from '../LinksProvider'
import { LinkWrapper } from '../LinkWrapper'
import { feedItemSubtitle, feedItemTitle } from './Feed.css'

interface ProposalExecutedItemProps {
  item: ProposalExecutedFeedItem
}

export const ProposalExecutedItem: React.FC<ProposalExecutedItemProps> = ({ item }) => {
  const { getProposalLink } = useLinks()

  return (
    <LinkWrapper link={getProposalLink(item.chainId, item.daoId, item.proposalId)}>
      <Stack gap="x2">
        <Text className={feedItemTitle}>Proposal #{item.proposalNumber} Executed</Text>
        <Text className={feedItemSubtitle}>{item.proposalTitle}</Text>
      </Stack>
    </LinkWrapper>
  )
}
