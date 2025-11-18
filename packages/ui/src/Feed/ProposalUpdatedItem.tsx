import { getPropdateMessage } from '@buildeross/sdk/subgraph'
import type { ProposalUpdatePostedFeedItem } from '@buildeross/types'
import { Box, Stack, Text } from '@buildeross/zord'
import React, { useEffect, useState } from 'react'
import removeMd from 'remove-markdown'

import { FallbackImage } from '../FallbackImage'
import { useLinks } from '../LinksProvider'
import { LinkWrapper } from '../LinkWrapper'
import {
  feedItemDescription,
  feedItemImage,
  feedItemSubtitle,
  feedItemTitle,
} from './Feed.css'
import { ImageSkeleton } from './FeedSkeleton'
import { findFirstImage, truncateContent } from './helpers'

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

  const displayContent = isLoading
    ? 'Loading...'
    : truncateContent(removeMd(parsedContent))

  const proposalImage = findFirstImage(item.proposalDescription)
  const propdateImage = findFirstImage(parsedContent)
  const finalImage = isLoading ? null : (propdateImage ?? proposalImage)

  return (
    <LinkWrapper link={getProposalLink(item.chainId, item.daoId, item.proposalId)}>
      <Stack gap="x3" w="100%">
        {proposalImage && (
          <Box className={feedItemImage}>
            <FallbackImage
              src={finalImage}
              alt={item.proposalTitle}
              loadingPlaceholder={<ImageSkeleton />}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        )}
        <Stack gap="x2">
          <Text className={feedItemTitle}>
            Proposal #{item.proposalNumber} - Update Posted
          </Text>
          <Text className={feedItemSubtitle}>{item.proposalTitle}</Text>
          <Text className={feedItemDescription} style={{ wordBreak: 'break-word' }}>
            {displayContent}
          </Text>
        </Stack>
      </Stack>
    </LinkWrapper>
  )
}
