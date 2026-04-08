import { useEnsData } from '@buildeross/hooks/useEnsData'
import type { ProposalCreatedFeedItem } from '@buildeross/types'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper } from '@buildeross/ui/LinkWrapper'
import { MarkdownDisplay } from '@buildeross/ui/MarkdownDisplay'
import { walletSnippet } from '@buildeross/utils'
import { Box, Stack, Text } from '@buildeross/zord'
import React from 'react'

import {
  feedItemSubtitle,
  feedItemTextContent,
  feedItemTextContentWrapper,
  feedItemTitle,
} from './Feed.css'
import { FeedWalletProfilePreview } from './FeedWalletProfilePreview'

interface ProposalCreatedItemProps {
  item: ProposalCreatedFeedItem
}

export const ProposalCreatedItem: React.FC<ProposalCreatedItemProps> = ({ item }) => {
  const { getProposalLink } = useLinks()
  const { displayName, ensAvatar } = useEnsData(item.proposer)

  const description = item.proposalDescription?.trim()

  return (
    <LinkWrapper
      link={getProposalLink(item.chainId, item.daoId, item.proposalNumber, 'details')}
      isExternal
    >
      <Stack gap="x3" w="100%">
        <Stack gap="x2">
          <Text className={feedItemTitle}>
            <FeedWalletProfilePreview
              address={item.proposer}
              displayName={displayName}
              avatarSrc={ensAvatar}
              inline
            >
              <Box as="span">{displayName || walletSnippet(item.proposer)}</Box>
            </FeedWalletProfilePreview>{' '}
            proposed
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
