'use client'

import { useEnsData } from '@buildeross/hooks/useEnsData'
import { useTokenMetadataSingle } from '@buildeross/hooks/useTokenMetadata'
import type { CHAIN_ID } from '@buildeross/types'
import { ESCROW_TYPE_V1, getWrappedTokenAddress } from '@buildeross/utils/escrow'
import { formatDateTime, walletSnippet } from '@buildeross/utils/helpers'
import { Box, Flex, Text } from '@buildeross/zord'
import React, { useMemo } from 'react'
import { type Address, formatUnits } from 'viem'

import { parseEscrowDeploy } from './escrowDeploy'
import * as styles from './EscrowTransactionCard.css'

// Distinct green shades so adjacent milestone segments read apart without gaps.
const SEGMENT_COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7']

const Party: React.FC<{ label: string; address?: string }> = ({ label, address }) => {
  const { ensName } = useEnsData(address)
  if (!address) return null
  return (
    <Flex justify="space-between" align="center" gap="x2" className={styles.partyRow}>
      <Text className={styles.partyLabel}>{label}</Text>
      <Text className={styles.partyValue}>{ensName || walletSnippet(address)}</Text>
    </Flex>
  )
}

interface EscrowTransactionCardProps {
  chainId: CHAIN_ID
  target: string
  calldata: string
}

/**
 * Rich view for a Smart Invoice escrow `deployEscrow` transaction. The generic
 * decoder renders these bundlers as "Raw only"; this decodes the calldata itself
 * (see `parseEscrowDeploy`) and shows the milestone breakdown, parties, and
 * safety-valve date so proposers can read what they're funding.
 */
export const EscrowTransactionCard: React.FC<EscrowTransactionCardProps> = ({
  chainId,
  target,
  calldata,
}) => {
  const parsed = useMemo(
    () => parseEscrowDeploy(chainId, target, calldata),
    [chainId, target, calldata]
  )

  const tokenAddress = parsed?.escrow.tokenAddress as Address | undefined
  const { tokenMetadata } = useTokenMetadataSingle(chainId, tokenAddress)

  if (!parsed) return null

  // Amounts are in the escrow token's smallest unit, so formatting needs its
  // decimals. Prefer live metadata; fall back to 18 only for the chain's wrapped
  // native (the usual escrow token, reliably 18-decimal). For any other token
  // whose metadata hasn't resolved we don't know the scale, so show a placeholder
  // rather than render, say, a 6-decimal USDC amount 1e12 times too small.
  let wrappedNative: string | undefined
  try {
    wrappedNative = getWrappedTokenAddress(chainId)
  } catch {}
  const isWrappedNative =
    !!tokenAddress && tokenAddress.toLowerCase() === wrappedNative?.toLowerCase()
  const decimals = tokenMetadata?.decimals ?? (isWrappedNative ? 18 : undefined)
  const symbol =
    tokenMetadata?.symbol ??
    (isWrappedNative ? 'ETH' : tokenAddress ? walletSnippet(tokenAddress) : '')
  const fmt = (v: bigint) =>
    decimals == null
      ? '…'
      : `${Number(formatUnits(v, decimals)).toLocaleString(undefined, {
          maximumFractionDigits: 4,
        })} ${symbol}`.trim()

  const { milestoneAmounts, totalAmount, escrow, version, provider } = parsed
  const isLegacy = escrow.escrowType
    ? escrow.escrowType.toLowerCase() === ESCROW_TYPE_V1.toLowerCase()
    : version === 'legacy'

  return (
    <Box className={styles.card}>
      <Flex justify="space-between" align="center" gap="x2" className={styles.header}>
        <Flex align="center" gap="x2" style={{ minWidth: 0 }}>
          <Text className={styles.title}>Smart Invoice Escrow</Text>
          <Box className={styles.badge}>{isLegacy ? 'updatable' : 'updatable-v2'}</Box>
        </Flex>
        <Text className={styles.total}>{fmt(totalAmount)}</Text>
      </Flex>

      <Box className={styles.section}>
        <Text className={styles.sectionLabel}>
          Milestones · {milestoneAmounts.length}
        </Text>
        <Box className={styles.stackedBar}>
          {milestoneAmounts.map((amount, i) => {
            const pct =
              totalAmount > 0n ? Number((amount * 10000n) / totalAmount) / 100 : 0
            return (
              <Box
                key={i}
                className={styles.segment}
                style={{
                  width: `${pct}%`,
                  background: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                }}
              />
            )
          })}
        </Box>
        {milestoneAmounts.map((amount, i) => (
          <Flex
            key={i}
            justify="space-between"
            align="center"
            gap="x2"
            className={styles.milestoneRow}
          >
            <Flex align="center" gap="x2">
              <Box
                className={styles.dot}
                style={{ background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }}
              />
              <Text className={styles.milestoneName}>Milestone {i + 1}</Text>
            </Flex>
            <Text className={styles.milestoneAmount}>{fmt(amount)}</Text>
          </Flex>
        ))}
      </Box>

      <Box className={styles.section}>
        <Party label="Client" address={escrow.clientAddress} />
        <Party label="Provider" address={provider} />
        <Party label="Provider payout" address={escrow.providerRecipientAddress} />
        <Party label="Resolver" address={escrow.resolverAddress} />
        {escrow.terminationTime ? (
          <Flex
            justify="space-between"
            align="center"
            gap="x2"
            className={styles.partyRow}
          >
            <Text className={styles.partyLabel}>Safety valve</Text>
            <Text className={styles.partyValue}>
              {formatDateTime(new Date(Number(escrow.terminationTime) * 1000))}
            </Text>
          </Flex>
        ) : null}
      </Box>
    </Box>
  )
}
