import type { ProposalUpdatePostedFeedItem } from '@buildeross/types'
import { Stack, Text } from '@buildeross/zord'
import React from 'react'

import { useLinks } from '../LinksProvider'
import { LinkWrapper } from '../LinkWrapper'
import { feedItemDescription, feedItemTitle } from './Feed.css'

interface ProposalUpdatedItemProps {
  item: ProposalUpdatePostedFeedItem
}

export const ProposalUpdatedItem: React.FC<ProposalUpdatedItemProps> = ({ item }) => {
  const { getProposalLink } = useLinks()

  return (
    <LinkWrapper link={getProposalLink(item.chainId, item.daoId, item.proposalId)}>
      <Stack gap="x2">
        <Text className={feedItemTitle}>Proposal Update Posted</Text>
        <Text className={feedItemDescription} style={{ wordBreak: 'break-word' }}>
          {item.message.slice(0, 200)}
          {item.message.length > 200 ? '...' : ''}
        </Text>
      </Stack>
    </LinkWrapper>
  )
}
