import { createTree } from 'lanyard'
import { encodeAbiParameters } from 'viem'

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
  const leaves = attributeForTokens
    .map((attributes, tokenId) => {
      let arr: TupleOf16Numbers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

      if (attributes.length > 16) throw new Error('Too many attributes')

      for (let i = 0; i < attributes.length; i++) {
        arr[i] = attributes[i]
      }

      return encodeAbiParameters(
        [
          { name: 'tokenId', type: 'uint256' },
          { name: 'attributes', type: 'uint16[16]' },
        ],
        [BigInt(tokenId), arr]
      )
    })
    .flat()

  return await createTree({
    unhashedLeaves: leaves,
  }).then((x) => x.merkleRoot as `0x${string}`)
}
