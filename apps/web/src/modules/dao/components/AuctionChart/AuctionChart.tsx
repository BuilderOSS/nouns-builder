import axios from 'axios'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import useSWR from 'swr'

import { AuctionHistoryQuery } from 'src/data/subgraph/sdk.generated'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'

import { AuctionGraph } from './AuctionGraph'
import { AuctionGraphLayout, DisplayPanel, SkeletonPanel } from './Layouts'

export enum StartTimes {
  '30d' = '30',
  '60d' = '60',
  '90d' = '90',
  'All' = '0',
}

export type AuctionHistory = {
  id: string
  endTime: number
  winningBidAmt: string
}

const startTimeFromNow = (startTime: StartTimes) => {
  if (startTime === '0') return 0

  const nowInSeconds = Math.floor(Date.now() / 1000)

  return nowInSeconds - parseInt(startTime) * 24 * 60 * 60
}

export const AuctionChart = () => {
  const { isReady } = useRouter()
  const chain = useChainStore((x) => x.chain)
  const {
    addresses: { token },
  } = useDaoStore()

  const [startTime, setStartTime] = useState(StartTimes['30d'])

  const startSeconds = startTimeFromNow(startTime)

  const { data, error, isValidating } = useSWR(
    isReady ? [token, chain.id, startSeconds] : null,
    () =>
      axios
        .get<{
          auctionHistory: AuctionHistoryQuery
        }>(`/api/auctionHistory/${token}?chainId=${chain.id}&startTime=${startSeconds}`)
        .then((x) =>
          x.data.auctionHistory.dao?.auctions.map((auction) => ({
            id: auction.id,
            endTime: Number(auction.endTime),
            winningBidAmt: auction?.winningBid?.amount || ('1' as string),
          }))
        ),
    { revalidateOnFocus: false }
  )

  if (isValidating) {
    return (
      <AuctionGraphLayout
        startTime={startTime}
        setStartTime={setStartTime}
        chart={<SkeletonPanel />}
      />
    )
  }

  if (error) {
    return (
      <AuctionGraphLayout
        startTime={startTime}
        setStartTime={setStartTime}
        chart={
          <DisplayPanel
            title="Error"
            description={error?.message || 'Error fetching graph data from subgraph'}
          />
        }
      />
    )
  }

  if (!data || !data.length || data.length < 2) {
    return (
      <AuctionGraphLayout
        startTime={startTime}
        setStartTime={setStartTime}
        chart={
          <DisplayPanel
            title="Insufficient Data"
            description="Not enough data within the given time-frame to populate a graph"
          />
        }
      />
    )
  }

  return (
    <AuctionGraphLayout
      startTime={startTime}
      setStartTime={setStartTime}
      chartData={data}
      chart={
        <AuctionGraph
          chartData={data}
          startTime={startTime}
          setStartTime={setStartTime}
        />
      }
    />
  )
}
