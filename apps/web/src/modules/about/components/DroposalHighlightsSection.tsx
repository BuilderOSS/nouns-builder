import { Box, Text } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'

import {
  badge,
  cardLink,
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

const statusStyles: Record<DroposalHighlight['status'], React.CSSProperties> = {
  Active: { background: '#FFF2BF', color: '#6A5300' },
  Succeeded: { background: '#DDF7E7', color: '#0F5B37' },
  Queued: { background: '#DCE6FF', color: '#1D3F84' },
  Defeated: { background: '#F2F4F7', color: '#4F5B6C' },
  Executed: { background: '#ECE7FF', color: '#44348F' },
  Trending: { background: '#FFE1D7', color: '#7D2E0B' },
  Live: { background: '#DDF7E7', color: '#0F5B37' },
  Recent: { background: '#DCE6FF', color: '#1D3F84' },
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
          <Box className={droposalCard} key={proposal.id}>
            <Box>
              <Box className={droposalMeta}>
                <Text
                  className={badge}
                  style={{ background: '#F7F3E8', color: '#4F4738' }}
                >
                  {proposal.dao}
                </Text>
                {showStatusBadge ? (
                  <Text className={statusBadge} style={statusStyles[proposal.status]}>
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
              <Link className={cardLink} href={proposal.href}>
                {linkLabel}
              </Link>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
