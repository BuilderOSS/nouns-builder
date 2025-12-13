import { AddressType, CHAIN_ID } from '@buildeross/types'
import { getProvider, serverConfig } from '@buildeross/utils'
import {
  Abi,
  encodeAbiParameters,
  Hex,
  hexToBigInt,
  hexToString,
  keccak256,
  toHex,
} from 'viem'
import { readContract, readContracts } from 'wagmi/actions'

import { merklePropertyMetadataAbi, metadataAbi as metadataRendererAbi } from '../abis'

const propertyIpfsAbi = merklePropertyMetadataAbi as Abi

export type GetPropertyItemsResponse = {
  propertiesCount: number
  propertyItemsCount: number[]
  properties: Property[]
}

type ItemWithReferenceSlot = {
  referenceSlot: number
  name: string
}

type PropertyWithReferenceSlot = {
  name: string
  items: ItemWithReferenceSlot[]
}

type IPFSGroup = {
  baseUri: string
  extension: string
}

export type Item = {
  name: string
  uri: string
}

export type Property = {
  name: string
  items: Item[]
}

type RendererKind = 'MetadataRenderer' | 'PropertyIPFS'

/**
 * PropertyIPFS (EIP-7201) storage namespace slot from your contract:
 * bytes32 private constant PropertyIPFSStorageLocation =
 * 0x6e86adc91987cfd0c2727f2061f4e6022e5e9212736e682f4eb1f6949f6a7b00;
 */
const PROPERTY_IPFS_STORAGE_LOCATION =
  0x6e86adc91987cfd0c2727f2061f4e6022e5e9212736e682f4eb1f6949f6a7b00n

// -----------------------
// Interface detection
// -----------------------

const I_PROPERTY_IPFS_INTERFACE_ID = '0x862135ba' as const

async function detectRendererKindByInterface(
  chainId: CHAIN_ID,
  metadataAddress: AddressType
): Promise<RendererKind> {
  // supportsInterface is on PropertyIPFS (via BaseMetadata) and also likely on MetadataRenderer
  // If MetadataRenderer doesn’t implement it, the call may revert -> treat as false.
  try {
    const ok = await readContract(serverConfig, {
      address: metadataAddress,
      abi: propertyIpfsAbi, // has supportsInterface in it
      chainId,
      functionName: 'supportsInterface',
      args: [I_PROPERTY_IPFS_INTERFACE_ID],
    })
    return ok ? 'PropertyIPFS' : 'MetadataRenderer'
  } catch {
    return 'MetadataRenderer'
  }
}

// -----------------------
// ABI return normalization
// -----------------------

function normalizeIpfsGroup(data: any): IPFSGroup {
  // tuple: [baseUri, extension]
  if (Array.isArray(data) && data.length >= 2) {
    const baseUri = data[0]
    const extension = data[1]
    if (typeof baseUri === 'string' && typeof extension === 'string') {
      return { baseUri, extension }
    }
  }

  // object: { baseUri, extension } OR {0:...,1:...}
  if (data && typeof data === 'object') {
    if (typeof data.baseUri === 'string' && typeof data.extension === 'string') {
      return { baseUri: data.baseUri, extension: data.extension }
    }
    if (typeof data[0] === 'string' && typeof data[1] === 'string') {
      return { baseUri: data[0], extension: data[1] }
    }
  }

  throw new Error(`Invalid IPFSGroup shape: ${JSON.stringify(data)}`)
}

