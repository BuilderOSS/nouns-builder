import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { AuctionHistoryQuery } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import axios from 'axios'
import React, { useState } from 'react'
import useSWR from 'swr'

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
  const chain = useChainStore((x) => x.chain)
  const {
    addresses: { token },
  } = useDaoStore()

  const [startTime, setStartTime] = useState(StartTimes['30d'])

  const { data, error, isValidating } = useSWR(
    token && chain.id
      ? ([SWR_KEYS.AUCTION_HISTORY, token, chain.id, startTime] as const)
      : null,
    async ([, _token, _chainId, _startTime]) => {
      const startSeconds = startTimeFromNow(_startTime)
      const { data } = await axios.get<{
        auctionHistory: AuctionHistoryQuery
      }>(
        `${BASE_URL}/api/auctionHistory/${_token}?chainId=${_chainId}&startTime=${startSeconds}`
      )

      return data.auctionHistory.dao?.auctions.map((auction) => ({
        id: auction.id,
        endTime: Number(auction.endTime),
        winningBidAmt: auction?.winningBid?.amount || ('1' as string),
      }))
    },
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
