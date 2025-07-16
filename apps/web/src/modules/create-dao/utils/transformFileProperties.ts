import { normalizeIPFSUrl } from '@buildeross/ipfs-service'

import { IPFSUpload } from 'src/hooks'

import { OrderedTraits } from '../../../components/Artwork/LayerBox'

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

export function transformFileProperties(
  orderedLayers: OrderedTraits,
  ipfsUpload: IPFSUpload[],
  maxFilesPerTransaction = 500
): Properties[] {
  if (!orderedLayers.length || !ipfsUpload.length) {
    return []
  }

  const traits = orderedLayers.map((name) => name.trait).reverse() // this reverse is import for order sent to contract

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
    let availableSpaceInCurrentTransaction =
      maxFilesPerTransaction - currentTransaction.items.length

    // Check if the whole trait can fit within the current transaction
    if (uploads.length <= availableSpaceInCurrentTransaction) {
      currentTransaction.items = [
        ...currentTransaction.items,
        ...uploadsToPropertyItems(uploads, currentTransaction.names.length, true),
      ]

      currentTransaction.names = [...currentTransaction.names, trait]
    } else {
      // We need to split the trait up across multiple transactions
      let remainingUploads = [...uploads]
      let isNewProperty = true

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
