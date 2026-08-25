import { Countdown } from '@buildeross/ui/Countdown'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper } from '@buildeross/ui/LinkWrapper'
import { Button, Flex, Icon, Text } from '@buildeross/zord'
import React from 'react'

import {
  urgencyAlertBadge,
  urgencyAlertCard,
  urgencyAlertCountdown,
  urgencyAlertLevelVariants,
  urgencyAlertSubtitle,
  urgencyAlertTitle,
} from './UrgencyAlerts.css'
import type { UrgencyAlert } from './UrgencyAlerts.helper'

const ALERT_TITLES: Record<UrgencyAlert['type'], string> = {
  AUCTION_ENDING: 'Auction ending soon',
  AUCTION_NO_BIDS: 'Auction has no bids',
  VOTING_ENDING: 'Voting ending soon',
  EXECUTION_EXPIRING: 'Execution window expiring',
  VOTE_NEEDED: "You haven't voted",
  PROPOSAL_EXECUTABLE: 'Ready to execute',
  PROPOSAL_QUEUEABLE: 'Ready to queue',
}

const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// Static "ends in …" microcopy (lowercase to match existing UI), computed once
// from the remaining seconds — no live ticking for the neutral info row.
const formatEndsIn = (seconds: number): string => {
  if (seconds >= DAY) {
    const days = Math.round(seconds / DAY)
    return `ends in ${days} day${days === 1 ? '' : 's'}`
  }
  if (seconds >= HOUR) {
    const hours = Math.round(seconds / HOUR)
    return `ends in ${hours} hour${hours === 1 ? '' : 's'}`
  }
  const minutes = Math.max(1, Math.round(seconds / MINUTE))
  return `ends in ${minutes} minute${minutes === 1 ? '' : 's'}`
}

const isAuctionAlert = (
  alert: UrgencyAlert
): alert is Extract<UrgencyAlert, { type: 'AUCTION_ENDING' | 'AUCTION_NO_BIDS' }> =>
  alert.type === 'AUCTION_ENDING' || alert.type === 'AUCTION_NO_BIDS'

export interface UrgencyAlertItemProps {
  alert: UrgencyAlert
  onDismiss: (id: string) => void
  onEnd?: () => void
}

export const UrgencyAlertItem: React.FC<UrgencyAlertItemProps> = ({
  alert,
  onDismiss,
  onEnd,
}) => {
  const { getAuctionLink, getProposalLink } = useLinks()

  const link = isAuctionAlert(alert)
    ? getAuctionLink(alert.chainId, alert.daoId, alert.tokenId)
    : getProposalLink(alert.chainId, alert.daoId, alert.proposalNumber)

  const subtitle = isAuctionAlert(alert)
    ? `${alert.daoName} · ${alert.tokenName}`
    : `${alert.daoName} · ${alert.proposalTitle}`

  const iconFill =
    alert.level === 'critical'
      ? 'negative'
      : alert.level === 'warning'
        ? 'warning'
        : 'text3'

  return (
    <Flex
      className={[urgencyAlertCard, urgencyAlertLevelVariants[alert.level]]}
      align="center"
      gap="x3"
      w="100%"
      data-urgency-level={alert.level}
    >
      <Icon id="warning-16" size="sm" fill={iconFill} />
      <LinkWrapper link={link} flex={1} minW="x0" direction="column" gap="x1">
        <Flex align="center" gap="x2" wrap>
          <Text className={urgencyAlertTitle}>{ALERT_TITLES[alert.type]}</Text>
          {alert.type === 'VOTING_ENDING' && !alert.hasVoted && (
            <Text className={urgencyAlertBadge}>{"You haven't voted"}</Text>
          )}
        </Flex>
        <Text className={urgencyAlertSubtitle}>{subtitle}</Text>
        {alert.type === 'VOTE_NEEDED' && (
          <Text className={urgencyAlertSubtitle}>{formatEndsIn(alert.voteEndsIn)}</Text>
        )}
      </LinkWrapper>
      {alert.endTime != null && (
        <Countdown
          end={alert.endTime}
          onEnd={onEnd}
          className={urgencyAlertCountdown[alert.level]}
        />
      )}
      <Button
        variant="ghost"
        size="xs"
        p="x0"
        style={{ padding: 0, flexShrink: 0 }}
        onClick={() => onDismiss(alert.id)}
        aria-label="Dismiss alert"
      >
        <Icon id="cross-16" size="sm" />
      </Button>
    </Flex>
  )
}
