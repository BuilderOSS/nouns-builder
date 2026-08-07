'use client'

import { Auction_OrderBy, OrderDirection, SubgraphSDK } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { formatTimeAgo } from '@buildeross/utils/formatTime'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Flex, Text } from '@buildeross/zord'
import { useMemo } from 'react'
import useSWR from 'swr'

import { deriveRecentTransactions } from './recentTransactions.helper'
import * as styles from './TreasuryRecentTransactions.css'

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
  const { data: proposals } = useSWR(
    token && chain.id ? (['treasury-recent-proposals', chain.id, token] as const) : null,
    ([, chainId, t]) =>
      SubgraphSDK.connect(chainId)
        .proposals({ where: { dao: t.toLowerCase() }, first: 100 })
        .then((d) => d.proposals),
    { revalidateOnFocus: false }
  )

  const { data: auctions } = useSWR(
    token && chain.id ? (['treasury-recent-auctions', chain.id, token] as const) : null,
    ([, chainId, t]) =>
      SubgraphSDK.connect(chainId)
        .auctionHistory({
          daoId: t.toLowerCase(),
          startTime: 0,
          orderBy: Auction_OrderBy.EndTime,
          orderDirection: OrderDirection.Desc,
          first: 20,
        })
        .then((d) => d.dao?.auctions ?? []),
    { revalidateOnFocus: false }
  )

  const txs = useMemo(
    () => deriveRecentTransactions(proposals ?? [], auctions ?? [], 12),
    [proposals, auctions]
  )

  const explorerUrl =
    chain.blockExplorers?.default?.url?.replace(/\/$/, '') ?? 'https://basescan.org'

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
          <Text className={styles.sub}>From proposals &amp; auctions · last 30d</Text>
        </Flex>

        {txs.length === 0 ? (
          <Box className={styles.empty}>No recent treasury activity.</Box>
        ) : (
          txs.map((tx, i) => (
            <Box key={`${tx.tag}-${i}`} className={styles.row}>
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
          ))
        )}

        {treasury && (
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
