import { getProposalStateColorStyle } from '@buildeross/proposal-ui'
import { ProposalState } from '@buildeross/sdk/contract'
import { Box, Text } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'

import {
  badge,
  cardLink,
  daoBadge,
  daoChainBadge,
  daoChainBadgeImage,
  droposalAside,
  droposalCard,
  droposalList,
  droposalMeta,
  droposalSummary,
  droposalTitle,
  mutedText,
  statusBadge,
} from '../AboutPage.css'
import { dropHighlights } from '../data'
import { DroposalHighlight } from '../types'
import { getChainLogoSrc } from '../utils'
import { SectionIntro } from './SectionIntro'

const statusStyleByType: Record<
  DroposalHighlight['status'],
  { borderColor: string; color: string }
> = {
  Active: getProposalStateColorStyle(ProposalState.Active),
  Succeeded: getProposalStateColorStyle(ProposalState.Succeeded),
  Queued: getProposalStateColorStyle(ProposalState.Queued),
  Defeated: getProposalStateColorStyle(ProposalState.Defeated),
  Executed: getProposalStateColorStyle(ProposalState.Executed),
  Trending: getProposalStateColorStyle(ProposalState.Defeated),
  Live: getProposalStateColorStyle(ProposalState.Succeeded),
  Recent: getProposalStateColorStyle(ProposalState.Active),
}

type DroposalHighlightsSectionProps = {
  items?: DroposalHighlight[]
  eyebrowText?: string
  title?: string
  copy?: string
  linkLabel?: string
  showStatusBadge?: boolean
}

export const DroposalHighlightsSection: React.FC<DroposalHighlightsSectionProps> = ({
  items,
  eyebrowText = 'Drops',
  title = 'Drops turn releases into onchain distribution',
  copy = 'Launch collectible drops that turn media, editions, and releases into distribution, ownership, and treasury growth for decentralized communities.',
  linkLabel = 'View drop',
  showStatusBadge = true,
}) => {
  const highlights = items?.length ? items : dropHighlights

  return (
    <Box>
      <SectionIntro eyebrowText={eyebrowText} title={title} copy={copy} />

      <Box className={droposalList}>
        {highlights.map((proposal) => (
          <Link
            aria-label={`${linkLabel}: ${proposal.title}`}
            className={droposalCard}
            href={proposal.href}
            key={proposal.id}
          >
            <Box>
              <Box className={droposalMeta}>
                <Text className={`${badge} ${daoBadge}`}>{proposal.dao}</Text>
                {showStatusBadge ? (
                  <Text
                    className={statusBadge}
                    style={statusStyleByType[proposal.status]}
                  >
                    {proposal.status}
                  </Text>
                ) : null}
                {getChainLogoSrc(proposal.category) ? (
                  <Box className={daoChainBadge} title={proposal.category}>
                    <Box
                      as="img"
                      alt={`${proposal.category} logo`}
                      className={daoChainBadgeImage}
                      src={getChainLogoSrc(proposal.category) as string}
                    />
                  </Box>
                ) : (
                  <Text className={mutedText}>{proposal.category}</Text>
                )}
              </Box>
              <Text as="h3" className={droposalTitle} mt="x3">
                {proposal.title}
              </Text>
              <Text className={droposalSummary} mt="x2">
                {proposal.summary}
              </Text>
            </Box>

            <Box className={droposalAside}>
              <Text className={droposalTitle}>{proposal.amount}</Text>
              <Text as="span" className={cardLink}>
                {linkLabel}
              </Text>
            </Box>
          </Link>
        ))}
      </Box>
    </Box>
  )
}
