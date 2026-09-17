'use client'

import { ETHERSCAN_BASE_URL } from '@buildeross/constants'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { formatTimeAgo } from '@buildeross/utils/formatTime'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Flex, Text } from '@buildeross/zord'
import { useMemo } from 'react'
import useSWR from 'swr'

import { deriveRecentTransactions } from './recentTransactions.helper'
import { fetchTreasuryFeed } from './treasuryFeed.query'
import * as styles from './TreasuryRecentTransactions.css'

const FEED_LIMIT = 12

/**
 * Treasury "Recent transactions" feed: executed proposals (ETH out, amount =
 * sum of their tx values) and settled auctions (ETH in, the winning bid),
 * merged newest-first from the Builder subgraph. Derivation lives in
 * `recentTransactions.helper` (pure + unit-tested).
 */
export const TreasuryRecentTransactions = () => {
  const chain = useChainStore((x) => x.chain)
  const { addresses } = useDaoStore()
  const token = addresses.token
  const treasury = addresses.treasury

  // Query the subgraph directly — the getProposals helper resolves each
  // proposal's on-chain state (an RPC call per proposal) and returns an empty
  // list if any of those fail; we only need the subgraph fields here.
  const { data } = useSWR(
    token && chain.id ? (['treasury-recent-feed', chain.id, token] as const) : null,
    ([, chainId, t]) => fetchTreasuryFeed(chainId, t, FEED_LIMIT),
    { revalidateOnFocus: false }
  )

  const txs = useMemo(
    () =>
      deriveRecentTransactions(data?.proposals ?? [], data?.auctions ?? [], FEED_LIMIT),
    [data]
  )

  const explorerUrl = ETHERSCAN_BASE_URL[chain.id]

  return (
    <Flex direction={'column'} width={'100%'} mb={'x8'}>
      <Text fontSize={20} fontWeight={'display'} mb={'x4'}>
        Recent transactions
      </Text>

      <Box className={styles.card}>
        <Flex
          className={styles.header}
          justify={'space-between'}
          align={'baseline'}
          gap={'x2'}
        >
          <Text className={styles.title}>Treasury activity</Text>
          <Text className={styles.sub}>From proposals &amp; auctions</Text>
        </Flex>

        {txs.length === 0 ? (
          <Box className={styles.empty}>No recent treasury activity.</Box>
        ) : (
          txs.map((tx, i) => {
            // No explorer for the local foundry chain — those rows stay unlinked.
            const txUrl =
              tx.txHash && explorerUrl ? `${explorerUrl}/tx/${tx.txHash}` : undefined
            return (
              <Box
                key={`${tx.tag}-${i}`}
                as={txUrl ? 'a' : 'div'}
                className={[
                  styles.row,
                  txUrl ? styles.rowLink : '',
                  i === txs.length - 1 ? styles.rowLast : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                {...(txUrl
                  ? {
                      href: txUrl,
                      target: '_blank',
                      rel: 'noreferrer noopener',
                      title: 'View transaction on explorer',
                    }
                  : {})}
              >
                <Box
                  className={`${styles.badge} ${tx.dir === 'in' ? styles.badgeIn : styles.badgeOut}`}
                >
                  {tx.dir === 'in' ? '↓' : '↑'}
                </Box>
                <Box style={{ minWidth: 0 }}>
                  <div className={styles.txTitle}>{tx.title}</div>
                  <div className={styles.txTag}>{tx.tag}</div>
                </Box>
                <Text className={tx.dir === 'in' ? styles.amountIn : styles.amountOut}>
                  {tx.dir === 'in' ? '+' : '−'}
                  {formatCryptoVal(tx.amountEth)} ETH
                </Text>
                <Text className={styles.time}>{formatTimeAgo(tx.timestamp)}</Text>
              </Box>
            )
          })
        )}

        {treasury && explorerUrl && (
          <a
            className={styles.viewAll}
            href={`${explorerUrl}/address/${treasury}`}
            target={'_blank'}
            rel={'noreferrer noopener'}
          >
            View all on explorer →
          </a>
        )}
      </Box>
    </Flex>
  )
}
