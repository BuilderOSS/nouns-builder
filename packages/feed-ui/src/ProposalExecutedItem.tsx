import type { ProposalExecutedFeedItem } from '@buildeross/types'
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

interface ProposalExecutedItemProps {
  item: ProposalExecutedFeedItem
}

export const ProposalExecutedItem: React.FC<ProposalExecutedItemProps> = ({ item }) => {
  const { getProposalLink } = useLinks()

  const description = item.proposalDescription?.trim()

  return (
    <LinkWrapper
      link={getProposalLink(item.chainId, item.daoId, item.proposalNumber, 'details')}
    >
      <Stack gap="x3" w="100%">
        <Stack gap="x2">
          <Text className={feedItemTitle}>
            Proposal #{item.proposalNumber} - Executed
          </Text>
          <Text className={feedItemSubtitle}>{item.proposalTitle}</Text>
          {description && (
            <Box className={feedItemTextContentWrapper}>
              <Box className={feedItemTextContent}>
                <MarkdownDisplay disableLinks>{description}</MarkdownDisplay>
              </Box>
            </Box>
          )}
        </Stack>
      </Stack>
    </LinkWrapper>
  )
}
