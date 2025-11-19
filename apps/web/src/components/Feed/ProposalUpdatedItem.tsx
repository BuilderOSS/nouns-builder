import { getPropdateMessage } from '@buildeross/sdk/subgraph'
import type { ProposalUpdatePostedFeedItem } from '@buildeross/types'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper } from '@buildeross/ui/LinkWrapper'
import { MarkdownDisplay } from '@buildeross/ui/MarkdownDisplay'
import { Box, Stack, Text } from '@buildeross/zord'
import React, { useEffect, useState } from 'react'

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
  const [parsedContent, setParsedContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const parseMessage = async () => {
      try {
        setIsLoading(true)
        const parsed = await getPropdateMessage(item.messageType, item.message)
        setParsedContent(parsed.content || item.message)
      } catch (error) {
        console.error('Error parsing propdate message:', error)
        setParsedContent(item.message)
      } finally {
        setIsLoading(false)
      }
    }

    parseMessage()
  }, [item.messageType, item.message])

  const displayContent = isLoading ? 'Loading...' : parsedContent

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
