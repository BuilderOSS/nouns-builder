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
import { actions, amount, card, label, row, rowLast, share } from './SplitPayout.css'

interface SplitPayoutCardProps {
  chainId: CHAIN_ID
  /** The drop's `fundsRecipient`. Renders nothing unless it is a 0xSplits split. */
  fundsRecipient: AddressType | undefined
}

const Recipient: React.FC<{
  account: AddressType
  percent: number
  chainId: CHAIN_ID
  isLast: boolean
}> = ({ account, percent, chainId, isLast }) => {
  const { displayName } = useEnsData(account)

  return (
    <Box className={`${row} ${isLast ? rowLast : ''}`}>
      <a
        href={`${ETHERSCAN_BASE_URL[chainId]}/address/${account}`}
        target="_blank"
        rel="noreferrer noopener"
        style={{ textDecoration: 'none' }}
      >
        <Text variant="paragraph-sm" color="text1">
          {displayName || walletSnippet(account)}
        </Text>
      </a>
      <span className={share}>{formatSplitPercent(percent)}</span>
    </Box>
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
  } = useSplitPayout({ chainId, address: fundsRecipient })

  if (!isSplit || !fundsRecipient) return null

  const pending = distributableBalance(distributable ?? 0n)
  const yours = distributableBalance(withdrawable ?? 0n)
  const feePercent = distributorFeePercent(distributorFee)

  return (
    <Flex direction="column" width="100%" mb="x8">
      <Text fontSize={20} fontWeight="display" mb="x4">
        Revenue split
      </Text>

      <Box className={card}>
        <Flex justify="space-between" align="baseline" mb="x2">
          <Box>
            <div className={amount}>{formatCryptoVal(formatEther(pending))} ETH</div>
            <div className={label}>Collected, not yet distributed</div>
          </Box>
          <a
            href={`${ETHERSCAN_BASE_URL[chainId]}/address/${fundsRecipient}`}
            target="_blank"
            rel="noreferrer noopener"
            className={label}
            style={{ textDecoration: 'none' }}
          >
            {walletSnippet(fundsRecipient)} ↗
          </a>
        </Flex>

        {recipients.length === 0 && (
          <Text variant="paragraph-sm" color="text3" mt="x2">
            The recipient list for this split isn&apos;t readable from here, so it has to
            be distributed{' '}
            <a href={splitsAppUrl} target="_blank" rel="noreferrer noopener">
              on splits.org
            </a>
            . Anything already allocated to you can still be withdrawn below.
          </Text>
        )}

        {recipients.length > 0 && (
          <Box mt="x2">
            {recipients.map((r, i) => (
              <Recipient
                key={r.account}
                account={r.account}
                percent={r.percent}
                chainId={chainId}
                isLast={i === recipients.length - 1}
              />
            ))}
          </Box>
        )}

        {feePercent > 0 && (
          <Text variant="paragraph-sm" color="text3" mt="x2">
            {formatSplitPercent(feePercent)} goes to whoever pays for the distribution.
          </Text>
        )}

        <Box className={actions}>
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
              variant="secondary"
              size="sm"
            >
              {`Withdraw ${formatCryptoVal(formatEther(yours))} ETH`}
            </ContractButton>
          )}
        </Box>

        <Text variant="paragraph-sm" color="text3" mt="x3">
          Distributing moves the balance into each recipient&apos;s account, in the shares
          above. Everyone then withdraws their own — anyone can pay for the distribution,
          not just a recipient.
        </Text>
      </Box>
    </Flex>
  )
}
