import { IPFSUpload, OrderedTraits } from '@buildeross/types'
import { describe, expect, it } from 'vitest'

import { Properties, transformFileProperties } from './transformFileProperties'

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

  describe('mixed PNG + GIF uploads', () => {
    const CID = 'bafybeihcsfjvnjmzivm4gxgt75zwajtfxumyxd7j6ibvloykpg4sx47uca'

    const upload = (trait: string, name: string, type: string): IPFSUpload => ({
      name,
      content: {} as File,
      trait,
      webkitRelativePath: `nouns/${trait}/${name}`,
      type,
      ipfs: { uri: `ipfs://${CID}/${trait}/${name}`, cid: CID },
    })

    /**
     * Replays transactions through the MetadataRenderer._addProperties semantics and
     * returns the resulting on-chain state: property names in order, each with the
     * rendered file names of its items.
     */
    const simulateContract = (
      transactions: Properties[],
      existing: { name: string; items: string[] }[] = []
    ) => {
      const props = existing.map((p) => ({ name: p.name, items: [...p.items] }))
      for (const tx of transactions) {
        const stored = props.length
        tx.names.forEach((name) => props.push({ name, items: [] }))
        for (const item of tx.items) {
          const id = Number(item.propertyId) + (item.isNewProperty ? stored : 0)
          if (id >= props.length) throw new Error(`INVALID_PROPERTY_SELECTED(${id})`)
          props[id].items.push(
            `${tx.data.baseUri}${props[id].name}/${item.name}${tx.data.extension}`
          )
        }
        props.forEach((p) => {
          if (p.items.length === 0) throw new Error(`PROPERTY_HAS_NO_ITEMS(${p.name})`)
        })
      }
      return props
    }

    const expectedUri = (u: IPFSUpload) => `ipfs://${CID}/${u.trait}/${u.name}`

    it('creates new traits in layer order even when they start with different types', () => {
      // orderedLayers are display order (top first); contract order is reversed
      const orderedLayers = mockOrderedLayers(['hats', 'heads', 'bodies', 'background'])
      const uploads = [
        upload('background', 'blue.png', 'image/png'),
        upload('bodies', 'wave.gif', 'image/gif'),
        upload('bodies', 'still.png', 'image/png'),
        upload('heads', 'cat.png', 'image/png'),
        upload('hats', 'spin.gif', 'image/gif'),
        upload('hats', 'cap.gif', 'image/gif'),
      ]

      const txs = transformFileProperties(orderedLayers, uploads, 500)
      txs.forEach((tx) => expect(['.png', '.gif']).toContain(tx.data.extension))

      const state = simulateContract(txs)
      expect(state.map((p) => p.name)).toEqual(['background', 'bodies', 'heads', 'hats'])
      for (const u of uploads) {
        expect(state.find((p) => p.name === u.trait)!.items).toContain(expectedUri(u))
      }
      expect(state.reduce((n, p) => n + p.items.length, 0)).toBe(uploads.length)
    })

    it('adds GIF variants to existing PNG traits and a new GIF trait', () => {
      const existing = [
        { name: 'background', items: ['x'] },
        { name: 'bodies', items: ['y'] },
      ]
      const orderedLayers = mockOrderedLayers(['sparkles', 'bodies', 'background'])
      const uploads = [
        upload('bodies', 'dance.gif', 'image/gif'),
        upload('bodies', 'plain.png', 'image/png'),
        upload('sparkles', 'twinkle.gif', 'image/gif'),
      ]

      const txs = transformFileProperties(orderedLayers, uploads, 500, [
        'background',
        'bodies',
      ])
      expect(txs).toHaveLength(2)
      expect(new Set(txs.map((t) => t.data.extension))).toEqual(new Set(['.gif', '.png']))

      const state = simulateContract(txs, existing)
      expect(state.map((p) => p.name)).toEqual(['background', 'bodies', 'sparkles'])
      expect(state[1].items).toEqual(
        expect.arrayContaining([expectedUri(uploads[0]), expectedUri(uploads[1])])
      )
      expect(state[2].items).toEqual([expectedUri(uploads[2])])
    })

    it('still splits mixed uploads across transactions of at most maxFiles items', () => {
      const traits = ['a', 'b', 'c']
      const orderedLayers = mockOrderedLayers([...traits].reverse())
      const uploads = traits.flatMap((trait, t) =>
        Array.from({ length: 9 }, (_, i) =>
          upload(
            trait,
            `v${i}.${(i + t) % 2 ? 'gif' : 'png'}`,
            (i + t) % 2 ? 'image/gif' : 'image/png'
          )
        )
      )

      const txs = transformFileProperties(orderedLayers, uploads, 5)
      txs.forEach((tx) => expect(tx.items.length).toBeLessThanOrEqual(5))

      const state = simulateContract(txs)
      expect(state.map((p) => p.name)).toEqual(traits)
      for (const u of uploads) {
        expect(state.find((p) => p.name === u.trait)!.items).toContain(expectedUri(u))
      }
      expect(state.reduce((n, p) => n + p.items.length, 0)).toBe(uploads.length)
    })

    it('keeps a single transaction for GIF-only uploads', () => {
      const orderedLayers = mockOrderedLayers(['heads', 'background'])
      const uploads = [
        upload('background', 'a.gif', 'image/gif'),
        upload('heads', 'b.gif', 'image/gif'),
      ]
      const txs = transformFileProperties(orderedLayers, uploads, 500)
      expect(txs).toHaveLength(1)
      expect(txs[0].data.extension).toBe('.gif')
    })
  })
})
