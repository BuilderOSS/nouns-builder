import { BASE_URL } from '@buildeross/constants/baseUrl'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import axios from 'axios'
import { useState } from 'react'

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
  const [attributesData, setAttributesData] = useState<number[][]>()
  const [attributesMerkleRoot, setAttributesMerkleRoot] = useState<`0x${string}`>()
  const [isGeneratingAttributes, setIsGeneratingAttributes] = useState(false)

  const [memberSnapshot, setMemberSnapshot] = useState<DaoMemberSimplified[]>()
  const [memberMerkleRoot, setMemberMerkleRoot] = useState<`0x${string}`>()
  const [isGeneratingMembers, setIsGeneratingMembers] = useState(false)

  const [error, setError] = useState<string>()

  const generateAttributesRoot = async () => {
    if (!sourceMetadataAddress || !currentTokenId || !sourceChainId) {
      setError('Missing required parameters for attributes')
      return
    }

    setIsGeneratingAttributes(true)
    setError(undefined)

    try {
      const response = await axios.get<number[][]>(
        `${BASE_URL}/api/migrate/attributes?metadata=${sourceMetadataAddress}&chainId=${sourceChainId}&finalTokenId=${currentTokenId}`
      )

      const data = response.data
      setAttributesData(data)

      const root = await prepareAttributesMerkleRoot(data)
      setAttributesMerkleRoot(root)

      return { data, root }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate attributes root'
      setError(message)
      throw new Error(message)
    } finally {
      setIsGeneratingAttributes(false)
    }
  }

  const generateMemberRoot = async () => {
    if (!sourceTokenAddress || !sourceChainId) {
      setError('Missing required parameters for members')
      return
    }

    setIsGeneratingMembers(true)
    setError(undefined)

    try {
      const response = await axios.get<DaoMemberSimplified[]>(
        `${BASE_URL}/api/migrate/snapshot?token=${sourceTokenAddress}&chainId=${sourceChainId}`
      )

      const snapshot = response.data
      setMemberSnapshot(snapshot)

      // Convert to format expected by prepareMemberMerkleRoot
      const snapshotForMerkle = snapshot.map((member) => ({
        ...member,
        delegate: member.ownerAlias,
        tokenCount: member.tokens.length,
        timeJoined: 0,
      }))

      const root = await prepareMemberMerkleRoot(snapshotForMerkle as any)
      setMemberMerkleRoot(root)

      return { snapshot, root }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate member root'
      setError(message)
      throw new Error(message)
    } finally {
      setIsGeneratingMembers(false)
    }
  }

  return {
    // Attributes
    attributesData,
    attributesMerkleRoot,
    generateAttributesRoot,
    isGeneratingAttributes,

    // Members
    memberSnapshot,
    memberMerkleRoot,
    generateMemberRoot,
    isGeneratingMembers,

    error,
  }
}
