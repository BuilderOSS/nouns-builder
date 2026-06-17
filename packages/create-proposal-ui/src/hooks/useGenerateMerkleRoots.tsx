import { SWR_KEYS } from '@buildeross/constants'
import { BASE_URL } from '@buildeross/constants/baseUrl'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { useState } from 'react'
import useSWRImmutable from 'swr/immutable'

import { prepareAttributesMerkleRoot } from '../utils/prepareAttributesMerkleRoot'
import { prepareMemberMerkleRoot } from '../utils/prepareMemberMerkleRoot'

export interface DaoMemberSimplified {
  ownerAlias: AddressType
  owner: AddressType
  tokens: number[]
}

export const useGenerateMerkleRoots = (
  sourceTokenAddress?: AddressType,
  sourceMetadataAddress?: AddressType,
  currentTokenId?: bigint,
  sourceChainId?: CHAIN_ID
) => {
  // Flags to control when SWR should fetch
  const [shouldFetchAttributes, setShouldFetchAttributes] = useState(false)
  const [shouldFetchMembers, setShouldFetchMembers] = useState(false)

  // Fetch attributes with SWR - only when user triggers generation
  const {
    data: attributesResult,
    error: attributesError,
    isLoading: isGeneratingAttributes,
  } = useSWRImmutable(
    shouldFetchAttributes &&
      sourceMetadataAddress &&
      currentTokenId !== undefined &&
      sourceChainId
      ? [
          SWR_KEYS.METADATA_ATTRIBUTES_MERKLE_ROOT,
          sourceMetadataAddress,
          currentTokenId.toString(),
          sourceChainId,
        ]
      : null,
    async ([_key, metadata, tokenId, chainId]) => {
      console.log('[useGenerateMerkleRoots] Fetching attributes with SWR:', {
        metadata,
        tokenId,
        chainId,
      })

      try {
        // Using native fetch instead of axios to avoid timeout issues
        const url = `${BASE_URL}/api/migrate/attributes?metadata=${metadata}&chainId=${chainId}&finalTokenId=${tokenId}`
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(
            `Failed to fetch attributes: ${response.status} ${response.statusText}`
          )
        }

        const data = (await response.json()) as number[][]
        const root = await prepareAttributesMerkleRoot(data)

        console.log('[useGenerateMerkleRoots] Attributes result:', {
          dataLength: data.length,
          root,
        })

        return { data, root }
      } catch (err) {
        console.error('[useGenerateMerkleRoots] Error fetching attributes:', {
          error: err,
          message: err instanceof Error ? err.message : 'Unknown error',
          metadata,
          tokenId,
          chainId,
        })
        throw new Error(
          err instanceof Error
            ? `Failed to fetch attributes: ${err.message}`
            : 'Failed to fetch attributes from API'
        )
      }
    }
  )

  // Fetch members with SWR - only when user triggers generation
  const {
    data: memberResult,
    error: memberError,
    isLoading: isGeneratingMembers,
  } = useSWRImmutable(
    shouldFetchMembers && sourceTokenAddress && sourceChainId
      ? [SWR_KEYS.TOKEN_HOLDERS_MERKLE_ROOT, sourceTokenAddress, sourceChainId]
      : null,
    async ([_key, token, chainId]) => {
      console.log('[useGenerateMerkleRoots] Fetching members with SWR:', {
        token,
        chainId,
      })

      try {
        // Using native fetch instead of axios to avoid timeout issues
        const url = `${BASE_URL}/api/migrate/snapshot?token=${token}&chainId=${chainId}`
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(
            `Failed to fetch member snapshot: ${response.status} ${response.statusText}`
          )
        }

        const snapshot = (await response.json()) as DaoMemberSimplified[]

        // Convert to format expected by prepareMemberMerkleRoot
        const snapshotForMerkle = snapshot.map((member) => ({
          ...member,
          delegate: member.ownerAlias,
          tokenCount: member.tokens.length,
          timeJoined: 0,
        }))

        const root = await prepareMemberMerkleRoot(snapshotForMerkle as any)

        console.log('[useGenerateMerkleRoots] Members result:', {
          snapshotLength: snapshot.length,
          root,
        })

        return { snapshot, root }
      } catch (err) {
        console.error('[useGenerateMerkleRoots] Error fetching members:', {
          error: err,
          message: err instanceof Error ? err.message : 'Unknown error',
          token,
          chainId,
        })
        throw new Error(
          err instanceof Error
            ? `Failed to fetch member snapshot: ${err.message}`
            : 'Failed to fetch member snapshot from API'
        )
      }
    }
  )

  // Trigger functions - set flags to start SWR fetching
  const generateAttributesRoot = async () => {
    if (!sourceMetadataAddress || !currentTokenId || !sourceChainId) {
      throw new Error('Missing required parameters for attributes')
    }

    setShouldFetchAttributes(true)

    // Return a promise that resolves when SWR finishes
    return new Promise<{ data: number[][]; root: `0x${string}` }>((resolve, reject) => {
      // Check if already loaded
      if (attributesResult) {
        resolve(attributesResult)
        return
      }

      // Wait for SWR to load
      const checkInterval = setInterval(() => {
        if (attributesResult) {
          clearInterval(checkInterval)
          resolve(attributesResult)
        } else if (attributesError) {
          clearInterval(checkInterval)
          reject(attributesError)
        }
      }, 100)

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        reject(new Error('Timeout generating attributes'))
      }, 30000)
    })
  }

  const generateMemberRoot = async () => {
    if (!sourceTokenAddress || !sourceChainId) {
      throw new Error('Missing required parameters for members')
    }

    setShouldFetchMembers(true)

    // Return a promise that resolves when SWR finishes
    return new Promise<{ snapshot: DaoMemberSimplified[]; root: `0x${string}` }>(
      (resolve, reject) => {
        // Check if already loaded
        if (memberResult) {
          resolve(memberResult)
          return
        }

        // Wait for SWR to load
        const checkInterval = setInterval(() => {
          if (memberResult) {
            clearInterval(checkInterval)
            resolve(memberResult)
          } else if (memberError) {
            clearInterval(checkInterval)
            reject(memberError)
          }
        }, 100)

        // Timeout after 30 seconds
        setTimeout(() => {
          clearInterval(checkInterval)
          reject(new Error('Timeout generating member root'))
        }, 30000)
      }
    )
  }

  // Combine errors
  const error = attributesError?.message || memberError?.message || undefined

  return {
    // Attributes
    attributesData: attributesResult?.data,
    attributesMerkleRoot: attributesResult?.root,
    generateAttributesRoot,
    isGeneratingAttributes,

    // Members
    memberSnapshot: memberResult?.snapshot,
    memberMerkleRoot: memberResult?.root,
    generateMemberRoot,
    isGeneratingMembers,

    error,
  }
}
