import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { metadataAbi } from '@buildeross/sdk/contract'
import { AddressType, CHAIN_ID, Property } from '@buildeross/types'
import { useCallback, useState } from 'react'
import useSWRImmutable from 'swr/immutable'
import { decodeFunctionData, encodeFunctionData } from 'viem'
import { usePublicClient, useWriteContract } from 'wagmi'

export const MAX_ITEMS_PER_CHUNK = 50

export const useSetupMetadata = (
  sourceTokenAddress?: AddressType,
  sourceMetadataAddress?: AddressType,
  targetMetadataAddress?: AddressType,
  sourceChainId?: CHAIN_ID,
  targetChainId?: CHAIN_ID,
  onProgressUpdate?: (current: number, total: number) => void,
  onTxHashAdded?: (hash: `0x${string}`) => void,
  persistedProgress?: { current: number; total: number },
  persistedTxHashes?: `0x${string}`[]
) => {
  // Fetch metadata properties from API (which calls blockchain via getPropertyItems)
  const {
    data: properties,
    error: fetchError,
    isLoading: isLoadingProperties,
  } = useSWRImmutable(
    sourceMetadataAddress && sourceChainId
      ? [SWR_KEYS.ENCODED_DAO_METADATA, sourceMetadataAddress, sourceChainId]
      : null,
    async ([_key, metadataAddress, chainId]) => {
      try {
        // Fetch property data from API endpoint (which queries blockchain)
        // Using native fetch instead of axios to avoid timeout issues
        // (API can take longer than 60s on first request when cache is cold)
        const url = `${BASE_URL}/api/property-items?chainId=${chainId}&metadataAddress=${metadataAddress}`
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(
            `Failed to fetch property items: ${response.status} ${response.statusText}`
          )
        }

        const data = (await response.json()) as {
          propertiesCount: number
          propertyItemsCount: number[]
          properties: Property[]
          source?: 'cache' | 'blockchain'
        }

        const { properties: propertyData, propertiesCount } = data

        if (propertiesCount === 0 || propertyData.length === 0) {
          console.warn(
            '[useSetupMetadata] No properties found on-chain. This is valid for DAOs using simple metadata renderers.'
          )
          return []
        }

        // Group properties by their IPFS base URI and extension
        // Properties with the same baseUri+extension should be added together via addProperties()
        const propertyGroups = new Map<
          string,
          {
            names: string[]
            items: { propertyId: bigint; name: string; isNewProperty: boolean }[]
            ipfsGroup: { baseUri: string; extension: string }
          }
        >()

        propertyData.forEach((property) => {
          // Extract baseUri and extension from the first item's URI
          // Format: {baseUri}{propertyName}/{itemName}{extension}
          const firstItemUri = property.items[0]?.uri
          if (!firstItemUri) return

          // Parse the URI to extract baseUri and extension
          const propertyNameEncoded = encodeURIComponent(property.name)
          const firstItemNameEncoded = encodeURIComponent(property.items[0].name)
          const pattern = `${propertyNameEncoded}/${firstItemNameEncoded}`
          const patternIndex = firstItemUri.indexOf(pattern)

          if (patternIndex === -1) {
            console.warn('[useSetupMetadata] Could not parse URI:', firstItemUri)
            return
          }

          const baseUri = firstItemUri.substring(0, patternIndex)
          const afterPattern = firstItemUri.substring(patternIndex + pattern.length)
          const extension = afterPattern

          const groupKey = `${baseUri}||${extension}`

          if (!propertyGroups.has(groupKey)) {
            propertyGroups.set(groupKey, {
              names: [],
              items: [],
              ipfsGroup: { baseUri, extension },
            })
          }

          const group = propertyGroups.get(groupKey)!

          // Track the property index within this group for propertyId
          const propertyIdInGroup = BigInt(group.names.length)
          group.names.push(property.name)

          // Add all items for this property as a flat array
          property.items.forEach((item) => {
            group.items.push({
              propertyId: propertyIdInGroup,
              name: item.name,
              isNewProperty: false, // Items added via migration are not new properties
            })
          })
        })

        // Split groups into smaller chunks to avoid gas limit issues
        // Each chunk contains complete properties (never split a property across chunks)
        const chunks: {
          names: string[]
          items: { propertyId: bigint; name: string; isNewProperty: boolean }[]
          ipfsGroup: { baseUri: string; extension: string }
        }[] = []

        for (const group of propertyGroups.values()) {
          // Count items per property
          const propItemCounts = new Map<number, number>()
          for (const item of group.items) {
            const pid = Number(item.propertyId)
            propItemCounts.set(pid, (propItemCounts.get(pid) || 0) + 1)
          }

          let currentChunk: {
            names: string[]
            items: { propertyId: bigint; name: string; isNewProperty: boolean }[]
          } = { names: [], items: [] }
          let currentChunkItems = 0
          let itemIdx = 0

          for (let pid = 0; pid < group.names.length; pid++) {
            const count = propItemCounts.get(pid) || 0

            if (
              currentChunkItems + count > MAX_ITEMS_PER_CHUNK &&
              currentChunkItems > 0
            ) {
              chunks.push({ ...currentChunk, ipfsGroup: group.ipfsGroup })
              currentChunk = { names: [], items: [] }
              currentChunkItems = 0
            }

            const newPid = currentChunk.names.length
            currentChunk.names.push(group.names[pid])

            for (let j = 0; j < count; j++) {
              const item = group.items[itemIdx]
              currentChunk.items.push({
                propertyId: BigInt(newPid),
                name: item.name,
                isNewProperty: item.isNewProperty,
              })
              currentChunkItems++
              itemIdx++
            }
          }

          if (currentChunk.items.length > 0) {
            chunks.push({ ...currentChunk, ipfsGroup: group.ipfsGroup })
          }
        }

        // Encode each chunk as an addProperties call
        const encodedProperties = chunks.map((chunk) => {
          return encodeFunctionData({
            abi: metadataAbi,
            functionName: 'addProperties',
            args: [chunk.names, chunk.items, chunk.ipfsGroup],
          })
        })

        return encodedProperties
      } catch (err) {
        console.error('[useSetupMetadata] Error fetching metadata:', {
          error: err,
          message: err instanceof Error ? err.message : 'Unknown error',
          metadataAddress,
          chainId,
        })
        throw err
      }
    }
  )

  // State for transaction progress tracking
  // Initialize from persisted values if available
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState(
    persistedProgress?.current || 0
  )
  const [txHashes, setTxHashes] = useState<`0x${string}`[]>(persistedTxHashes || [])
  const [addError, setAddError] = useState<string>()

  const { writeContractAsync, isPending } = useWriteContract()
  const publicClient = usePublicClient({ chainId: targetChainId })

  // Combine fetch error and add error
  const error = fetchError?.message || addError

  const addAllProperties = useCallback(async () => {
    if (!properties || !targetMetadataAddress) return

    if (properties.length === 0) {
      const errorMsg = 'No properties to add'
      console.error('[useSetupMetadata] Validation failed:', errorMsg)
      setAddError(errorMsg)
      return
    }

    setAddError(undefined)
    const hashes: `0x${string}`[] = []

    try {
      for (let i = 0; i < properties.length; i++) {
        setCurrentPropertyIndex(i)
        onProgressUpdate?.(i, properties.length)

        // Decode the encoded data to get the args
        const decoded = decodeFunctionData({
          abi: metadataAbi,
          data: properties[i] as `0x${string}`,
        })

        const hash = await writeContractAsync({
          abi: metadataAbi,
          address: targetMetadataAddress,
          functionName: 'addProperties',
          args: decoded.args as any,
          chainId: targetChainId,
        })

        hashes.push(hash)
        setTxHashes([...hashes])
        onTxHashAdded?.(hash)

        // Wait for transaction receipt before continuing
        if (publicClient) {
          const receipt = await publicClient.waitForTransactionReceipt({ hash })

          if (receipt.status !== 'success') {
            throw new Error(`Transaction failed for property ${i + 1}`)
          }
        }
      }

      setCurrentPropertyIndex(properties.length)
      onProgressUpdate?.(properties.length, properties.length)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add properties'
      console.error('[useSetupMetadata] Error adding properties:', {
        error: err,
        message: errorMsg,
        currentIndex: currentPropertyIndex,
      })
      setAddError(errorMsg)
      throw err
    }
  }, [
    targetMetadataAddress,
    targetChainId,
    properties,
    writeContractAsync,
    publicClient,
    currentPropertyIndex,
    onProgressUpdate,
    onTxHashAdded,
  ])

  return {
    properties: properties || [],
    isLoadingProperties,
    addAllProperties,
    isAddingProperties: isPending,
    progress: {
      current: persistedProgress?.current ?? currentPropertyIndex,
      total: persistedProgress?.total ?? (properties?.length || 0),
    },
    txHashes:
      persistedTxHashes && persistedTxHashes.length > 0 ? persistedTxHashes : txHashes,
    error,
  }
}
