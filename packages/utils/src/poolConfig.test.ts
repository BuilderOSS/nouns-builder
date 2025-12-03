// poolConfig.test.ts

import { zeroAddress } from 'viem'
import { assert, describe, it } from 'vitest'

import {
  convertTickQuote,
  convertTicksQuoteArray,
  createContentPoolConfigFromMinFdv,
  createCreatorPoolConfigFromMinFdv,
} from './poolConfig'

const ZORA_ADDRESS = '0x1111111111166b7fe7bd91427724b487980afc69'
const ZORA_USD = 0.044
const ETH_USD = 2_750
const DEFAULT_TICK_SPACING = 60

// ---------- CONTENT POOL TESTS (4 bands) ----------

describe('createContentPoolConfigFromMinFdv', () => {
  const zoraContentConfig = createContentPoolConfigFromMinFdv({
    currency: ZORA_ADDRESS, // ZORA
    quoteTokenUsd: ZORA_USD,
    minFdvUsd: 1_000_000, // start discovery at $1m FDV
  })

  it('should create a content pool config with correct lengths', () => {
    assert.equal(zoraContentConfig.currency, ZORA_ADDRESS)
    assert.equal(zoraContentConfig.lowerTicks.length, 4)
    assert.equal(zoraContentConfig.upperTicks.length, 4)
    assert.equal(zoraContentConfig.numDiscoveryPositions.length, 4)
    assert.equal(zoraContentConfig.maxDiscoverySupplyShares.length, 4)
  })

  it('should have strictly increasing lowerTicks (higher FDV → higher price → higher tick)', () => {
    const { lowerTicks } = zoraContentConfig
    for (let i = 1; i < lowerTicks.length; i++) {
      assert.ok(
        lowerTicks[i] > lowerTicks[i - 1],
        `expected lowerTicks[${i}] > lowerTicks[${i - 1}], got ${lowerTicks[i]} <= ${lowerTicks[i - 1]}`
      )
    }
  })

  it('should set all upper ticks equal except the first one', () => {
    const { upperTicks } = zoraContentConfig
    assert.ok(upperTicks.length === 4)
    const first = upperTicks[0]
    const shared = upperTicks[upperTicks.length - 1]

    // First band upper tick can differ
    assert.notEqual(first, shared)

    // All others must match the last one
    for (let i = 1; i < upperTicks.length; i++) {
      assert.equal(
        upperTicks[i],
        shared,
        `expected upperTicks[${i}] to equal shared upper tick ${shared}`
      )
    }
  })

  it('should shift ticks upward when minFdvUsd increases', () => {
    const configLow = createContentPoolConfigFromMinFdv({
      currency: ZORA_ADDRESS,
      quoteTokenUsd: ZORA_USD,
      minFdvUsd: 500_000, // lower FDV
    })
    const configHigh = createContentPoolConfigFromMinFdv({
      currency: ZORA_ADDRESS,
      quoteTokenUsd: ZORA_USD,
      minFdvUsd: 5_000_000, // higher FDV
    })

    configLow.lowerTicks.forEach((tick, i) => {
      assert.ok(
        configHigh.lowerTicks[i] > tick,
        `expected higher FDV band lowerTicks[${i}] > lower FDV lowerTicks[${i}]`
      )
    })
    configLow.upperTicks.forEach((tick, i) => {
      assert.ok(
        configHigh.upperTicks[i] > tick,
        `expected higher FDV band upperTicks[${i}] > lower FDV upperTicks[${i}]`
      )
    })
  })
})

// ---------- CREATOR POOL TESTS (3 bands) ----------

describe('createCreatorPoolConfigFromMinFdv', () => {
  const ethCreatorConfig = createCreatorPoolConfigFromMinFdv({
    currency: zeroAddress, // ETH
    quoteTokenUsd: ETH_USD,
    minFdvUsd: 1_000_000, // start discovery at $1m FDV
  })

  it('should create a creator pool config with correct lengths', () => {
    assert.equal(ethCreatorConfig.currency, zeroAddress)
    assert.equal(ethCreatorConfig.lowerTicks.length, 3)
    assert.equal(ethCreatorConfig.upperTicks.length, 3)
    assert.equal(ethCreatorConfig.numDiscoveryPositions.length, 3)
    assert.equal(ethCreatorConfig.maxDiscoverySupplyShares.length, 3)
  })

  it('should have strictly increasing lowerTicks', () => {
    const { lowerTicks } = ethCreatorConfig
    for (let i = 1; i < lowerTicks.length; i++) {
      assert.ok(
        lowerTicks[i] > lowerTicks[i - 1],
        `expected lowerTicks[${i}] > lowerTicks[${i - 1}], got ${lowerTicks[i]} <= ${lowerTicks[i - 1]}`
      )
    }
  })

  it('should set all upper ticks equal except the first one', () => {
    const { upperTicks } = ethCreatorConfig
    assert.ok(upperTicks.length === 3)
    const first = upperTicks[0]
    const shared = upperTicks[upperTicks.length - 1]

    assert.notEqual(first, shared)
    for (let i = 1; i < upperTicks.length; i++) {
      assert.equal(
        upperTicks[i],
        shared,
        `expected upperTicks[${i}] to equal shared upper tick ${shared}`
      )
    }
  })
})

