import { renderHook } from '@testing-library/react'

import { useMinBidIncrement } from './useMinBidIncrement'

describe('calculate min bid increment', () => {
  it('should return the default min bid amount given and undefined reserve price or undefined min bid increment', () => {
    const { result } = renderHook(() =>
      useMinBidIncrement({
        highestBid: BigInt('0x00'),
        reservePrice: undefined,
        minBidIncrement: undefined,
      })
    )
    expect(result.current.minBidAmount).toBe(0.0001)
  })

  it('should return the default min bid amount given an undefined reserve price', () => {
    const { result } = renderHook(() =>
      useMinBidIncrement({
        highestBid: BigInt('0x00'),
        reservePrice: undefined,
        minBidIncrement: BigInt('0x0a'),
      })
    )
    expect(result.current.minBidAmount).toBe(0.0001)
  })

  it('should return the default min bid amount given an undefined min bid increment', () => {
    const { result } = renderHook(() =>
      useMinBidIncrement({
        highestBid: BigInt('0x00'),
        reservePrice: BigInt('0xb1a2bc2ec50000'),
        minBidIncrement: undefined,
      })
    )
    expect(result.current.minBidAmount).toBe(0.0001)
  })

  it('should return the default min bid amount given a reserve price of 0 and highest bid of 0', () => {
    const { result } = renderHook(() =>
      useMinBidIncrement({
        highestBid: BigInt('0x00'),
        reservePrice: BigInt('0x00'),
        minBidIncrement: BigInt('0x0a'),
      })
    )
    expect(result.current.minBidAmount).toBe(0.0001)
  })

  it('should return the min bid amount as the reserve price given 0 for highest bid', () => {
    const { result } = renderHook(() =>
      useMinBidIncrement({
        highestBid: BigInt('0x00'),
        reservePrice: BigInt('0xb1a2bc2ec50000'),
        minBidIncrement: BigInt('0x0a'),
      })
    )
    expect(result.current.minBidAmount).toBe(0.05)
  })

  it('should return the min bid amount as the reserve price given an undefined highest bid', () => {
    const { result } = renderHook(() =>
      useMinBidIncrement({
        //@ts-ignore
        highestBid: undefined,
        reservePrice: BigInt('0xb1a2bc2ec50000'),
        minBidIncrement: BigInt('0x0a'),
      })
    )
    expect(result.current.minBidAmount).toBe(0.05)
  })

  it('should return an incremental min bid amount given a current highest bid and min bid increment', () => {
    const { result } = renderHook(() =>
      useMinBidIncrement({
        highestBid: BigInt('0xb1a2bc2ec50000'),
        reservePrice: BigInt('0xb1a2bc2ec50000'),
        minBidIncrement: BigInt('0x0a'),
      })
    )
    expect(result.current.minBidAmount).toBe(0.055)
  })

  it('should return an incremental min bid amount given a current highest bid with a 0 reserve price', () => {
    const { result } = renderHook(() =>
      useMinBidIncrement({
        highestBid: BigInt('0xb1a2bc2ec50000'),
        reservePrice: BigInt('0x00'),
        minBidIncrement: BigInt('0x0a'),
      })
    )
    expect(result.current.minBidAmount).toBe(0.055)
  })
})
