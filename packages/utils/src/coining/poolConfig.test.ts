// poolConfig.test.ts

import { zeroAddress } from 'viem'
import { assert, describe, it } from 'vitest'

import {
  createClankerPoolPositionsFromTargetFdv,
  createContentPoolConfigFromTargetFdv,
  decodePoolConfig,
  DEFAULT_CLANKER_TARGET_FDV,
  encodePoolConfig,
} from './index'

const ZORA_ADDRESS = '0x1111111111166b7fe7bd91427724b487980afc69'
const ZORA_USD = 0.044
const ETH_USD = 2_750

// ---------- CONTENT POOL TESTS (3 bands, Zora) ----------

describe('createContentPoolConfigFromTargetFdv', () => {
  const zoraContentConfig = createContentPoolConfigFromTargetFdv({
    currency: ZORA_ADDRESS, // ZORA
    quoteTokenUsd: ZORA_USD,
    targetFdvUsd: 1_000_000, // target FDV at $1m
  })

  it('should create a content pool config with correct lengths', () => {
    assert.equal(zoraContentConfig.currency, ZORA_ADDRESS)
    assert.equal(zoraContentConfig.lowerTicks.length, 3)
    assert.equal(zoraContentConfig.upperTicks.length, 3)
    assert.equal(zoraContentConfig.numDiscoveryPositions.length, 3)
    assert.equal(zoraContentConfig.maxDiscoverySupplyShares.length, 3)
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
    assert.ok(upperTicks.length === 3)
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

  it('should shift ticks upward when targetFdvUsd increases', () => {
    const configLow = createContentPoolConfigFromTargetFdv({
      currency: ZORA_ADDRESS,
      quoteTokenUsd: ZORA_USD,
      targetFdvUsd: 500_000, // lower target
    })
    const configHigh = createContentPoolConfigFromTargetFdv({
      currency: ZORA_ADDRESS,
      quoteTokenUsd: ZORA_USD,
      targetFdvUsd: 5_000_000, // higher target
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

  it('should use geometric spread around target', () => {
    const targetFdv = 1_000_000
    const config = createContentPoolConfigFromTargetFdv({
      currency: ZORA_ADDRESS,
      quoteTokenUsd: ZORA_USD,
      targetFdvUsd: targetFdv,
    })

    // The range should be symmetric in log space around the target
    // For content coins: RANGE_FACTOR_SQRT ≈ 3.003
    // So min ≈ target / 3, max ≈ target * 3
    const minTick = config.lowerTicks[0]
    const maxTick = config.upperTicks[config.upperTicks.length - 1]

    // Ticks should span a reasonable range
    assert.ok(maxTick > minTick, 'max tick should be greater than min tick')
    assert.ok(maxTick - minTick > 10000, 'tick range should be substantial')
  })
})

// ---------- CLANKER POOL TESTS (5 positions, Project preset) ----------

describe('createClankerPoolPositionsFromTargetFdv', () => {
  const ethClankerPositions = createClankerPoolPositionsFromTargetFdv({
    targetFdvUsd: DEFAULT_CLANKER_TARGET_FDV, // ~$6.364M
    quoteTokenUsd: ETH_USD,
  })

  it('should create 5 pool positions with correct distribution', () => {
    assert.equal(ethClankerPositions.length, 5)

    // Verify basis points (must sum to 10000 = 100%)
    const totalBps = ethClankerPositions.reduce((sum, pos) => sum + pos.positionBps, 0)
    assert.equal(totalBps, 10000, 'total basis points should equal 10000 (100%)')

    // Verify Project preset distribution: [10%, 50%, 15%, 20%, 5%]
    assert.equal(ethClankerPositions[0].positionBps, 1000, 'position 1 should be 10%')
    assert.equal(ethClankerPositions[1].positionBps, 5000, 'position 2 should be 50%')
    assert.equal(ethClankerPositions[2].positionBps, 1500, 'position 3 should be 15%')
    assert.equal(ethClankerPositions[3].positionBps, 2000, 'position 4 should be 20%')
    assert.equal(ethClankerPositions[4].positionBps, 500, 'position 5 should be 5%')
  })

  it('should have valid tick ranges', () => {
    ethClankerPositions.forEach((pos, i) => {
      assert.ok(
        pos.tickLower < pos.tickUpper,
        `position ${i}: tickLower must be less than tickUpper`
      )
    })
  })

  it('should have overlapping positions (nested structure)', () => {
    // Position 2 and 3 should overlap (both end at mid3)
    assert.equal(
      ethClankerPositions[1].tickUpper,
      ethClankerPositions[2].tickUpper,
      'positions 2 and 3 should share upper tick (mid3)'
    )

    // Position 4 and 5 should overlap (both end at max)
    assert.equal(
      ethClankerPositions[3].tickUpper,
      ethClankerPositions[4].tickUpper,
      'positions 4 and 5 should share upper tick (max)'
    )
  })

  it('should shift positions when target FDV changes', () => {
    const lowTarget = createClankerPoolPositionsFromTargetFdv({
      targetFdvUsd: 1_000_000,
      quoteTokenUsd: ETH_USD,
    })
    const highTarget = createClankerPoolPositionsFromTargetFdv({
      targetFdvUsd: 10_000_000,
      quoteTokenUsd: ETH_USD,
    })

    // All ticks should shift upward with higher target
    lowTarget.forEach((pos, i) => {
      assert.ok(
        highTarget[i].tickLower > pos.tickLower,
        `position ${i}: higher target should have higher tickLower`
      )
      assert.ok(
        highTarget[i].tickUpper > pos.tickUpper,
        `position ${i}: higher target should have higher tickUpper`
      )
    })
  })

  it('should maintain geometric spread (min/max ratio)', () => {
    const positions = createClankerPoolPositionsFromTargetFdv({
      targetFdvUsd: DEFAULT_CLANKER_TARGET_FDV,
      quoteTokenUsd: ETH_USD,
    })

    const minTick = positions[0].tickLower
    const maxTick = positions[positions.length - 1].tickUpper

    // With CLANKER_RANGE_FACTOR_SQRT ≈ 235.7, the range should be substantial
    // Expect at least 100k ticks difference
    assert.ok(
      maxTick - minTick > 100000,
      `tick range should span >100k ticks, got ${maxTick - minTick}`
    )
  })

  it('should handle different ETH prices correctly', () => {
    const lowEthPrice = createClankerPoolPositionsFromTargetFdv({
      targetFdvUsd: DEFAULT_CLANKER_TARGET_FDV,
      quoteTokenUsd: 1_000, // Lower ETH price
    })
    const highEthPrice = createClankerPoolPositionsFromTargetFdv({
      targetFdvUsd: DEFAULT_CLANKER_TARGET_FDV,
      quoteTokenUsd: 5_000, // Higher ETH price
    })

    // With higher ETH price, same USD values map to lower ticks
    lowEthPrice.forEach((pos, i) => {
      assert.ok(
        highEthPrice[i].tickLower < pos.tickLower,
        `position ${i}: higher ETH price should result in lower tickLower`
      )
    })
  })

  it('should throw on invalid inputs', () => {
    // Should throw on zero target FDV
    assert.throws(() =>
      createClankerPoolPositionsFromTargetFdv({
        targetFdvUsd: 0,
        quoteTokenUsd: ETH_USD,
      })
    )

    // Should throw on negative target FDV
    assert.throws(() =>
      createClankerPoolPositionsFromTargetFdv({
        targetFdvUsd: -1000,
        quoteTokenUsd: ETH_USD,
      })
    )

    // Should throw on zero quote token price
    assert.throws(() =>
      createClankerPoolPositionsFromTargetFdv({
        targetFdvUsd: DEFAULT_CLANKER_TARGET_FDV,
        quoteTokenUsd: 0,
      })
    )
  })

  it('should handle safety rails (clamping)', () => {
    // Test very low target (should be clamped to floor)
    const veryLow = createClankerPoolPositionsFromTargetFdv({
      targetFdvUsd: 100, // Below floor
      quoteTokenUsd: ETH_USD,
    })
    assert.ok(veryLow.length === 5, 'should still return 5 positions')

    // Test very high target (should be clamped to ceiling)
    const veryHigh = createClankerPoolPositionsFromTargetFdv({
      targetFdvUsd: 1_000_000_000_000, // Above ceiling
      quoteTokenUsd: ETH_USD,
    })
    assert.ok(veryHigh.length === 5, 'should still return 5 positions')
  })
})

// ---------- POOL CONFIG ENCODING/DECODING TESTS ----------

describe('encodePoolConfig and decodePoolConfig', () => {
  it('should encode and decode a content pool config', () => {
    const config = createContentPoolConfigFromTargetFdv({
      currency: ZORA_ADDRESS,
      quoteTokenUsd: ZORA_USD,
      targetFdvUsd: 1_000_000,
    })

    const encoded = encodePoolConfig(config)
    const decoded = decodePoolConfig(encoded)

    assert.equal(decoded.version, 1)
    assert.equal(decoded.currency.toLowerCase(), config.currency.toLowerCase())
    assert.deepEqual(decoded.tickLower, config.lowerTicks)
    assert.deepEqual(decoded.tickUpper, config.upperTicks)
    assert.deepEqual(decoded.numDiscoveryPositions, config.numDiscoveryPositions)
    assert.deepEqual(decoded.maxDiscoverySupplyShare, config.maxDiscoverySupplyShares)
  })

  //it('should decode a sample pool config', () => {
  //  const encoded =
  //    '0x00000000000000000000000000000000000000000000000000000000000000040000000000000000000000007f8d4d31f31cc00c175dcd63e7cfc7b44ede867400000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000002400000000000000000000000000000000000000000000000000000000000000003ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff716cffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff90acffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff987c0000000000000000000000000000000000000000000000000000000000000003ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff987cffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc75cffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc75c0000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000b000000000000000000000000000000000000000000000000000000000000000b000000000000000000000000000000000000000000000000000000000000000b000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000003782dace9d900000000000000000000000000000000000000000000000000000429d069189e00000000000000000000000000000000000000000000000000000214e8348c4f0000'
  //  const decoded = decodePoolConfig(encoded)
  //
  //  console.log('Version:', decoded.version)
  //  console.log('Currency:', decoded.currency)
  //  console.log('Tick lower:', decoded.tickLower)
  //  console.log('Tick upper:', decoded.tickUpper)
  //  console.log('Num discovery positions:', decoded.numDiscoveryPositions)
  //  console.log('Max discovery supply share:', decoded.maxDiscoverySupplyShare)
  //})
})

// ---------- COMPARISON TESTS ----------

describe('pool config shape comparison', () => {
  it('content configs should have 3 bands and Clanker should have 5 positions', () => {
    const content = createContentPoolConfigFromTargetFdv({
      currency: ZORA_ADDRESS,
      quoteTokenUsd: ZORA_USD,
      targetFdvUsd: 1_000_000,
    })

    const clanker = createClankerPoolPositionsFromTargetFdv({
      targetFdvUsd: DEFAULT_CLANKER_TARGET_FDV,
      quoteTokenUsd: ETH_USD,
    })

    assert.equal(content.lowerTicks.length, 3, 'content should have 3 bands')
    assert.equal(clanker.length, 5, 'clanker should have 5 positions')
  })

  it('Clanker positions should span wider range than content (due to larger range factor)', () => {
    const content = createContentPoolConfigFromTargetFdv({
      currency: zeroAddress,
      quoteTokenUsd: ETH_USD,
      targetFdvUsd: DEFAULT_CLANKER_TARGET_FDV, // Use same target for comparison
    })

    const clanker = createClankerPoolPositionsFromTargetFdv({
      targetFdvUsd: DEFAULT_CLANKER_TARGET_FDV,
      quoteTokenUsd: ETH_USD,
    })

    const contentRange = Math.max(...content.upperTicks) - Math.min(...content.lowerTicks)
    const clankerRange = clanker[4].tickUpper - clanker[0].tickLower

    // Clanker uses RANGE_FACTOR ≈ 55555 vs Content ≈ 9.024
    // So Clanker should have much wider range
    assert.ok(
      clankerRange > contentRange,
      `Clanker range (${clankerRange}) should be > content range (${contentRange})`
    )
  })
})