function normalizePropertyFromPropertyIPFS(ret: any): {
  name: string
  items: { referenceSlot: number; name: string }[]
} {
  // Expected from PropertyIPFS: { name: string, items: Item[] } or tuple-like
  const name: unknown = ret?.name ?? ret?.[0]
  const items: unknown = ret?.items ?? ret?.[1]

  if (typeof name !== 'string' || !Array.isArray(items)) {
    throw new Error(`Invalid PropertyIPFS properties(i) return: ${JSON.stringify(ret)}`)
  }

  const normItems = items.map((it: any) => {
    const ref = it?.referenceSlot ?? it?.[0]
    const nm = it?.name ?? it?.[1]
    if (typeof nm !== 'string')
      throw new Error(`Invalid item name: ${JSON.stringify(it)}`)
    // referenceSlot is uint16 so wagmi might give bigint or number
    const refNum =
      typeof ref === 'bigint'
        ? Number(ref)
        : typeof ref === 'number'
          ? ref
          : (() => {
              throw new Error(`Invalid referenceSlot: ${JSON.stringify(it)}`)
            })()

    return { referenceSlot: refNum, name: nm }
  })

  return { name, items: normItems }
}

// -----------------------
// Main API
// -----------------------

export const getPropertyItems = async (
  chainId: CHAIN_ID,
  metadataAddress: AddressType
): Promise<GetPropertyItemsResponse> => {
  const kind = await detectRendererKindByInterface(chainId, metadataAddress)

  const abi = kind === 'PropertyIPFS' ? propertyIpfsAbi : metadataRendererAbi
  const baseParams = { address: metadataAddress, abi, chainId }

  const propertiesCount = Number(
    await readContract(serverConfig, { ...baseParams, functionName: 'propertiesCount' })
  )

  const propertyItemsCountBN = await readContracts(serverConfig, {
    allowFailure: false,
    contracts: Array.from({ length: propertiesCount }, (_, i) => ({
      ...baseParams,
      functionName: 'itemsCount',
      args: [BigInt(i)],
    })),
  })

  const propertyItemsCount = (propertyItemsCountBN as bigint[]).map((x) => Number(x))

  if (kind === 'MetadataRenderer') {
    const properties = await getPropertiesFromMetadataRenderer(
      chainId,
      metadataAddress,
      propertiesCount,
      propertyItemsCount
    )

    return { propertiesCount, propertyItemsCount, properties }
  }

  try {
    const properties = await getPropertiesFromPropertyIPFS(
      chainId,
      metadataAddress,
      propertiesCount
    )

    return { propertiesCount, propertyItemsCount, properties }
  } catch (e) {
    // This PropertyIPFS does not have getters.
    const properties = await getPropertiesFromStorageForPropertyIPFS(
      chainId,
      metadataAddress,
      propertiesCount,
      propertyItemsCount
    )

    return { propertiesCount, propertyItemsCount, properties }
  }
}

const getPropertiesFromStorageForPropertyIPFS = async (
  chainId: CHAIN_ID,
  metadataAddress: AddressType,
  propertiesCount: number,
  propertyItemsCount: number[]
): Promise<Property[]> => {
  const propertiesBaseSlot = PROPERTY_IPFS_STORAGE_LOCATION + 1n
  const propsWithRef: PropertyWithReferenceSlot[] = await Promise.all(
    Array.from({ length: propertiesCount }, async (_, i) => {
      const name = await getPropertyNameFromStorage(
        chainId,
        metadataAddress,
        i,
        propertiesBaseSlot
      )
      const items = await Promise.all(
        Array.from({ length: propertyItemsCount[i] }, async (_, j) => {
          return await getItemFromStorage(
            chainId,
            metadataAddress,
            i,
            j,
            propertiesBaseSlot
          )
        })
      )
      return { name, items }
    })
  )

  // collect all reference slots used by any item
  const allReferenceSlots = Array.from(
    new Set(propsWithRef.flatMap((p) => p.items.map((it) => it.referenceSlot)))
  )

  const ipfsDataSlot = PROPERTY_IPFS_STORAGE_LOCATION + 2n
  const ipfsDataMap = await getIpfsGroupsFromStorage(
    chainId,
    metadataAddress,
    allReferenceSlots,
    ipfsDataSlot
  )

  // build final shape
  return propsWithRef.map((property) => ({
    name: property.name,
    items: property.items.map((item) => {
      const ipfs = ipfsDataMap[item.referenceSlot]
      if (!ipfs)
        throw new Error(`Missing IPFS data for reference slot ${item.referenceSlot}`)
      return {
        name: item.name,
        uri: `${ipfs.baseUri}${encodeURIComponent(property.name)}/${encodeURIComponent(item.name)}${ipfs.extension}`,
      }
    }),
  }))
}

