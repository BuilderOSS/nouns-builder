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
import { formatEther, isAddressEqual } from 'viem'
import { useAccount } from 'wagmi'

import { ContractButton } from '../ContractButton'
import {
  actions,
  amount,
  balanceHeader,
  balanceSection,
  label,
  metadataRow,
  recipientAddress,
  recipientsHeader,
  recipientsList,
  recipientsSection,
  share,
  splitLink,
  splitPayoutWrapper,
  splitRow,
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
  const explorerUrl = ETHERSCAN_BASE_URL[chainId]

  return (
    <div className={splitRow}>
      {explorerUrl ? (
        <a
          href={`${explorerUrl}/address/${account}`}
          target="_blank"
          rel="noreferrer noopener"
          className={recipientAddress}
        >
          {displayName || walletSnippet(account)}
        </a>
      ) : (
        <span className={recipientAddress}>{displayName || walletSnippet(account)}</span>
      )}
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
  const { address: account } = useAccount()
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
    creationTxHash,
  } = useSplitPayout({ chainId, address: fundsRecipient })

  // Don't render anything during loading or if it's not a split
  if (isLoading || !isSplit || !fundsRecipient) return null

  const pending = distributableBalance(distributable ?? 0n)
  const yours = distributableBalance(withdrawable ?? 0n)
  const feePercent = distributorFeePercent(distributorFee)
  const isRecipient = Boolean(
    account && recipients.some((recipient) => isAddressEqual(recipient.account, account))
  )
  const explorerUrl = ETHERSCAN_BASE_URL[chainId]

  return (
    <Box className={splitPayoutWrapper} w="100%">
      <Flex direction="column" width="100%">
        <Text fontSize={20} fontWeight="display" mb="x2">
          Revenue split contract
        </Text>

        <Flex direction="column" width="100%" gap="x3">
          <Text variant="paragraph-sm" color="text3">
            Mint revenue is shared via 0xSplits.
          </Text>
          <Box className={metadataRow}>
            {explorerUrl && (
              <a
                href={`${explorerUrl}/address/${fundsRecipient}`}
                target="_blank"
                rel="noreferrer noopener"
                className={splitLink}
                aria-label={`View split contract ${fundsRecipient} on explorer`}
                title={fundsRecipient}
              >
                <span className={label}>Contract</span>
                <span>
                  {fundsRecipient.slice(0, 6)}…{fundsRecipient.slice(-4)}{' '}
                  <span aria-hidden="true">↗</span>
                </span>
              </a>
            )}
            {explorerUrl && creationTxHash && (
              <a
                href={`${explorerUrl}/tx/${creationTxHash}`}
                target="_blank"
                rel="noreferrer noopener"
                className={splitLink}
                aria-label={`View creation transaction ${creationTxHash} on explorer`}
                title={creationTxHash}
              >
                <span className={label}>Creation txn</span>
                <span>
                  {creationTxHash.slice(0, 6)}…{creationTxHash.slice(-4)}{' '}
                  <span aria-hidden="true">↗</span>
                </span>
              </a>
            )}
          </Box>
          {pending > 0n && (
            <Box className={balanceSection}>
              <Box className={balanceHeader}>
                <Box>
                  <div className={amount}>
                    {formatCryptoVal(formatEther(pending))} ETH
                  </div>
                  <div className={label}>Collected, not yet distributed</div>
                </Box>
              </Box>
            </Box>
          )}

          {recipients.length === 0 && (
            <Text variant="paragraph-sm" color="text3">
              The recipient list for this split isn&apos;t available here. View this split{' '}
              <a href={splitsAppUrl} target="_blank" rel="noreferrer noopener">
                on splits.org
              </a>
              .
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
              {isRecipient && feePercent > 0 && (
                <Text variant="paragraph-sm" color="text3" mt="x2">
                  {formatSplitPercent(feePercent)} goes to whoever pays for the
                  distribution.
                </Text>
              )}
            </Box>
          )}

          {isRecipient && (
            <>
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
                    variant="outline"
                    size="sm"
                  >
                    {`Withdraw ${formatCryptoVal(formatEther(yours))} ETH`}
                  </ContractButton>
                )}
              </Box>

              <Text variant="paragraph-sm" color="text3">
                Distribute funds to the shares above, then withdraw your balance. Anyone
                can pay for distribution.
              </Text>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}
