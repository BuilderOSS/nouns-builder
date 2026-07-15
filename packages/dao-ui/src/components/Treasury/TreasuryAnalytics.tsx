import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { AuctionHistoryQuery } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Button, Flex, Grid, Text } from '@buildeross/zord'
import axios from 'axios'
import React, { useMemo, useState } from 'react'
import useSWR from 'swr'

import { statisticContent } from '../../styles/About.css'
import {
  chartAxisLabel,
  chartBaseline,
  chartBox,
  chartGradientBottom,
  chartGradientTop,
  chartGrid,
  chartLine,
  chartSkeleton,
  chartSvg,
  metricsGrid,
  windowTab,
} from './TreasuryAnalytics.css'
import {
  type AuctionDatum,
  buildChartPaths,
  buildYTicks,
  computeCumulativeRevenue,
  computeTreasuryMetrics,
} from './treasuryAnalytics.helper'

enum RevenueWindow {
  '30d' = '30',
  '60d' = '60',
  '90d' = '90',
  'All' = '0',
}

const WINDOW_LABELS: Record<RevenueWindow, string> = {
  [RevenueWindow['30d']]: '30d',
  [RevenueWindow['60d']]: '60d',
  [RevenueWindow['90d']]: '90d',
  [RevenueWindow['All']]: 'All',
}

const VIEW_W = 800
const VIEW_H = 340
const MARGIN = { top: 16, right: 20, bottom: 32, left: 56 }
const PLOT_W = VIEW_W - MARGIN.left - MARGIN.right
const PLOT_H = VIEW_H - MARGIN.top - MARGIN.bottom

const GRADIENT_ID = 'treasuryRevGradient'

const formatAxisDate = (unixSeconds: number): string =>
  new Date(unixSeconds * 1000).toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  })

const startTimeFromNow = (window: RevenueWindow): number => {
  if (window === RevenueWindow['All']) return 0
  const nowInSeconds = Math.floor(Date.now() / 1000)
  return nowInSeconds - parseInt(window) * 24 * 60 * 60
}

const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Flex direction={'column'} p={'x3'} mx={'x1'} width={'100%'} align={'start'}>
    <Text className={statisticContent} fontWeight={'display'}>
      {value}
    </Text>
    <Text variant="paragraph-md" color={'tertiary'} mt={'x1'}>
      {label}
    </Text>
  </Flex>
)

