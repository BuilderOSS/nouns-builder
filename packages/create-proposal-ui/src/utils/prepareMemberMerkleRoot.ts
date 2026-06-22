import { DaoMember } from '@buildeross/sdk/subgraph'
import { StandardMerkleTree } from '@openzeppelin/merkle-tree'

export const prepareMemberMerkleRoot = async (
  members: DaoMember[]
): Promise<`0x${string}`> => {
  // Use 'owner' (original L1 address) since we're minting directly on L2
  // The ownerAlias is only needed for L1->L2 bridge messages, not for direct L2 minting
  const leaves = members
    .map((member) => member.tokens.map((tokenId) => [member.owner, BigInt(tokenId)]))
    .flat()

  const tree = StandardMerkleTree.of(leaves, ['address', 'uint256'])
  return tree.root as `0x${string}`
}
