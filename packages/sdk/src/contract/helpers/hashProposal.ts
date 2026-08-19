import type { AddressType, BytesType } from '@buildeross/types'
import { encodeAbiParameters, type Hex, keccak256, toBytes } from 'viem'

type HashProposalParams = {
  targets: AddressType[]
  values: bigint[]
  calldatas: BytesType[]
  description: string
  proposer: AddressType
}

export function hashProposal({
  targets,
  values,
  calldatas,
  description,
  proposer,
}: HashProposalParams): Hex {
  const descriptionHash = keccak256(toBytes(description))

  return keccak256(
    encodeAbiParameters(
      [
        { name: 'targets', type: 'address[]' },
        { name: 'values', type: 'uint256[]' },
        { name: 'calldatas', type: 'bytes[]' },
        { name: 'descriptionHash', type: 'bytes32' },
        { name: 'proposer', type: 'address' },
      ],
      [targets, values, calldatas, descriptionHash, proposer]
    )
  )
}
