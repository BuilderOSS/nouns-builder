import { DaoMember } from '@buildeross/sdk/subgraph'
import { StandardMerkleTree } from '@openzeppelin/merkle-tree'

export const prepareMemberMerkleRoot = async (
  members: DaoMember[]
): Promise<`0x${string}`> => {
  const leaves = members
    .map((member) => member.tokens.map((tokenId) => [member.ownerAlias, BigInt(tokenId)]))
    .flat()

  const tree = StandardMerkleTree.of(leaves, ['address', 'uint256'])
  return tree.root as `0x${string}`
}
