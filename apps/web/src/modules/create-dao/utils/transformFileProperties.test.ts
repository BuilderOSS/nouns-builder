import { describe, expect, it } from 'vitest'

import { IPFSUpload, OrderedTraits } from 'src/hooks'

import { transformFileProperties } from './transformFileProperties'

export const mockTraits = ['backgrounds', 'bodies', 'heads', 'glasses', 'shirt']
export const layerProperties = ['property-one', 'property-two', 'property-three']

export const mockOrderedLayers = (traits: string[]): OrderedTraits => {
  return traits.map((trait) => {
    return { trait: trait, properties: layerProperties }
  })
}

export const mockIpfsUpload = (
  filesUploadCount = 500,
  traits: string[]
): IPFSUpload[] => {
  let upload = []
  for (let i = 0; i < filesUploadCount; i++) {
    const random = (max: any[]) => Math.floor(Math.random() * max.length)
    const randomTrait = traits[random(traits)]

    upload.push(ipfsUploadObject(randomTrait))
  }
  return upload
}

export const ipfsUploadObject = (trait: string): IPFSUpload => {
  return {
    name: 'glasses-square-teal.png',
    content: {} as File,
    blob: 'blob:http://localhost:3000/a184d324-0279-4c32-955a-744e9e324916',
    trait: trait,
    webkitRelativePath: 'nouns/4-glasses/glasses-square-teal.png',
    type: 'image/png',
    ipfs: {
      uri: 'ipfs://bafybeihcsfjvnjmzivm4gxgt75zwajtfxumyxd7j6ibvloykpg4sx47uca/4-glasses/glasses-square-teal.png',
      cid: 'bafybeihcsfjvnjmzivm4gxgt75zwajtfxumyxd7j6ibvloykpg4sx47uca',
    },
  }
}

describe('Transform Properties', () => {
  it('should return an empty array given no parameters', () => {
    const fileProperties = transformFileProperties([], [])

    expect(fileProperties).toEqual([])
  })

  it('should transform a ipfs upload into a properties object', () => {
    const maxFiles = 500
    const trait = mockTraits[0]
    const orderedLayers = mockOrderedLayers([trait])
    const ipfsUpload = ipfsUploadObject(trait)
    const fileProperties = transformFileProperties(orderedLayers, [ipfsUpload], maxFiles)

    expect(fileProperties).toHaveLength(1)
    expect(fileProperties[0].names).toEqual([trait])
    expect(fileProperties[0].items).toHaveLength(1)
    expect(fileProperties[0].items[0]).toEqual({
      propertyId: BigInt(0),
      name: ipfsUpload.name.replace('.png', ''),
      isNewProperty: true,
    })
    expect(fileProperties[0].data).toEqual({
      baseUri: 'ipfs://bafybeihcsfjvnjmzivm4gxgt75zwajtfxumyxd7j6ibvloykpg4sx47uca/',
      extension: '.png',
    })
  })

  it('should place all traits in a single properties array given a fileUploadCount less than the maxFiles', () => {
    const maxFiles = 500
    const orderedLayers = mockOrderedLayers(mockTraits)
    const ipfsUpload = mockIpfsUpload(300, mockTraits)
    const fileProperties = transformFileProperties(orderedLayers, ipfsUpload, maxFiles)

    expect(fileProperties).toHaveLength(1)
    expect(fileProperties[0].names.sort()).toEqual(mockTraits.sort())
    expect(fileProperties[0].items).toHaveLength(300)
  })

  it('should place all traits in a single properties array given a fileUploadCount equal to the maxFiles', () => {
    const maxFiles = 500
    const orderedLayers = mockOrderedLayers(mockTraits)
    const ipfsUpload = mockIpfsUpload(500, mockTraits)
    const fileProperties = transformFileProperties(orderedLayers, ipfsUpload, maxFiles)

    expect(fileProperties).toHaveLength(1)
    expect(fileProperties[0].names.sort()).toEqual(mockTraits.sort())
    expect(fileProperties[0].items).toHaveLength(500)
  })

  describe('should split files across multiple properties arrays given a fileUploadCount greater than maxFiles', () => {
    it('for maxFiles < filedUploadCount < 2*maxFiles', () => {
      const maxFiles = 500
      const orderedLayers = mockOrderedLayers(mockTraits)
      const ipfsUpload = mockIpfsUpload(700, mockTraits)
      const fileProperties = transformFileProperties(orderedLayers, ipfsUpload, maxFiles)

      expect(fileProperties).toHaveLength(2)
      expect(fileProperties[0].items).toHaveLength(500)
      expect(fileProperties[1].items).toHaveLength(200)
    })

    it('for filedUploadCount == 2*maxFiles', () => {
      const maxFiles = 500
      const orderedLayers = mockOrderedLayers(mockTraits)
      const ipfsUpload = mockIpfsUpload(1000, mockTraits)
      const fileProperties = transformFileProperties(orderedLayers, ipfsUpload, maxFiles)

      expect(fileProperties).toHaveLength(2)
      expect(fileProperties[0].items).toHaveLength(500)
      expect(fileProperties[1].items).toHaveLength(500)
    })

    it('for filedUploadCount > 2*maxFiles', () => {
      const maxFiles = 500
      const orderedLayers = mockOrderedLayers(mockTraits)
      const ipfsUpload = mockIpfsUpload(1261, mockTraits)
      const fileProperties = transformFileProperties(orderedLayers, ipfsUpload, maxFiles)

      expect(fileProperties).toHaveLength(3)
      expect(fileProperties[0].items).toHaveLength(500)
      expect(fileProperties[1].items).toHaveLength(500)
      expect(fileProperties[2].items).toHaveLength(261)
    })
  })

  it('should split traits across multiple properties arrays given a fileUploadCount greater than maxFiles', () => {
    const maxFiles = 10
    const trait1 = mockTraits[0]
    const trait2 = mockTraits[1]

    const orderedLayers = mockOrderedLayers([trait1, trait2])
    const trait1IpfsUpload = mockIpfsUpload(12, [trait1])
    const trait2IpfsUpload = mockIpfsUpload(12, [trait2])
    const ipfsUpload = [...trait1IpfsUpload, ...trait2IpfsUpload]

    const fileProperties = transformFileProperties(orderedLayers, ipfsUpload, maxFiles)

    expect(fileProperties).toHaveLength(3)
    expect(fileProperties[0].names).toHaveLength(1)
    expect(fileProperties[0].items).toHaveLength(10)
    for (var item of fileProperties[0].items) {
      expect(item.propertyId).toEqual(BigInt(0))
      expect(item.isNewProperty).toEqual(true)
    }

    expect(fileProperties[1].items).toHaveLength(10)
    expect(fileProperties[1].names).toHaveLength(1)
    for (var item of fileProperties[1].items.slice(0, 2)) {
      expect(item.propertyId).toEqual(BigInt(0)) // 0th element in the total list of names
      expect(item.isNewProperty).toEqual(false)
    }
    for (var item of fileProperties[1].items.slice(2)) {
      expect(item.propertyId).toEqual(BigInt(0)) // 0th element in this transactions list of names
      expect(item.isNewProperty).toEqual(true)
    }

    expect(fileProperties[2].items).toHaveLength(4)
    expect(fileProperties[2].names).toHaveLength(0)
    for (var item of fileProperties[2].items) {
      expect(item.propertyId).toEqual(BigInt(1)) // 1st elemenet in the total list of names
      expect(item.isNewProperty).toEqual(false)
    }
  })
})
