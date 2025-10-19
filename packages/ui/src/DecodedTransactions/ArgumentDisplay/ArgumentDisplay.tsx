import { CHAIN_ID, DecodedArg } from '@buildeross/types'
import { getEscrowBundler, getEscrowBundlerV1 } from '@buildeross/utils/escrow'
import { formatCryptoVal } from '@buildeross/utils/numbers'
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
  allArguments: Record<string, DecodedArg>
}

export const ArgumentDisplay: React.FC<ArgumentDisplayProps> = ({
  chainId,
  arg,
  target,
  functionName,
  allArguments,
}) => {
  if (!arg) return null

  // Check if this is an NFT transfer function
  if (functionName === 'safeTransferFrom') {
    return (
      <NFTArgumentDisplay
        chainId={chainId}
        arg={arg}
        target={target}
        functionName={functionName}
      />
    )
  }

  // Check if this is an ERC20 transfer/approve function
  if (functionName === 'transfer' || functionName === 'approve') {
    return <ERC20ArgumentDisplay chainId={chainId} arg={arg} target={target} />
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
        chainId={chainId}
        arg={arg}
        target={target}
        allArguments={allArguments}
      />
    )
  }

  if (
    functionName === 'send' &&
    arg.name === 'value' &&
    Object.keys(allArguments).length === 1 &&
    typeof arg.value === 'string'
  ) {
    // is a simple send eth

    let value = arg.value
    try {
      value = `${formatCryptoVal(formatEther(BigInt(String(arg.value))))} ETH`
    } catch {}

    return <BaseArgumentDisplay name={arg.name} value={value} />
  }

  // Default rendering for other arguments
  return <BaseArgumentDisplay name={arg.name} value={arg.value} />
}
