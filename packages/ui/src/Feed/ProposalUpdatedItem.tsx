import { getPropdateMessage } from '@buildeross/sdk/subgraph'
import type { ProposalUpdatePostedFeedItem } from '@buildeross/types'
import { Stack, Text } from '@buildeross/zord'
import React, { useEffect, useState } from 'react'
import removeMd from 'remove-markdown'

import { useLinks } from '../LinksProvider'
import { LinkWrapper } from '../LinkWrapper'
import { feedItemDescription, feedItemTitle } from './Feed.css'

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

  const displayContent = isLoading ? 'Loading...' : removeMd(parsedContent)
  const maxLength = 200
  const truncatedContent =
    displayContent.length > maxLength
      ? displayContent.slice(0, maxLength) + '...'
      : displayContent

  return (
    <LinkWrapper link={getProposalLink(item.chainId, item.daoId, item.proposalId)}>
      <Stack gap="x2">
        <Text className={feedItemTitle}>Proposal Update Posted</Text>
        <Text className={feedItemDescription} style={{ wordBreak: 'break-word' }}>
          {truncatedContent}
        </Text>
      </Stack>
    </LinkWrapper>
  )
}
