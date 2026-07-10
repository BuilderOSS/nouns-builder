import { MerkleTree } from 'merkletreejs'
import { encodePacked, keccak256 } from 'viem'

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
  // Create leaves using the same encoding as the contract: keccak256(abi.encodePacked(tokenId, uint16[16]))
  const leaves = attributeForTokens
    .map((attributes, tokenId) => {
      let arr: TupleOf16Numbers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

      if (attributes.length > 16) throw new Error('Too many attributes')

      for (let i = 0; i < attributes.length; i++) {
        arr[i] = attributes[i]
      }

      // Use encodePacked with array to match Solidity's abi.encodePacked(uint256, uint16[16])
      const packed = encodePacked(['uint256', 'uint16[16]'], [BigInt(tokenId), arr])

      return keccak256(packed)
    })
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)) // Sort for deterministic tree

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
  const rootBuffer = tree.getRoot()
  const rootHex = Buffer.from(rootBuffer).toString('hex')
  return rootHex.startsWith('0x')
    ? (rootHex as `0x${string}`)
    : (`0x${rootHex}` as `0x${string}`)
}
