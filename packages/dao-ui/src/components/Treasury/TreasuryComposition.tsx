'use client'

import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { useEthUsdPrice } from '@buildeross/hooks'
import { daoClankerTokensRequest } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import type { AddressType } from '@buildeross/types'
import { Box, Flex, Text } from '@buildeross/zord'
import { keepPreviousData } from '@tanstack/react-query'
import React, { useMemo, useState } from 'react'
import useSWR from 'swr'
import { erc20Abi, formatEther } from 'viem'
import { useBalance, useReadContracts } from 'wagmi'

import { tokenLogo } from './tokenLogos'
import {
  barFill,
  barTrack,
  donutCard,
  donutCenter,
  donutCenterLabel,
  donutCenterSub,
  donutCenterValue,
  donutSlice,
  donutSvg,
  donutWrap,
  layout,
  layoutStacked,
  legend,
  legendDot,
  legendItem,
  legendPct,
  row,
  rowBalance,
  rowName,
  rowPct,
  rows,
  rowSub,
  rowUsd,
  rowUsdWrap,
  tokenBadge,
} from './TreasuryComposition.css'
import {
  computeDonutArcs,
  type DonutSlice,
  formatTokenAmount,
  formatUsd,
  sliceColor,
  tokenUsdValue,
} from './treasuryComposition.helper'
import { COMMON_TREASURY_TOKENS, type TreasuryToken } from './treasuryTokens'

type RegistryToken = TreasuryToken & { logo?: string }

const DONUT_SIZE = 240
const DONUT_THICKNESS = 40

interface Asset {
  symbol: string
  address: string
  sub: string
  balanceLabel: string
  usd: number
  color: string
  logo?: string
}

export const TreasuryComposition = () => {
  const { addresses } = useDaoStore()
  const chain = useChainStore((x) => x.chain)
  const treasury = addresses.treasury as AddressType | undefined
  const token = addresses.token as AddressType | undefined

  const { price: ethUsd } = useEthUsdPrice()
  const { data: ethBalance } = useBalance({
    address: treasury as `0x${string}` | undefined,
    chainId: chain.id,
  })

  // Discover the DAO's own clanker token(s) dynamically — no per-DAO config.
  const { data: clankerTokens } = useSWR(
    token && chain.id
      ? ([SWR_KEYS.CLANKER_TOKENS, 'treasury', chain.id, token] as const)
      : null,
    ([, , _chainId, _token]) => daoClankerTokensRequest(_token, _chainId)
  )

  // Global per-chain registry + this DAO's clanker token(s), deduped.
  const tokenList = useMemo<RegistryToken[]>(() => {
    const common = COMMON_TREASURY_TOKENS[chain.id] ?? []
    const seen = new Set(common.map((t) => t.address.toLowerCase()))
    const clankers: RegistryToken[] = (clankerTokens ?? [])
      .filter((c) => c.tokenAddress && !seen.has(c.tokenAddress.toLowerCase()))
      .map((c) => ({
        symbol: c.tokenSymbol || 'TOKEN',
        address: c.tokenAddress.toLowerCase() as `0x${string}`,
        decimals: 18,
        kind: 'other' as const,
        logo: c.tokenImage || undefined,
      }))
    return [...common, ...clankers]
  }, [chain.id, clankerTokens])

  const { data: balances } = useReadContracts({
    allowFailure: true,
    contracts: tokenList.map((t) => ({
      address: t.address,
      abi: erc20Abi,
      functionName: 'balanceOf' as const,
      args: [treasury as `0x${string}`],
      chainId: chain.id,
    })),
    // The app sets a global 5s refetchInterval; at that cadence an occasional
    // failed multicall would drop a token row for a cycle (keepPreviousData only
    // holds data *while* fetching, not when a refetch returns a partial failure)
    // — the rows visibly blink. Treasury balances change rarely, so disable the
    // poll (they still refresh on mount/focus) and keep the last good data.
    query: {
      enabled: !!treasury && tokenList.length > 0,
      placeholderData: keepPreviousData,
      refetchInterval: false,
      staleTime: 30_000,
    },
  })

  const { ethAsset, tokenAssets, totalUsd } = useMemo(() => {
    const price = ethUsd ?? 0
    const ethRaw = ethBalance?.value ?? 0n
    const ethUsdVal = Number(formatEther(ethRaw)) * price
    const eth: Asset = {
      symbol: 'ETH',
      address: 'eth',
      sub: 'Native asset',
      balanceLabel: `${formatTokenAmount(ethRaw, 18)} ETH`,
      usd: ethUsdVal,
      color: sliceColor('ETH', 0),
      logo: tokenLogo('ETH'),
    }

    const assets: Asset[] = tokenList
      .map((t, i) => {
        const entry = balances?.[i]
        const raw =
          entry?.status === 'success' && typeof entry.result === 'bigint'
            ? entry.result
            : 0n
        return { t, raw, i }
      })
      .filter(({ raw }) => raw > 0n)
      .map(({ t, raw, i }) => ({
        symbol: t.symbol,
        address: t.address,
        sub:
          t.kind === 'stable'
            ? 'Stable reserve'
            : t.kind === 'weth'
              ? 'Wrapped'
              : 'ERC-20',
        balanceLabel: `${formatTokenAmount(raw, t.decimals)} ${t.symbol}`,
        usd: tokenUsdValue(raw, t.decimals, t.kind, price),
        color: sliceColor(t.symbol, i + 1),
        logo: tokenLogo(t.symbol) ?? t.logo,
      }))
      .sort((a, b) => b.usd - a.usd)

    const total = eth.usd + assets.reduce((s, a) => s + a.usd, 0)
    return { ethAsset: eth, tokenAssets: assets, totalUsd: total }
  }, [tokenList, balances, ethBalance, ethUsd])

  const allAssets = [ethAsset, ...tokenAssets]

  const slices: DonutSlice[] = allAssets
    .filter((a) => a.usd > 0)
    .map((a) => ({ name: a.symbol, color: a.color, value: a.usd }))

  const hasUsd = totalUsd > 0
  // With only one or two assets the 320px|1fr grid looks lopsided; stack it.
  const stacked = allAssets.length <= 2

  if (!treasury) return null

  return (
    <Flex direction={'column'} width={'100%'} mb={'x8'}>
      <Flex width={'100%'} justify={'space-between'} align={'baseline'} mb={'x4'}>
        <Text fontSize={20} fontWeight={'display'}>
          Composition
        </Text>
        {hasUsd && (
          <Text variant="paragraph-md" color={'tertiary'}>
            {formatUsd(totalUsd)} across {slices.length} asset
            {slices.length !== 1 ? 's' : ''}
          </Text>
        )}
      </Flex>

      <Box className={stacked ? layoutStacked : layout}>
        <Box className={donutCard}>
          {hasUsd ? (
            <Donut slices={slices} totalUsd={totalUsd} />
          ) : (
            <Text variant="paragraph-md" color={'tertiary'} py={'x8'}>
              USD prices unavailable — showing balances only.
            </Text>
          )}
        </Box>

        <Box className={rows}>
          {allAssets.map((a) => (
            <AssetRow
              key={a.address}
              asset={a}
              pct={totalUsd > 0 ? a.usd / totalUsd : 0}
              showUsd={hasUsd}
            />
          ))}
        </Box>
      </Box>
    </Flex>
  )
}