async function getIpfsGroupsFromStorage(
  chainId: CHAIN_ID,
  metadataAddress: AddressType,
  referenceSlots: number[],
  ipfsDataSlot: bigint
): Promise<Record<number, IPFSGroup>> {
  // PropertyIPFS: read from storage
  const publicClient = getProvider(chainId)

  // ipfsBase = keccak256(abi.encode(ipfsDataSlot))
  const ipfsBase = keccak256(
    encodeAbiParameters([{ name: 'slot', type: 'uint256' }], [ipfsDataSlot])
  )
  const ipfsBaseBN = hexToBigInt(ipfsBase)

  const out: Record<number, IPFSGroup> = {}

  for (const idx of referenceSlots) {
    // IPFSGroup struct span assumed = 2 slots: [baseUri, extension]
    const elementSlot = ipfsBaseBN + BigInt(idx) * 2n

    const baseUriPtr = await publicClient.getStorageAt({
      address: metadataAddress,
      slot: toHex(elementSlot, { size: 32 }),
    })
    const extPtr = await publicClient.getStorageAt({
      address: metadataAddress,
      slot: toHex(elementSlot + 1n, { size: 32 }),
    })

    const baseUri = baseUriPtr
      ? await decodeStringFromStorage(
          chainId,
          metadataAddress,
          toHex(elementSlot, { size: 32 }),
          baseUriPtr as Hex
        )
      : ''

    const extension = extPtr
      ? await decodeStringFromStorage(
          chainId,
          metadataAddress,
          toHex(elementSlot + 1n, { size: 32 }),
          extPtr as Hex
        )
      : ''

    out[idx] = { baseUri, extension }
  }

  return out
}

const getPropertyNameFromStorage = async (
  chainId: CHAIN_ID,
  metadataAddress: AddressType,
  propertyIndex: number,
  propertiesSlot: bigint
): Promise<string> => {
  // PropertyIPFS: storage read
  const publicClient = getProvider(chainId)

  // propertiesBase = keccak256(abi.encode(propertiesSlot))
  const propertiesBase = keccak256(
    encodeAbiParameters([{ name: 'slot', type: 'uint256' }], [propertiesSlot])
  )
  const propertiesBaseBN = hexToBigInt(propertiesBase)

  // Property struct assumed: [string name, Item[] items] => 2 slots
  const propertySlot = propertiesBaseBN + BigInt(propertyIndex) * 2n

  const namePtr = await publicClient.getStorageAt({
    address: metadataAddress,
    slot: toHex(propertySlot, { size: 32 }),
  })

  return namePtr
    ? await decodeStringFromStorage(
        chainId,
        metadataAddress,
        toHex(propertySlot, { size: 32 }),
        namePtr as Hex
      )
    : ''
}

// -----------------------
// Properties - PropertyIPFS path (use properties(i) that returns full struct)
// -----------------------

