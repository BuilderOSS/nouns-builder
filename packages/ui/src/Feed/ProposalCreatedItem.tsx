import type { ProposalCreatedFeedItem } from '@buildeross/types'
import { Stack, Text } from '@buildeross/zord'
import React from 'react'

import { useLinks } from '../LinksProvider'
import { LinkWrapper } from '../LinkWrapper'
import { feedItemDescription, feedItemSubtitle, feedItemTitle } from './Feed.css'

interface ProposalCreatedItemProps {
  item: ProposalCreatedFeedItem
}

export const ProposalCreatedItem: React.FC<ProposalCreatedItemProps> = ({ item }) => {
  const { getProposalLink } = useLinks()

  return (
    <LinkWrapper link={getProposalLink(item.chainId, item.daoId, item.proposalId)}>
      <Stack gap="x2">
        <Text className={feedItemTitle}>Proposal #{item.proposalNumber} Created</Text>
        <Text className={feedItemSubtitle}>{item.proposalTitle}</Text>
        {item.proposalDescription && (
          <Text className={feedItemDescription} style={{ wordBreak: 'break-word' }}>
            {item.proposalDescription.slice(0, 200)}
            {item.proposalDescription.length > 200 ? '...' : ''}
          </Text>
        )}
      </Stack>
    </LinkWrapper>
  )
}
