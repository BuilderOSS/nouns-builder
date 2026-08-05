import { CHAIN_ID } from '@buildeross/types'
import {
  deployEscrowAbi,
  getEscrowBundler,
  getEscrowBundlerLegacy,
} from '@buildeross/utils/escrow'
import { encodeAbiParameters, encodeFunctionData, parseAbiParameters } from 'viem'
import { describe, expect, it } from 'vitest'

import { matchEscrowBundler, parseEscrowDeploy } from './escrowDeploy'

const CLIENT = '0x1111111111111111111111111111111111111111'
const RESOLVER = '0x2222222222222222222222222222222222222222'
const TOKEN = '0x4200000000000000000000000000000000000006' // WETH on Base
const PROVIDER = '0x3333333333333333333333333333333333333333'
const PROVIDER_RCPT = '0x4444444444444444444444444444444444444444'
const CLIENT_RCPT = '0x5555555555555555555555555555555555555555'
const ZERO = '0x0000000000000000000000000000000000000000'
const TERMINATION = 1893456000n // some future unix seconds

// 11 params in the exact order decodeEscrowData expects.
const escrowData = encodeAbiParameters(
  parseAbiParameters(
    'address,uint8,address,address,uint256,bytes32,address,bool,address,address,address'
  ),
  [
    CLIENT,
    0,
    RESOLVER,
    TOKEN,
    TERMINATION,
    `0x${'00'.repeat(32)}`,
    PROVIDER,
    true,
    ZERO,
    PROVIDER_RCPT,
    CLIENT_RCPT,
  ]
)

const MILESTONES = [1_000000000000000000n, 2_000000000000000000n, 3_000000000000000000n]
const FUND = 6_000000000000000000n

const calldataV2 = encodeFunctionData({
  abi: deployEscrowAbi,
  functionName: 'deployEscrow',
  args: [PROVIDER, MILESTONES, escrowData, `0x${'75'.repeat(32)}`, FUND],
})

const baseBundler = getEscrowBundler(CHAIN_ID.BASE)

describe('matchEscrowBundler', () => {
  it('matches the Base v2 bundler (case-insensitive)', () => {
    expect(matchEscrowBundler(CHAIN_ID.BASE, baseBundler.toUpperCase())).toBe('v2')
  })
  it('matches the Base legacy bundler', () => {
    expect(matchEscrowBundler(CHAIN_ID.BASE, getEscrowBundlerLegacy(CHAIN_ID.BASE))).toBe(
      'legacy'
    )
  })
  it('returns null for a non-bundler address', () => {
    expect(matchEscrowBundler(CHAIN_ID.BASE, CLIENT)).toBeNull()
  })
  it('returns null for a missing target', () => {
    expect(matchEscrowBundler(CHAIN_ID.BASE, undefined)).toBeNull()
  })
})

describe('parseEscrowDeploy', () => {
  it('decodes milestone amounts and their total', () => {
    const parsed = parseEscrowDeploy(CHAIN_ID.BASE, baseBundler, calldataV2)
    expect(parsed).not.toBeNull()
    expect(parsed!.version).toBe('v2')
    expect(parsed!.milestoneAmounts).toEqual(MILESTONES)
    expect(parsed!.totalAmount).toBe(6_000000000000000000n)
    expect(parsed!.fundAmount).toBe(FUND)
  })

  it('decodes the escrow parties and token', () => {
    const { escrow, provider } = parseEscrowDeploy(
      CHAIN_ID.BASE,
      baseBundler,
      calldataV2
    )!
    expect(provider?.toLowerCase()).toBe(PROVIDER)
    expect(escrow.clientAddress?.toLowerCase()).toBe(CLIENT)
    expect(escrow.resolverAddress?.toLowerCase()).toBe(RESOLVER)
    expect(escrow.tokenAddress?.toLowerCase()).toBe(TOKEN)
    expect(Number(escrow.terminationTime)).toBe(Number(TERMINATION))
    expect(escrow.providerRecipientAddress?.toLowerCase()).toBe(PROVIDER_RCPT)
    expect(escrow.clientRecipientAddress?.toLowerCase()).toBe(CLIENT_RCPT)
  })

  it('returns null when the target is not a known bundler', () => {
    expect(parseEscrowDeploy(CHAIN_ID.BASE, CLIENT, calldataV2)).toBeNull()
  })

  it('returns null for undecodable calldata', () => {
    expect(parseEscrowDeploy(CHAIN_ID.BASE, baseBundler, '0xdeadbeef')).toBeNull()
  })
})