async function getPropertiesFromPropertyIPFS(
  chainId: CHAIN_ID,
  metadataAddress: AddressType,
  propertiesCount: number
): Promise<Property[]> {
  // 1) Fetch all Property structs via properties(i)
  const propsRaw = await readContracts(serverConfig, {
    allowFailure: false,
    contracts: Array.from({ length: propertiesCount }, (_, i) => ({
      address: metadataAddress,
      abi: propertyIpfsAbi,
      chainId,
      functionName: 'properties',
      args: [BigInt(i)],
    })),
  })

  const props = (propsRaw as any[]).map(normalizePropertyFromPropertyIPFS)

  // 2) Collect unique referenceSlots
  const allReferenceSlots = Array.from(
    new Set(props.flatMap((p) => p.items.map((it) => it.referenceSlot)))
  )

  // 3) Fetch ipfs groups via ipfsData(slot)
  const ipfsDataMap = await getIpfsGroupsViaGetter(
    chainId,
    metadataAddress,
    allReferenceSlots,
    'PropertyIPFS'
  )

  // 4) Build final output
  return props.map((p) => ({
    name: p.name,
    items: p.items.map((it) => {
      const ipfs = ipfsDataMap[it.referenceSlot]
      if (!ipfs)
        throw new Error(`Missing IPFS data for reference slot ${it.referenceSlot}`)
      return {
        name: it.name,
        uri: `${ipfs.baseUri}${encodeURIComponent(p.name)}/${encodeURIComponent(it.name)}${ipfs.extension}`,
      }
    }),
  }))
}

// -----------------------
// Properties - MetadataRenderer path (properties(i) returns string only; items are storage-driven?)
// If your MetadataRenderer does NOT expose items, you must already have a working method.
// Here I keep your existing approach: get property name via getter and items via your itemsCount + storage reader
// But if MetadataRenderer also exposes items via a getter, switch to that.
// -----------------------

async function getPropertiesFromMetadataRenderer(
  chainId: CHAIN_ID,
  metadataAddress: AddressType,
  propertiesCount: number,
  propertyItemsCount: number[]
): Promise<Property[]> {
  // You said MetadataRenderer path is already flawless.
  // Keep it simple: use properties(i) for name and your existing getItemFromStorage() for items.
  // If you actually have an items getter on MetadataRenderer, tell me and I’ll remove storage reads.

  const names = await readContracts(serverConfig, {
    allowFailure: false,
    contracts: Array.from({ length: propertiesCount }, (_, i) => ({
      address: metadataAddress,
      abi: metadataRendererAbi,
      chainId,
      functionName: 'properties',
      args: [BigInt(i)],
    })),
  })

  const propsWithRef = await Promise.all(
    Array.from({ length: propertiesCount }, async (_, i) => {
      const name = names[i] as string

      // NOTE: this calls your existing storage-based item reader (since that path works today for MetadataRenderer)
      const items = await Promise.all(
        Array.from({ length: propertyItemsCount[i] }, async (_, j) => {
          return await getItemFromStorage(chainId, metadataAddress, i, j)
        })
      )

      return { name, items }
    })
  )

  const allReferenceSlots = Array.from(
    new Set(propsWithRef.flatMap((p) => p.items.map((it) => it.referenceSlot)))
  )

  const ipfsDataMap = await getIpfsGroupsViaGetter(
    chainId,
    metadataAddress,
    allReferenceSlots,
    'MetadataRenderer'
  )

  return propsWithRef.map((p) => ({
    name: p.name,
    items: p.items.map((it) => {
      const ipfs = ipfsDataMap[it.referenceSlot]
      if (!ipfs)
        throw new Error(`Missing IPFS data for reference slot ${it.referenceSlot}`)
      return {
        name: it.name,
        uri: `${ipfs.baseUri}${encodeURIComponent(p.name)}/${encodeURIComponent(it.name)}${ipfs.extension}`,
      }
    }),
  }))
}

// -----------------------
// Shared: ipfsData getter fetch (both kinds)
// -----------------------

async function getIpfsGroupsViaGetter(
  chainId: CHAIN_ID,
  metadataAddress: AddressType,
  referenceSlots: number[],
  kind: RendererKind
): Promise<Record<number, IPFSGroup>> {
  const abi = kind === 'PropertyIPFS' ? propertyIpfsAbi : metadataRendererAbi

  const ipfsDatas = await readContracts(serverConfig, {
    allowFailure: false,
    contracts: referenceSlots.map((referenceSlot) => ({
      address: metadataAddress,
      abi,
      chainId,
      functionName: 'ipfsData',
      args: [BigInt(referenceSlot)],
    })),
  })

  return (ipfsDatas as any[]).reduce(
    (acc, data, i) => {
      acc[referenceSlots[i]] = normalizeIpfsGroup(data)
      return acc
    },
    {} as Record<number, IPFSGroup>
  )
}

