import { normalizeIPFSUrl } from '@buildeross/ipfs-service'
import type { ImageProps, IPFSUpload, OrderedTraits, Property } from '@buildeross/types'

export type PropertyItem = {
  propertyId: bigint
  name: string
  isNewProperty: boolean
}

export type IPFSGroup = {
  baseUri: string
  extension: string
}

export type Properties = {
  names: string[]
  items: PropertyItem[]
  data: IPFSGroup
}

function uploadsToPropertyItems(
  uploads: IPFSUpload[],
  traitIndex: number,
  isNewProperty: boolean
): PropertyItem[] {
  return uploads.map((upload) => {
    return {
      propertyId: BigInt(traitIndex),
      name: upload.name.substring(0, upload.name.lastIndexOf('.')),
      isNewProperty,
    }
  })
}

export const transformPropertiesToOrderedTraits = (
  properties: Property[]
): OrderedTraits => {
  return properties
    .map((property) => ({
      trait: property.name,
      properties: property.items.map((item) => item.name),
    }))
    .reverse() // reversed to display order (newest-first); transformFileProperties re-reverses to contract order
}

export function transformPropertiesToImageProps(properties: Property[]): ImageProps[] {
  const imageProps: ImageProps[] = []

  for (const property of properties) {
    for (const item of property.items) {
      const match = item.uri.match(/^ipfs:\/\/([^/]+)\/.+$/)
      if (!match || !match[1]) {
        console.error(`Invalid IPFS URI format: ${item.uri}`)
        continue
      }

      const nameParts = item.uri.split('/')
      const name = nameParts[nameParts.length - 1]
      if (!name) {
        console.error(`Unable to extract name from URI: ${item.uri}`)
        continue
      }

      imageProps.push({
        name,
        trait: property.name,
        uri: item.uri,
      })
    }
  }

  return imageProps
}

export function transformFileProperties(
  orderedLayers: OrderedTraits,
  ipfsUpload: IPFSUpload[],
  maxFilesPerTransaction = 500,
  existingTraits: string[] = []
): Properties[] {
  if (!orderedLayers.length || !ipfsUpload.length) {
    return []
  }

  const traits = orderedLayers.map((name) => name.trait).reverse() // this reverse is import for order sent to contract
  const newTraits = traits.filter((trait) => !existingTraits.includes(trait))

  const uploadsByTrait: { trait: string; uploads: IPFSUpload[] }[] = traits.map(
    (trait) => {
      return {
        trait,
        uploads: ipfsUpload.filter((item: IPFSUpload) => item.trait === trait),
      }
    }
  )

  const upload = ipfsUpload[0]
  const data = {
    baseUri: (normalizeIPFSUrl(upload?.ipfs?.cid) as string) + '/',
    extension: `${upload?.type
      ?.replace('image/', '.')
      .replace('+xml', '')
      .toLowerCase()}`,
  }

  const transactions: Properties[] = []
  let currentTransaction: Properties | undefined = { names: [], items: [], data }
  for (var { trait, uploads } of uploadsByTrait) {
    const isNewTrait = newTraits.includes(trait)

    let availableSpaceInCurrentTransaction =
      maxFilesPerTransaction - currentTransaction.items.length

    // Check if the whole trait can fit within the current transaction
    if (uploads.length <= availableSpaceInCurrentTransaction) {
      const propertyId = isNewTrait
        ? currentTransaction.names.length
        : traits.indexOf(trait)

      currentTransaction.items = [
        ...currentTransaction.items,
        ...uploadsToPropertyItems(uploads, propertyId, isNewTrait),
      ]

      if (isNewTrait) {
        currentTransaction.names = [...currentTransaction.names, trait]
      }
    } else {
      // We need to split the trait up across multiple transactions
      let remainingUploads = [...uploads]
      let isNewProperty = isNewTrait

      while (remainingUploads.length > 0) {
        // If isNewProperty = false, we index based on the whole list of properties
        const traitIndex = isNewProperty
          ? currentTransaction.names.length
          : traits.indexOf(trait)

        if (remainingUploads.length >= availableSpaceInCurrentTransaction) {
          const uploadsForCurrentTransaction = remainingUploads.slice(
            0,
            availableSpaceInCurrentTransaction
          )

          currentTransaction.items = [
            ...currentTransaction.items,
            ...uploadsToPropertyItems(
              uploadsForCurrentTransaction,
              traitIndex,
              isNewProperty
            ),
          ]

          // Only add trait to list of names if isNewProperty is true
          if (isNewProperty) {
            currentTransaction.names = [...currentTransaction.names, trait]
          }

          // Add currentTransaction to transactions
          transactions.push(currentTransaction)
          currentTransaction = { names: [], items: [], data }

          // Set isNewProperty to false
          isNewProperty = false

          // update remainingUploads and availableSpaceInCurrentTransaction
          remainingUploads = remainingUploads.slice(availableSpaceInCurrentTransaction)
          availableSpaceInCurrentTransaction = maxFilesPerTransaction
        } else {
          // remaining uploads will fit in current transaction
          currentTransaction.items = [
            ...currentTransaction.items,
            ...uploadsToPropertyItems(remainingUploads, traitIndex, isNewProperty),
          ]

          remainingUploads = []
        }
      }
    }

    // catch the case in which we have exactly 500 uploads in the current transaction
    if (currentTransaction.items.length === maxFilesPerTransaction) {
      transactions.push(currentTransaction)
      currentTransaction = { names: [], items: [], data }
    }
  }

  if (currentTransaction.items.length > 0) {
    transactions.push(currentTransaction)
  }

  return transactions
}
