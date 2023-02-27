import { BigNumber } from 'ethers'
import { describe, expect, it } from 'vitest'

import { transformFileProperties } from './index'
import { ipfsUploadObject, mockIpfsUpload, mockOrderedLayers, mockTraits } from './mock'

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
      propertyId: BigNumber.from(0),
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
      expect(item.propertyId).toEqual(BigNumber.from(0))
      expect(item.isNewProperty).toEqual(true)
    }

    expect(fileProperties[1].items).toHaveLength(10)
    expect(fileProperties[1].names).toHaveLength(1)
    for (var item of fileProperties[1].items.slice(0, 2)) {
      expect(item.propertyId).toEqual(BigNumber.from(0)) // 0th element in the total list of names
      expect(item.isNewProperty).toEqual(false)
    }
    for (var item of fileProperties[1].items.slice(2)) {
      expect(item.propertyId).toEqual(BigNumber.from(0)) // 0th element in this transactions list of names
      expect(item.isNewProperty).toEqual(true)
    }

    expect(fileProperties[2].items).toHaveLength(4)
    expect(fileProperties[2].names).toHaveLength(0)
    for (var item of fileProperties[2].items) {
      expect(item.propertyId).toEqual(BigNumber.from(1)) // 1st elemenet in the total list of names
      expect(item.isNewProperty).toEqual(false)
    }
  })
})