async function getItemFromStorage(
  chainId: CHAIN_ID,
  contractAddress: `0x${string}`,
  propertyIndex: number,
  itemIndex: number,
  propertiesBaseSlot: bigint = 6n
): Promise<ItemWithReferenceSlot> {
  const publicClient = getProvider(chainId)

  // Step 1: keccak256(slot of 'properties' = 6)
  const baseSlot = keccak256(
    encodeAbiParameters([{ name: 'slot', type: 'uint256' }], [propertiesBaseSlot])
  )

  const baseSlotBN = hexToBigInt(baseSlot)
  const propertySlot = baseSlotBN + BigInt(propertyIndex) * 2n // struct span = 2
  const itemsSlot = propertySlot + 1n // 'items' is second member

  // Step 2: keccak256(itemsSlot) gives base of dynamic array
  const itemsBase = keccak256(
    encodeAbiParameters([{ name: 'slot', type: 'uint256' }], [itemsSlot])
  )

  const itemsBaseBN = hexToBigInt(itemsBase)
  const itemBaseSlot = itemsBaseBN + BigInt(itemIndex) * 2n // each Item spans 2 slots

  // Slot 1: referenceSlot (uint16)
  const refSlotHex = await publicClient.getStorageAt({
    address: contractAddress,
    slot: toHex(itemBaseSlot, { size: 32 }),
  })

  const referenceSlot = refSlotHex
    ? hexToBigInt(refSlotHex) & 0xffffn // mask lower 2 bytes
    : 0n

  // Slot 2: name (string pointer)
  const nameSlot = itemBaseSlot + 1n
  const namePointer = await publicClient.getStorageAt({
    address: contractAddress,
    slot: toHex(nameSlot, { size: 32 }),
  })

  const name = namePointer
    ? await decodeStringFromStorage(
        chainId,
        contractAddress,
        toHex(nameSlot, { size: 32 }),
        namePointer
      )
    : ''

  return {
    referenceSlot: Number(referenceSlot),
    name,
  }
}

async function decodeStringFromStorage(
  chainId: CHAIN_ID,
  contractAddress: `0x${string}`,
  slotHex: `0x${string}`, // 32-byte slot, e.g. toHex(slot, { size: 32 })
  rawValue: `0x${string}` // value read from that slot
): Promise<string> {
  if (!rawValue || rawValue === '0x') return ''

  const publicClient = getProvider(chainId)
  const v = hexToBigInt(rawValue)

  // Short (<=31 bytes) if lowest bit is 0
  const isShort = (v & 1n) === 0n

  if (isShort) {
    const lastByte = Number(v & 0xffn)
    const len = lastByte / 2 // 0..31

    // data is stored in the high-order bytes of the slot
    const hexBody = rawValue.slice(2, 2 + len * 2)
    return len > 0 ? hexToString(`0x${hexBody}`) : ''
  }

  // Long (>=32 bytes): length is (v - 1) / 2
  const strLenBig = (v - 1n) / 2n
  const strLen = Number(strLenBig)
  if (strLen === 0) return ''

  // data starts at keccak256(slot)
  const dataStartHex = keccak256(slotHex)
  const dataStart = hexToBigInt(dataStartHex)

  const numSlots = Math.ceil(strLen / 32)
  let hexData = ''

  for (let i = 0; i < numSlots; i++) {
    const s = dataStart + BigInt(i)
    const chunk = await publicClient.getStorageAt({
      address: contractAddress,
      slot: toHex(s, { size: 32 }),
    })
    if (chunk && chunk !== '0x') hexData += chunk.slice(2)
  }

  const fullHex = `0x${hexData.slice(0, strLen * 2)}` as `0x${string}`
  return hexToString(fullHex)
}