const AssetRow: React.FC<{ asset: Asset; pct: number; showUsd: boolean }> = ({
  asset,
  pct,
  showUsd,
}) => (
  <Box className={row}>
    {asset.logo ? (
      <img
        className={tokenBadge}
        src={asset.logo}
        alt={asset.symbol}
        width={36}
        height={36}
      />
    ) : (
      <span
        className={tokenBadge}
        style={{ background: `${asset.color}22`, color: asset.color }}
      >
        {asset.symbol.slice(0, 4)}
      </span>
    )}
    <div>
      <div className={rowName}>{asset.symbol}</div>
      <div className={rowSub}>{asset.sub}</div>
    </div>
    <div className={rowBalance}>{asset.balanceLabel}</div>
    {showUsd && (
      <div className={rowUsdWrap}>
        <div className={rowUsd}>{formatUsd(asset.usd)}</div>
        <div className={barTrack}>
          <div
            className={barFill}
            style={{ width: `${pct * 100}%`, background: asset.color }}
          />
        </div>
        <div className={rowPct}>{(pct * 100).toFixed(1)}%</div>
      </div>
    )}
  </Box>
)

const Donut: React.FC<{ slices: DonutSlice[]; totalUsd: number }> = ({
  slices,
  totalUsd,
}) => {
  const [hovered, setHovered] = useState<number | null>(null)
  const r = DONUT_SIZE / 2 - DONUT_THICKNESS / 2 - 2
  const C = 2 * Math.PI * r
  const arcs = computeDonutArcs(slices, C)
  const active = hovered !== null ? slices[hovered] : null

  return (
    <>
      <div className={donutWrap}>
        <svg className={donutSvg} viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}>
          <circle
            cx={DONUT_SIZE / 2}
            cy={DONUT_SIZE / 2}
            r={r}
            fill="none"
            stroke="rgba(128,128,128,0.15)"
            strokeWidth={DONUT_THICKNESS}
          />
          {arcs.map((arc, i) => (
            <circle
              key={i}
              className={donutSlice}
              cx={DONUT_SIZE / 2}
              cy={DONUT_SIZE / 2}
              r={r}
              fill="none"
              stroke={slices[i].color}
              strokeWidth={hovered === i ? DONUT_THICKNESS + 5 : DONUT_THICKNESS}
              strokeDasharray={arc.dashArray}
              strokeDashoffset={arc.dashOffset}
              transform={`rotate(-90 ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              aria-label={`${slices[i].name}: ${formatUsd(slices[i].value)}`}
            />
          ))}
        </svg>
        <div className={donutCenter}>
          <div className={donutCenterLabel}>{active ? active.name : 'Total value'}</div>
          <div className={donutCenterValue}>
            {formatUsd(active ? active.value : totalUsd)}
          </div>
          <div className={donutCenterSub}>
            {active
              ? `${((active.value / totalUsd) * 100).toFixed(1)}% of treasury`
              : `across ${slices.length} asset${slices.length !== 1 ? 's' : ''}`}
          </div>
        </div>
      </div>

      <div className={legend}>
        {slices.map((s, i) => (
          <div key={i} className={legendItem}>
            <span className={legendDot} style={{ background: s.color }} />
            <span>{s.name}</span>
            <span className={legendPct}>{((s.value / totalUsd) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </>
  )
}
