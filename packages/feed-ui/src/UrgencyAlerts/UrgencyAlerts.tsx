import { useDashboardData } from '@buildeross/hooks/useDashboardData'
import { useInterval } from '@buildeross/hooks/useInterval'
import { useIsMounted } from '@buildeross/hooks/useIsMounted'
import { Flex, Stack } from '@buildeross/zord'
import React, { useCallback, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'

import { UrgencyAlertItem } from './UrgencyAlertItem'
import {
  DEFAULT_URGENCY_THRESHOLDS,
  deriveUrgencyAlerts,
  type UrgencyThresholds,
} from './UrgencyAlerts.helper'
import { useDismissedUrgencyAlerts } from './useDismissedUrgencyAlerts'

const REFRESH_INTERVAL_MS = 30_000

export interface UrgencyAlertsProps {
  thresholds?: UrgencyThresholds
}

export const UrgencyAlerts: React.FC<UrgencyAlertsProps> = ({
  thresholds = DEFAULT_URGENCY_THRESHOLDS,
}) => {
  const isMounted = useIsMounted()
  const { address } = useAccount()
  const { daos } = useDashboardData({ address, enabled: !!address })
  const { dismissedIds, dismissAlert } = useDismissedUrgencyAlerts(address)
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))

  useInterval(() => setNow(Math.floor(Date.now() / 1000)), REFRESH_INTERVAL_MS)

  const handleExpire = useCallback(() => setNow(Math.floor(Date.now() / 1000)), [])

  const alerts = useMemo(() => {
    if (!address || daos.length === 0) return []
    return deriveUrgencyAlerts(daos, now, address, thresholds).filter(
      (alert) => !dismissedIds.includes(alert.id)
    )
  }, [address, daos, now, thresholds, dismissedIds])

  if (!isMounted || alerts.length === 0) return null

  return (
    <Flex w="100%" justify="center" data-testid="urgency-alerts">
      <Stack gap="x2" w="100%" pb="x4" style={{ maxWidth: '1440px' }}>
        {alerts.map((alert) => (
          <UrgencyAlertItem
            key={alert.id}
            alert={alert}
            onDismiss={dismissAlert}
            onEnd={handleExpire}
          />
        ))}
      </Stack>
    </Flex>
  )
}
