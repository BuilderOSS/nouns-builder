import type { ProposalVotedFeedItem } from '@buildeross/types'
import { Box, Stack, Text } from '@buildeross/zord'
import React from 'react'

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

interface ProposalVotedItemProps {
  item: ProposalVotedFeedItem
}

export const ProposalVotedItem: React.FC<ProposalVotedItemProps> = ({ item }) => {
  const { getProposalLink } = useLinks()

  const displayContent = item.reason ? truncateContent(item.reason) : ''

  const proposalImage = findFirstImage(item.proposalDescription)
  return (
    <LinkWrapper link={getProposalLink(item.chainId, item.daoId, item.proposalId)}>
      <Stack gap="x3" w="100%">
        {proposalImage && (
          <Box className={feedItemImage}>
            <FallbackImage
              src={proposalImage}
              alt={item.proposalTitle}
              loadingPlaceholder={<ImageSkeleton />}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        )}
        <Stack gap="x2">
          <Text className={feedItemTitle}>
            Proposal #{item.proposalNumber} - Vote Cast: {item.support} ({item.weight})
          </Text>
          <Text className={feedItemSubtitle}>{item.proposalTitle}</Text>
          {displayContent && (
            <Text className={feedItemDescription} style={{ wordBreak: 'break-word' }}>
              {displayContent}
            </Text>
          )}
        </Stack>
      </Stack>
    </LinkWrapper>
  )
}
