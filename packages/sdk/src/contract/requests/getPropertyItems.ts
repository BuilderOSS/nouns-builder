import { AddressType, CHAIN_ID } from '@buildeross/types'
import { getProvider, serverConfig } from '@buildeross/utils'
import { encodeAbiParameters, hexToBigInt, hexToString, keccak256, toHex } from 'viem'
import { readContract, readContracts } from 'wagmi/actions'

import { metadataAbi } from '../abis'

export type GetPropertyItemsResponse = {
  propertiesCount: number
  propertyItemsCount: number[]
  properties: Property[]
}

export const getPropertyItems = async (
  chainId: CHAIN_ID,
  metadataAddress: AddressType,
): Promise<GetPropertyItemsResponse> => {
  const baseParams = { address: metadataAddress, abi: metadataAbi, chainId: chainId }
  const propertiesCount = await readContract(serverConfig, {
    ...baseParams,
    functionName: 'propertiesCount',
  }).then((x) => Number(x))

  const contracts = Array(propertiesCount)
    .fill(0)
    .map((_, i) => {
      return {
        ...baseParams,
        functionName: 'itemsCount',
        args: [i],
      }
    })

  const propertyItemsCountBN = (await readContracts(serverConfig, {
    allowFailure: false,
    contracts,
  })) as bigint[]

  const propertyItemsCount = propertyItemsCountBN.map((x) => Number(x))

  const properties = await getProperties(
    chainId,
    metadataAddress,
    propertiesCount,
    propertyItemsCount,
  )

  return {
    propertiesCount,
    propertyItemsCount,
    properties,
  }
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

const getProperties = async (
  chainId: CHAIN_ID,
  metadataAddress: AddressType,
  propertiesCount: number,
  propertyItemsCount: number[],
): Promise<Property[]> => {
  const propertiesPromise = Array(propertiesCount)
    .fill(0)
    .map(async (_, i) => {
      return {
        name: await getPropertyName(chainId, metadataAddress, i),
        items: await Promise.all(
          Array(propertyItemsCount[i])
            .fill(0)
            .map(async (_, j) => {
              return await getItemFromStorage(chainId, metadataAddress, i, j)
            }),
        ),
      }
    })
  const properties: Array<PropertyWithReferenceSlot> =
    await Promise.all(propertiesPromise)

  const allReferenceSlotsSet = new Set<number>()

  properties.forEach((property) => {
    property.items.forEach((item) => {
      allReferenceSlotsSet.add(item.referenceSlot)
    })
  })

  const allReferenceSlots = Array.from(allReferenceSlotsSet)

  const ipfsDatas = (await readContracts(serverConfig, {
    allowFailure: false,
    contracts: allReferenceSlots.map((referenceSlot) => {
      return {
        address: metadataAddress,
        abi: metadataAbi,
        chainId: chainId,
        functionName: 'ipfsData',
        args: [referenceSlot],
      }
    }),
  })) as unknown as Array<[string, string]>

  const ipfsDataMap = ipfsDatas.reduce(
    (acc, data, index) => {
      const group = {
        baseUri: data?.[0],
        extension: data?.[1],
      }
      acc[allReferenceSlots[index]] = group
      return acc
    },
    {} as Record<number, IPFSGroup>,
  )

  const finalProperties = properties.map((property) => {
    const items = property.items.map((item) => {
      return {
        name: item.name,
        uri: `${ipfsDataMap[item.referenceSlot].baseUri}${property.name}/${item.name}${ipfsDataMap[item.referenceSlot].extension}`,
      }
    })
    return {
      ...property,
      items,
    }
  })

  return finalProperties
}

const getPropertyName = async (
  chainId: CHAIN_ID,
  metadataAddress: AddressType,
  propertyIndex: number,
) => {
  const baseParams = { address: metadataAddress, abi: metadataAbi, chainId: chainId }
  const property = await readContract(serverConfig, {
    ...baseParams,
    functionName: 'properties',
    args: [BigInt(propertyIndex)],
  })

  return property
}

async function decodeStringFromStorage(
  chainId: CHAIN_ID,
  contractAddress: `0x${string}`,
  rawValue: `0x${string}`,
): Promise<string> {
  if (!rawValue || rawValue === '0x') return ''

  const value = hexToBigInt(rawValue)
  const publicClient = getProvider(chainId)

  const lastByte = value & 0xffn
  const isInline = lastByte % 2n === 0n
  const length = Number(lastByte) / 2

  if (isInline) {
    // Inline string (<= 31 bytes)
    const hexBody = rawValue.slice(2, 2 + Math.min(length * 2, 64)) // max 31 bytes
    return hexToString(`0x${hexBody}`)
  } else {
    // Dynamic string (stored in separate slot)
    const dataSlot = keccak256(toHex(value))
    const lengthHex = await publicClient.getStorageAt({
      address: contractAddress,
      slot: dataSlot,
    })

    if (!lengthHex || lengthHex === '0x') return ''
    const strLen = Number(hexToBigInt(lengthHex))
    const numSlots = Math.ceil(strLen / 32)

    let hexData = ''
    for (let i = 0; i < numSlots; i++) {
      const slot = hexToBigInt(dataSlot) + BigInt(i)
      const chunk = await publicClient.getStorageAt({
        address: contractAddress,
        slot: toHex(slot, { size: 32 }),
      })
      if (!chunk || chunk === '0x') continue
      hexData += chunk.slice(2)
    }

    const fullHex = `0x${hexData.slice(0, strLen * 2)}` as `0x${string}`
    return hexToString(fullHex)
  }
}

export async function getItemFromStorage(
  chainId: CHAIN_ID,
  contractAddress: `0x${string}`,
  propertyIndex: number,
  itemIndex: number,
): Promise<{ referenceSlot: number; name: string }> {
  const publicClient = getProvider(chainId)

  // Step 1: keccak256(slot of 'properties' = 6)
  const propertiesBaseSlot = 6n
  const baseSlot = keccak256(
    encodeAbiParameters([{ name: 'slot', type: 'uint256' }], [propertiesBaseSlot]),
  )

  const baseSlotBN = hexToBigInt(baseSlot)
  const propertySlot = baseSlotBN + BigInt(propertyIndex) * 2n // struct span = 2
  const itemsSlot = propertySlot + 1n // 'items' is second member

  // Step 2: keccak256(itemsSlot) gives base of dynamic array
  const itemsBase = keccak256(
    encodeAbiParameters([{ name: 'slot', type: 'uint256' }], [itemsSlot]),
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
    ? await decodeStringFromStorage(chainId, contractAddress, namePointer)
    : ''

  return {
    referenceSlot: Number(referenceSlot),
    name,
  }
}
