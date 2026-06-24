import { DaoMember } from '@buildeross/sdk/subgraph'
import { MerkleTree } from 'merkletreejs'
import { encodeAbiParameters, keccak256, parseAbiParameters } from 'viem'

export const prepareMemberMerkleRoot = async (
  members: DaoMember[]
): Promise<`0x${string}`> => {
  // Use 'owner' (original L1 address) since we're minting directly on L2
  // The ownerAlias is only needed for L1->L2 bridge messages, not for direct L2 minting

  // Create leaves using the same encoding as the contract: keccak256(abi.encode(address, uint256))
  const leaves = members
    .flatMap((member) =>
      member.tokens.map((tokenId) => {
        const encoded = encodeAbiParameters(parseAbiParameters('address, uint256'), [
          member.owner as `0x${string}`,
          BigInt(tokenId),
        ])
        return keccak256(encoded)
      })
    )
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)) // Sort for deterministic tree

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
  const rootBuffer = tree.getRoot()
  const rootHex = Buffer.from(rootBuffer).toString('hex')
  return rootHex.startsWith('0x')
    ? (rootHex as `0x${string}`)
    : (`0x${rootHex}` as `0x${string}`)
}