export const TreasuryAnalytics = () => {
  const chain = useChainStore((x) => x.chain)
  const {
    addresses: { token },
  } = useDaoStore()

  const [window, setWindow] = useState(RevenueWindow['All'])

  const { data, isValidating } = useSWR(
    token && chain.id
      ? ([
          SWR_KEYS.AUCTION_HISTORY,
          'treasury-analytics',
          token,
          chain.id,
          window,
        ] as const)
      : null,
    async ([, , _token, _chainId, _window]) => {
      // The endpoint returns at most PAGE auctions, ordered oldest-first
      // (endTime ASC). For high-volume DAOs (1000+ auctions) a single call
      // undercounts revenue, so page through using each batch's last endTime
      // as the next cursor (the query filters endTime_gt startTime).
      const PAGE = 1000
      const MAX_PAGES = 25
      const byId = new Map<string, AuctionDatum>()
      let cursor = startTimeFromNow(_window)

      for (let page = 0; page < MAX_PAGES; page++) {
        const { data } = await axios.get<{ auctionHistory: AuctionHistoryQuery }>(
          `${BASE_URL}/api/auctionHistory/${_token}?chainId=${_chainId}&startTime=${cursor}`
        )
        const batch = data.auctionHistory.dao?.auctions ?? []
        if (batch.length === 0) break

        for (const auction of batch) {
          byId.set(auction.id, {
            id: auction.id,
            endTime: Number(auction.endTime),
            winningBidAmt: auction?.winningBid?.amount ?? '0',
          })
        }

        if (batch.length < PAGE) break
        const lastEndTime = Number(batch[batch.length - 1].endTime)
        if (lastEndTime === cursor) break // no forward progress — stop
        cursor = lastEndTime
      }

      return Array.from(byId.values())
    },
    { revalidateOnFocus: false }
  )

  const { metrics, paths, yTicks, startLabel, endLabel, hasChart } = useMemo(() => {
    const auctions = data ?? []
    const series = computeCumulativeRevenue(auctions)
    const maxY = series.length ? series[series.length - 1].cumulative : 0
    return {
      metrics: computeTreasuryMetrics(auctions),
      paths: buildChartPaths(series, PLOT_W, PLOT_H),
      yTicks: buildYTicks(maxY, 4),
      startLabel: series.length ? formatAxisDate(series[0].endTime) : '',
      endLabel: series.length ? formatAxisDate(series[series.length - 1].endTime) : '',
      hasChart: series.length >= 2,
    }
  }, [data])

  return (
    <Flex direction={'column'} width={'100%'} mb={'x8'}>
      <Flex width={'100%'} justify={'space-between'} align={'center'} mb={'x4'}>
        <Text fontSize={20} fontWeight={'display'}>
          Auction Revenue
        </Text>
        <Flex gap={'x2'}>
          {Object.values(RevenueWindow).map((w) => (
            <Button
              key={w}
              variant={'ghost'}
              size={'sm'}
              px={'x2'}
              className={w === window ? windowTab.selected : windowTab.unselected}
              onClick={() => setWindow(w)}
            >
              {WINDOW_LABELS[w]}
            </Button>
          ))}
        </Flex>
      </Flex>

      <Box
        borderColor={'border'}
        borderStyle={'solid'}
        borderRadius={'curved'}
        borderWidth={'normal'}
        p={'x4'}
      >
        {isValidating && !data ? (
          <Box className={chartSkeleton} />
        ) : hasChart ? (
          <svg
            className={chartSvg}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            role="img"
            aria-label="Cumulative auction revenue over time"
          >
            <defs>
              <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" className={chartGradientTop} />
                <stop offset="100%" className={chartGradientBottom} />
              </linearGradient>
            </defs>
            <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
              {yTicks.map((tick) => {
                const y = PLOT_H * (1 - tick.fraction)
                return (
                  <g key={tick.fraction}>
                    <line
                      className={tick.fraction === 0 ? chartBaseline : chartGrid}
                      x1={0}
                      y1={y}
                      x2={PLOT_W}
                      y2={y}
                    />
                    <text
                      className={chartAxisLabel}
                      x={-10}
                      y={y}
                      textAnchor="end"
                      dominantBaseline="middle"
                    >
                      {formatCryptoVal(tick.value)}
                    </text>
                  </g>
                )
              })}
              <path d={paths.areaPath} fill={`url(#${GRADIENT_ID})`} />
              <path className={chartLine} d={paths.linePath} />
              <text className={chartAxisLabel} x={0} y={PLOT_H + 22} textAnchor="start">
                {startLabel}
              </text>
              <text
                className={chartAxisLabel}
                x={PLOT_W}
                y={PLOT_H + 22}
                textAnchor="end"
              >
                {endLabel}
              </text>
            </g>
          </svg>
        ) : (
          <Flex className={chartBox} align={'center'} justify={'center'}>
            <Text variant="paragraph-md" color={'tertiary'}>
              Not enough settled auctions in this window to chart revenue.
            </Text>
          </Flex>
        )}
      </Box>

      <Grid className={metricsGrid} display={'grid'} mt={'x4'}>
        <Metric label="Revenue" value={`${formatCryptoVal(metrics.totalRevenue)} ETH`} />
        <Metric label="Auctions" value={`${metrics.auctionsSettled}`} />
        <Metric
          label="Avg. Winning Bid"
          value={`${formatCryptoVal(metrics.averageWinningBid)} ETH`}
        />
        <Metric
          label="Highest Sale"
          value={`${formatCryptoVal(metrics.highestSale)} ETH`}
        />
      </Grid>
    </Flex>
  )
}