// ---------- TICK CONVERSION TESTS ----------

describe('convertTickQuote', () => {
  it('should move ticks lower (more negative) when converting from cheap quote (ZORA) to expensive quote (ETH)', () => {
    const tickZora = -37_700
    const tickEth = convertTickQuote({
      tick: tickZora,
      fromQuoteUsd: ZORA_USD,
      toQuoteUsd: ETH_USD,
      tickSpacing: DEFAULT_TICK_SPACING,
    })

    // ETH is much more expensive than ZORA, so the same underlying price
    // should correspond to a smaller (more negative) tick in ETH terms.
    assert.ok(
      tickEth < tickZora,
      `expected tickEth < tickZora, got ${tickEth} >= ${tickZora}`
    )
  })

  it('should approximately round-trip between two quote tokens (ZORA ↔ ETH)', () => {
    const originalTick = -25_700

    const tickEth = convertTickQuote({
      tick: originalTick,
      fromQuoteUsd: ZORA_USD,
      toQuoteUsd: ETH_USD,
      tickSpacing: DEFAULT_TICK_SPACING,
    })

    const roundTrippedTick = convertTickQuote({
      tick: tickEth,
      fromQuoteUsd: ETH_USD,
      toQuoteUsd: ZORA_USD,
      tickSpacing: DEFAULT_TICK_SPACING,
    })

    // Because of tick spacing snapping, allow a small tolerance of one spacing step.
    const diff = Math.abs(roundTrippedTick - originalTick)
    assert.ok(
      diff <= DEFAULT_TICK_SPACING,
      `expected round-trip diff <= ${DEFAULT_TICK_SPACING}, got ${diff}`
    )
  })

  it('should throw on non-positive quote prices', () => {
    assert.throws(() =>
      convertTickQuote({
        tick: -10_000,
        fromQuoteUsd: 0,
        toQuoteUsd: 1,
      })
    )

    assert.throws(() =>
      convertTickQuote({
        tick: -10_000,
        fromQuoteUsd: 1,
        toQuoteUsd: -5,
      })
    )
  })
})

describe('convertTicksQuoteArray', () => {
  it('should map each tick through convertTickQuote', () => {
    const ticks = [-37_700, -25_700, -19_700]

    const convertedArray = convertTicksQuoteArray({
      ticks,
      fromQuoteUsd: ZORA_USD,
      toQuoteUsd: ETH_USD,
      tickSpacing: DEFAULT_TICK_SPACING,
    })

    assert.equal(convertedArray.length, ticks.length)

    convertedArray.forEach((tConverted, i) => {
      const tSingle = convertTickQuote({
        tick: ticks[i],
        fromQuoteUsd: ZORA_USD,
        toQuoteUsd: ETH_USD,
        tickSpacing: DEFAULT_TICK_SPACING,
      })

      assert.equal(
        tConverted,
        tSingle,
        `expected array-converted tick[${i}] to equal single converted tick`
      )
    })
  })
})

// ---------- BASIC SHAPE / SANITY TESTS ACROSS POOL TYPES ----------

describe('pool config shape invariants', () => {
  it('content and creator configs should use the same tick spacing shape logic', () => {
    const content = createContentPoolConfigFromMinFdv({
      currency: ZORA_ADDRESS,
      quoteTokenUsd: ZORA_USD,
      minFdvUsd: 1_000_000,
    })

    const creator = createCreatorPoolConfigFromMinFdv({
      currency: ZORA_ADDRESS,
      quoteTokenUsd: ZORA_USD,
      minFdvUsd: 1_000_000,
    })

    // Just sanity: top upper tick in content should be >= top upper tick in creator,
    // since content bands go further out in FDV multipliers (1–2–4–8–16 vs 1–3–6–10).
    const maxContentUpper = Math.max(...content.upperTicks)
    const maxCreatorUpper = Math.max(...creator.upperTicks)

    assert.ok(
      maxContentUpper >= maxCreatorUpper,
      `expected content max upper tick >= creator max upper tick`
    )
  })
})
