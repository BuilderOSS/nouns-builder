import { getProvider } from '@buildeross/utils/provider'
import { Address, getAddress, Hex, isAddress, PublicClient } from 'viem'

import { getRedisConnection } from './redisConnection'

// Common read-only methods used by proxies
const IMPLEMENTATION_SELECTORS: Record<string, Hex> = {
  implementation: '0x5c60da1b',
  getImplementation: '0x7915cf02',
  proxyImplementation: '0x52d1902d',
  logic: '0x4c4ee1e1',
  masterCopy: '0xa619486e',
}

const getImplementationAddressRedisKey = (chainId: string, address: string) =>
  `proxy:impl:${chainId}:${address}`

const BEACON_SLOT: Hex =
  '0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50' // EIP-1967 beacon slot

const IMPLEMENTATION_SLOTS: Hex[] = [
  '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc', // EIP-1967 implementation slot
  '0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3', // keccak256("org.zeppelinos.proxy.implementation")
]

const EIP1167_PATTERNS = [
  {
    prefix: '363d3d373d3d3d363d73',
    suffix: '5af43d82803e903d91602b57fd5bf3',
  },
  {
    prefix: '3d602d80600a3d3981f3',
    suffix: '5af43d82803e903d91602b57fd5bf3',
  },
]

const isDataValid = (data?: Hex | null): data is Hex => !!data && /^0x(?!0*$)/i.test(data)

const extractAddress = (raw: Hex | undefined): Address | null => {
  if (!isDataValid(raw)) return null
  const normalized = raw.slice(2)
  if (normalized.length < 40) return null
  const addr = `0x${normalized.slice(-40)}` as Address
  if (isAddress(addr)) return getAddress(addr)
  return null
}

const readImplementationViaImplementationSlots = async (
  provider: PublicClient,
  address: Address
): Promise<Address | null> => {
  for (const slot of IMPLEMENTATION_SLOTS) {
    try {
      const raw = await provider.getStorageAt({ address, slot })
      const candidate = extractAddress(raw)
      if (candidate) return candidate
    } catch (err) {
      console.warn(`Slot read failed for ${slot}:`, err)
    }
  }
  return null
}

const readImplementationViaBeaconSlot = async (
  provider: PublicClient,
  address: Address
): Promise<Address | null> => {
  try {
    const raw = await provider.getStorageAt({ address, slot: BEACON_SLOT })
    const candidate = extractAddress(raw)
    if (candidate) {
      const { data: res } = await provider.call({
        to: candidate,
        data: IMPLEMENTATION_SELECTORS.implementation,
        gas: 100_000n,
      })
      const impl = extractAddress(res)
      if (impl) return impl
    }
  } catch (err) {
    console.warn(`Beacon slot read failed:`, err)
  }
  return null
}

const readImplementationViaDirectCalls = async (
  provider: PublicClient,
  address: Address
): Promise<Address | null> => {
  for (const [name, selector] of Object.entries(IMPLEMENTATION_SELECTORS)) {
    try {
      const { data: res } = await provider.call({
        to: address,
        data: selector,
        gas: 100_000n,
      })
      const impl = extractAddress(res)
      if (impl) return impl
    } catch (err) {
      console.warn(`Implementation call failed for ${name}:`, err)
    }
  }
  return null
}

const readImplementationViaCode = async (
  provider: PublicClient,
  address: Address
): Promise<Address | null> => {
  try {
    const code = await provider.getCode({ address })
    if (!isDataValid(code)) return null
    const body = code.slice(2)

    // Strict EIP-1167 minimal proxy detection (exact length match)
    if (body.length > 200) return null

    for (const { prefix, suffix } of EIP1167_PATTERNS) {
      const expectedLength = prefix.length + 40 + suffix.length
      if (body.length !== expectedLength) continue
      if (!body.startsWith(prefix)) continue
      if (!body.endsWith(suffix)) continue

      const implHex = `0x${body.slice(prefix.length, prefix.length + 40)}`
      if (isAddress(implHex)) return getAddress(implHex)
    }
  } catch (err) {
    console.warn('Code fetch failed:', err)
  }
  return null
}

type ImplementationMethod = (
  provider: PublicClient,
  address: Address
) => Promise<Address | null>

type ImplementationDetectionType = 'implementation' | 'beacon' | 'direct' | 'code'
const READ_IMPLEMENTATION_METHODS: Record<
  ImplementationDetectionType,
  ImplementationMethod
> = {
  implementation: readImplementationViaImplementationSlots,
  beacon: readImplementationViaBeaconSlot,
  direct: readImplementationViaDirectCalls,
  code: readImplementationViaCode,
}

type ImplementationSourceType = ImplementationDetectionType | 'cache' | 'none'
type GetImplementationReturnType = {
  implementation: Address
  source: ImplementationSourceType
}

export async function getImplementationAddress(
  chainId: number,
  addressInput: Address
): Promise<GetImplementationReturnType> {
  const address: Address = getAddress(addressInput)
  const redis = getRedisConnection()
  const cacheKey = getImplementationAddressRedisKey(chainId.toString(), address)

  const cached = await redis?.get(cacheKey)
  if (cached) {
    return {
      implementation: getAddress(cached),
      source: 'cache',
    }
  }

  const provider = getProvider(chainId)
  let implementation: Address | null = null
  let source: ImplementationSourceType = 'none'

  for (const [type, method] of Object.entries(READ_IMPLEMENTATION_METHODS)) {
    implementation = await method(provider, address)
    if (implementation) {
      source = type as ImplementationSourceType
      break
    }
  }

  let cacheTime = 60 * 60 * 24 // 24 hours
  if (!implementation) {
    cacheTime = 60 * 60 // 1 hour
  }
  const finalAddress = getAddress(implementation || address)
  await redis?.setex(cacheKey, cacheTime, finalAddress)
  return {
    implementation: finalAddress,
    source: source,
  }
}
