'use client'

import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import {
  distributableBalance,
  distributorFeePercent,
  formatSplitPercent,
  useEnsData,
  useSplitPayout,
} from '@buildeross/hooks'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { walletSnippet } from '@buildeross/utils/helpers'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Flex, Text } from '@buildeross/zord'
import React from 'react'
import { formatEther } from 'viem'

import { ContractButton } from '../ContractButton'
import {
  amount,
  balanceHeader,
  balanceSection,
  label,
  recipientAddress,
  recipientsHeader,
  recipientsList,
  recipientsSection,
  share,
  splitLink,
  splitPayoutWrapper,
} from './SplitPayout.css'

interface SplitPayoutCardProps {
  chainId: CHAIN_ID
  /** The drop's `fundsRecipient`. Renders nothing unless it is a 0xSplits split. */
  fundsRecipient: AddressType | undefined
}

const Recipient: React.FC<{
  account: AddressType
  percent: number
  chainId: CHAIN_ID
}> = ({ account, percent, chainId }) => {
  const { displayName } = useEnsData(account)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        width: '100%',
        marginBottom: '0.5rem',
      }}
    >
      <a
        href={`${ETHERSCAN_BASE_URL[chainId]}/address/${account}`}
        target="_blank"
        rel="noreferrer noopener"
        className={recipientAddress}
      >
        {displayName || walletSnippet(account)}
      </a>
      <span className={share}>{formatSplitPercent(percent)}</span>
    </div>
  )
}

/**
 * Mint revenue routed to a 0xSplits split lands in the split contract and sits
 * there until someone pushes it out — nothing about that was visible on the
 * drop page, so recipients had no way to know they had money waiting, let alone
 * collect it. This shows the split and offers both steps: distribute the pot
 * into recipient balances, then withdraw your own.
 */
export const SplitPayoutCard: React.FC<SplitPayoutCardProps> = ({
  chainId,
  fundsRecipient,
}) => {
  const {
    isSplit,
    recipients,
    distributorFee,
    distributable,
    withdrawable,
    distribute,
    withdraw,
    canDistribute,
    canWithdraw,
    isDistributing,
    isWithdrawing,
    splitsAppUrl,
    isLoading,
  } = useSplitPayout({ chainId, address: fundsRecipient })

  // Don't render anything during loading or if it's not a split
  if (isLoading || !isSplit || !fundsRecipient) return null

  const pending = distributableBalance(distributable ?? 0n)
  const yours = distributableBalance(withdrawable ?? 0n)
  const feePercent = distributorFeePercent(distributorFee)

  return (
    <Box className={splitPayoutWrapper} w="100%">
      <Flex direction="column" width="100%">
        <Text fontSize={20} fontWeight="display" mb="x4">
          Revenue split
        </Text>

        <Flex direction="column" width="100%" gap="x4">
          {pending > 0n && (
            <Box className={balanceSection}>
              <Box className={balanceHeader}>
                <Box>
                  <div className={amount}>
                    {formatCryptoVal(formatEther(pending))} ETH
                  </div>
                  <div className={label}>Collected, not yet distributed</div>
                </Box>
                <a
                  href={`${ETHERSCAN_BASE_URL[chainId]}/address/${fundsRecipient}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={splitLink}
                >
                  {walletSnippet(fundsRecipient)} ↗
                </a>
              </Box>
            </Box>
          )}

          {recipients.length === 0 && (
            <Text variant="paragraph-sm" color="text3">
              The recipient list for this split isn&apos;t readable from here, so it has
              to be distributed{' '}
              <a href={splitsAppUrl} target="_blank" rel="noreferrer noopener">
                on splits.org
              </a>
              . Anything already allocated to you can still be withdrawn below.
            </Text>
          )}

          {recipients.length > 0 && (
            <Box className={recipientsSection}>
              <Text className={recipientsHeader} variant="label-sm">
                Recipients
              </Text>
              <Box className={recipientsList}>
                {recipients.map((r) => (
                  <Recipient
                    key={r.account}
                    account={r.account}
                    percent={r.percent}
                    chainId={chainId}
                  />
                ))}
              </Box>
              {feePercent > 0 && (
                <Text variant="paragraph-sm" color="text3" mt="x2">
                  {formatSplitPercent(feePercent)} goes to whoever pays for the
                  distribution.
                </Text>
              )}
            </Box>
          )}

          <Flex direction="row" width="100%" gap="x4">
            {recipients.length > 0 && (
              <ContractButton
                chainId={chainId}
                handleClick={distribute}
                disabled={!canDistribute}
                loading={isDistributing}
                size="sm"
              >
                {pending > 0n ? 'Distribute' : 'Nothing to distribute'}
              </ContractButton>
            )}

            {yours > 0n && (
              <ContractButton
                chainId={chainId}
                handleClick={withdraw}
                disabled={!canWithdraw}
                loading={isWithdrawing}
                variant="outline"
                size="sm"
              >
                {`Withdraw ${formatCryptoVal(formatEther(yours))} ETH`}
              </ContractButton>
            )}
          </Flex>

          <Text variant="paragraph-sm" color="text3">
            Distributing moves the balance into each recipient&apos;s account, in the
            shares above. Everyone then withdraws their own and anyone can pay for the
            distribution, not just a recipient.
          </Text>
        </Flex>
      </Flex>
    </Box>
  )
}
