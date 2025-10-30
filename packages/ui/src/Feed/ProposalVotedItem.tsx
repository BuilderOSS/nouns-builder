import type { ProposalVotedFeedItem } from '@buildeross/types'
import { Stack, Text } from '@buildeross/zord'
import React from 'react'

import { useLinks } from '../LinksProvider'
import { LinkWrapper } from '../LinkWrapper'
import { feedItemDescription, feedItemMeta, feedItemTitle } from './Feed.css'

interface ProposalVotedItemProps {
  item: ProposalVotedFeedItem
}

export const ProposalVotedItem: React.FC<ProposalVotedItemProps> = ({ item }) => {
  const { getProposalLink } = useLinks()

  return (
    <LinkWrapper link={getProposalLink(item.chainId, item.daoId, item.proposalId)}>
      <Stack gap="x2">
        <Text className={feedItemTitle}>Vote Cast: {item.support}</Text>
        {item.reason && (
          <Text className={feedItemDescription} style={{ wordBreak: 'break-word' }}>
            {item.reason.slice(0, 200)}
            {item.reason.length > 200 ? '...' : ''}
          </Text>
        )}
        <Text className={feedItemMeta}>Weight: {item.weight}</Text>
      </Stack>
    </LinkWrapper>
  )
}
