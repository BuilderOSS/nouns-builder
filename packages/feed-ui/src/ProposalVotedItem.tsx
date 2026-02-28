import { useEnsData } from '@buildeross/hooks/useEnsData'
import type { ProposalVotedFeedItem } from '@buildeross/types'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper } from '@buildeross/ui/LinkWrapper'
import { MarkdownDisplay } from '@buildeross/ui/MarkdownDisplay'
import { Box, Flex, Stack, Text } from '@buildeross/zord'
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
  const { displayName } = useEnsData(item.voter)

  const reason = item.reason?.trim()

  // Color mapping for vote support
  const getVoteColor = (support: string) => {
    switch (support) {
      case 'FOR':
        return 'positive'
      case 'AGAINST':
        return 'negative'
      case 'ABSTAIN':
        return 'tertiary'
      default:
        return 'text1'
    }
  }

  return (
    <LinkWrapper
      link={getProposalLink(item.chainId, item.daoId, item.proposalNumber, 'votes')}
      isExternal
    >
      <Stack gap="x3" w="100%">
        <Stack gap="x2">
          <Flex className={feedItemTitle} gap="x1" align="center" wrap="wrap">
            <Text>{displayName} voted</Text>
            <Text color={getVoteColor(item.support)}>{item.support}</Text>
            <Text>with {item.weight} votes</Text>
          </Flex>
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
