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
  VOTING_ENDING: 'Voting ending soon',
  EXECUTION_EXPIRING: 'Execution window expiring',
}

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

  const link =
    alert.type === 'AUCTION_ENDING'
      ? getAuctionLink(alert.chainId, alert.daoId, alert.tokenId)
      : getProposalLink(alert.chainId, alert.daoId, alert.proposalNumber)

  const subtitle =
    alert.type === 'AUCTION_ENDING'
      ? `${alert.daoName} · ${alert.tokenName}`
      : `${alert.daoName} · ${alert.proposalTitle}`

  return (
    <Flex
      className={[urgencyAlertCard, urgencyAlertLevelVariants[alert.level]]}
      align="center"
      gap="x3"
      w="100%"
      data-urgency-level={alert.level}
    >
      <Icon
        id="warning-16"
        size="sm"
        fill={alert.level === 'critical' ? 'negative' : 'warning'}
      />
      <LinkWrapper link={link} flex={1} minW="x0" direction="column" gap="x1">
        <Flex align="center" gap="x2" wrap>
          <Text className={urgencyAlertTitle}>{ALERT_TITLES[alert.type]}</Text>
          {alert.type === 'VOTING_ENDING' && !alert.hasVoted && (
            <Text className={urgencyAlertBadge}>{"You haven't voted"}</Text>
          )}
        </Flex>
        <Text className={urgencyAlertSubtitle}>{subtitle}</Text>
      </LinkWrapper>
      <Countdown
        end={alert.endTime}
        onEnd={onEnd}
        className={urgencyAlertCountdown[alert.level]}
      />
      <Button
        variant="ghost"
        size="xs"
        onClick={() => onDismiss(alert.id)}
        aria-label="Dismiss alert"
      >
        <Icon id="cross-16" size="sm" />
      </Button>
    </Flex>
  )
}
