import { StandardMerkleTree } from '@openzeppelin/merkle-tree'

type TupleOf16Numbers = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
]

export const prepareAttributesMerkleRoot = async (
  attributeForTokens: number[][]
): Promise<`0x${string}`> => {
  const leaves = attributeForTokens.map((attributes, tokenId) => {
    let arr: TupleOf16Numbers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    if (attributes.length > 16) throw new Error('Too many attributes')

    for (let i = 0; i < attributes.length; i++) {
      arr[i] = attributes[i]
    }

    return [BigInt(tokenId), arr]
  })

  const tree = StandardMerkleTree.of(leaves, ['uint256', 'uint16[16]'])
  return tree.root as `0x${string}`
}
