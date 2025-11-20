import { usePropdateMessage } from '@buildeross/hooks/usePropdateMessage'
import type { ProposalUpdatePostedFeedItem } from '@buildeross/types'
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

interface ProposalUpdatedItemProps {
  item: ProposalUpdatePostedFeedItem
}

export const ProposalUpdatedItem: React.FC<ProposalUpdatedItemProps> = ({ item }) => {
  const { getProposalLink } = useLinks()
  const { parsedContent, isLoading } = usePropdateMessage(item.messageType, item.message)

  const displayContent = isLoading ? 'Loading...' : parsedContent || item.message

  return (
    <LinkWrapper
      link={getProposalLink(item.chainId, item.daoId, item.proposalNumber, 'propdates')}
    >
      <Stack gap="x3" w="100%">
        <Stack gap="x2">
          <Text className={feedItemTitle}>
            Proposal #{item.proposalNumber} - Update Posted
          </Text>
          <Text className={feedItemSubtitle}>{item.proposalTitle}</Text>
          <Box className={feedItemTextContentWrapper}>
            <Box className={feedItemTextContent}>
              <MarkdownDisplay>{displayContent}</MarkdownDisplay>
            </Box>
          </Box>
        </Stack>
      </Stack>
    </LinkWrapper>
  )
}
