import { SerializedNftMetadata } from '@buildeross/hooks/useNftMetadata'
import { TokenMetadata } from '@buildeross/hooks/useTokenMetadata'
import { CHAIN_ID, DecodedArg } from '@buildeross/types'
import {
  DecodedEscrowData,
  getEscrowBundler,
  getEscrowBundlerV1,
} from '@buildeross/utils/escrow'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Flex, Text } from '@buildeross/zord'
import React from 'react'
import { formatEther } from 'viem'

import { BaseArgumentDisplay } from './BaseArgumentDisplay'
import { ERC20ArgumentDisplay } from './ERC20ArgumentDisplay'
import { EscrowArgumentDisplay } from './EscrowArgumentDisplay'
import { NFTArgumentDisplay } from './NFTArgumentDisplay'

const toLower = (str: string) => str.toLowerCase()

interface ArgumentDisplayProps {
  chainId: CHAIN_ID
  arg: DecodedArg
  target: string
  functionName: string
  tokenMetadata?: TokenMetadata
  nftMetadata?: SerializedNftMetadata | null
  escrowData?: DecodedEscrowData | null
}

export const ArgumentDisplay: React.FC<ArgumentDisplayProps> = ({
  chainId,
  arg,
  target,
  functionName,
  tokenMetadata,
  nftMetadata,
  escrowData,
}) => {
  if (!arg) return null

  // Check if this is an NFT transfer function
  if (functionName === 'safeTransferFrom') {
    return (
      <NFTArgumentDisplay
        arg={arg}
        target={target}
        functionName={functionName}
        nftMetadata={nftMetadata}
      />
    )
  }

  // Check if this is an ERC20 transfer/approve function
  if (functionName === 'transfer' || functionName === 'approve') {
    return <ERC20ArgumentDisplay arg={arg} tokenMetadata={tokenMetadata} />
  }

  // Check if this is an escrow argument
  const isEscrowTarget =
    toLower(target) === toLower(getEscrowBundler(chainId)) ||
    toLower(target) === toLower(getEscrowBundlerV1(chainId))

  const isEscrowArgument =
    isEscrowTarget &&
    (arg.name === '_escrowData' ||
      arg.name === '_milestoneAmounts' ||
      arg.name === '_fundAmount' ||
      arg.name === '_escrowType')

  if (isEscrowArgument) {
    return (
      <EscrowArgumentDisplay
        arg={arg}
        tokenMetadata={tokenMetadata}
        escrowData={escrowData}
      />
    )
  }

  if (
    functionName === 'send' &&
    arg.name === 'value' &&
    arg.type === 'uint256' &&
    typeof arg.value === 'string'
  ) {
    // is a simple send eth

    let value = arg.value
    try {
      value = `${formatCryptoVal(formatEther(BigInt(String(arg.value))))} ETH`
    } catch {}

    return (
      <Flex align="flex-start" w="100%">
        <Text pr="x1" style={{ flexShrink: 0 }}>
          {arg.name}:
        </Text>
        <Flex align="center" gap="x1">
          <img
            src="/chains/ethereum.svg"
            alt="ETH"
            loading="lazy"
            decoding="async"
            width="16px"
            height="16px"
            style={{ maxWidth: '16px', maxHeight: '16px', objectFit: 'contain' }}
          />
          <Text>{value}</Text>
        </Flex>
      </Flex>
    )
  }

  // Default rendering for other arguments
  return <BaseArgumentDisplay name={arg.name} value={arg.value} />
}
