import type { ProposalVotedFeedItem } from '@buildeross/types'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper } from '@buildeross/ui/LinkWrapper'
import { MarkdownDisplay } from '@buildeross/ui/MarkdownDisplay'
import { Box, Stack, Text } from '@buildeross/zord'
import React from 'react'

import {
  feedItemSubtitle,
  feedItemTextContent,
  feedItemTextContentWrapper,
  feedItemTitle,
} from './Feed.css'

interface ProposalVotedItemProps {
  item: ProposalVotedFeedItem
}

export const ProposalVotedItem: React.FC<ProposalVotedItemProps> = ({ item }) => {
  const { getProposalLink } = useLinks()

  const reason = item.reason?.trim()

  return (
    <LinkWrapper
      link={getProposalLink(item.chainId, item.daoId, item.proposalNumber, 'votes')}
    >
      <Stack gap="x3" w="100%">
        <Stack gap="x2">
          <Text className={feedItemTitle}>
            Proposal #{item.proposalNumber} - Vote Cast: {item.support} ({item.weight})
          </Text>
          <Text className={feedItemSubtitle}>{item.proposalTitle}</Text>
          {reason && (
            <Box className={feedItemTextContentWrapper}>
              <Box className={feedItemTextContent}>
                <MarkdownDisplay disableLinks>{reason}</MarkdownDisplay>
              </Box>
            </Box>
          )}
        </Stack>
      </Stack>
    </LinkWrapper>
  )
}
