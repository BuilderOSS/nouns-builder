import { DecodedArg } from '@buildeross/types'
import { toLower } from 'lodash'
import React from 'react'
import {
  getEscrowBundler,
  getEscrowBundlerV1,
} from 'src/modules/create-proposal/components/TransactionForm/Escrow/EscrowUtils'
import { useChainStore } from 'src/stores/useChainStore'

import { DecodedValueRenderer } from './DecodedValueRenderer'
import { ERC20ArgumentDisplay } from './ERC20ArgumentDisplay'
import { EscrowArgumentDisplay } from './EscrowArgumentDisplay'
import { NFTArgumentDisplay } from './NFTArgumentDisplay'

interface ArgumentDisplayProps {
  arg: DecodedArg
  target: string
  functionName?: string
}

export const ArgumentDisplay: React.FC<ArgumentDisplayProps> = ({
  arg,
  target,
  functionName,
}) => {
  const chain = useChainStore((x) => x.chain)

  if (!arg) return null

  // Check if this is an NFT transfer function
  if (functionName === 'safeTransferFrom') {
    return <NFTArgumentDisplay arg={arg} target={target} functionName={functionName} />
  }

  // Check if this is an ERC20 transfer function
  if (functionName === 'transfer') {
    return <ERC20ArgumentDisplay arg={arg} target={target} />
  }

  // Check if this is an escrow argument
  const isEscrowTarget =
    toLower(target) === toLower(getEscrowBundler(chain.id)) ||
    toLower(target) === toLower(getEscrowBundlerV1(chain.id))

  const isEscrowArgument =
    isEscrowTarget &&
    (arg.name === '_escrowData' ||
      arg.name === '_milestoneAmounts' ||
      arg.name === '_fundAmount' ||
      arg.name === '_escrowType')

  if (isEscrowArgument) {
    return <EscrowArgumentDisplay arg={arg} target={target} />
  }

  // Default rendering for other arguments
  return <DecodedValueRenderer name={arg.name} value={arg.value} />
}
