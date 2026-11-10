import type { DashboardDaoWithState } from '@buildeross/hooks'
import { describe, expect, it } from 'vitest'

import { withLiveAuctions } from './liveAuction'

const dao = (tokenAddress: string, chainId = 8453) =>
  ({
    chainId,
    tokenAddress,
    currentAuction: {
      endTime: '100',
      highestBid: { amount: '1', bidder: '0xold' },
      token: { tokenId: '1', name: 'Token #1', image: 'old.png' },
    },
  }) as unknown as DashboardDaoWithState

const status = (daoId: string) => ({
  id: `${daoId}:2`,
  daoId,
  auctionAddress: '0xauction',
  tokenId: '2',
  startTime: 100,
  endTime: 200,
  extended: false,
  settled: false,
  bidCount: 1,
  highestBid: { amount: '5', bidder: '0xnew' },
  token: { name: 'Token #2', image: 'new.png' },
})

describe('withLiveAuctions', () => {
  it('returns DAOs unchanged without status data', () => {
    const daos = [dao('0xAA')]
    expect(withLiveAuctions(daos, undefined)).toBe(daos)
  })

  it('overlays the live auction onto matching DAOs', () => {
    const [result] = withLiveAuctions([dao('0xAA')], {
      8453: { syncedBlock: 1, stale: false, auctions: { '0xaa': status('0xaa') } },
    })

    expect(result.currentAuction).toEqual({
      endTime: '200',
      highestBid: { amount: '5', bidder: '0xnew' },
      token: { tokenId: '2', name: 'Token #2', image: 'new.png' },
    })
  })

  it('clears the auction when the DAO has none', () => {
    const [result] = withLiveAuctions([dao('0xaa')], {
      8453: { syncedBlock: 1, stale: false, auctions: { '0xaa': null } },
    })
    expect(result.currentAuction).toBeNull()
  })

  it('keeps cached data for DAOs missing from the response or on other chains', () => {
    const daos = [dao('0xaa'), dao('0xbb', 1)]
    const result = withLiveAuctions(daos, {
      8453: { syncedBlock: 1, stale: false, auctions: {} },
    })
    expect(result[0]).toBe(daos[0])
    expect(result[1]).toBe(daos[1])
  })
})
