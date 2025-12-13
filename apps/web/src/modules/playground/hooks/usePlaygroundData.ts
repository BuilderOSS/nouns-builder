import { getFetchableUrls } from '@buildeross/ipfs-service/gateway'
import type { CHAIN_ID, ImageProps, OrderedTraits } from '@buildeross/types'
import useSWR from 'swr'

interface Property {
  name: string
  items: {
    name: string
    uri: string
  }[]
}

interface PropertyItemsResponse {
  images: ImageProps[]
  orderedLayers: OrderedTraits
  propertiesCount: number
  propertyItemsCount: number[]
  properties: Property[]
}

interface UsePlaygroundDataParams {
  chainId?: CHAIN_ID
  metadataAddress?: string
}

interface UsePlaygroundDataReturn {
  images?: ImageProps[]
  orderedLayers?: OrderedTraits
  propertiesCount?: number
  propertyItemsCount?: number[]
  properties?: Property[]
  isLoading: boolean
  error: Error | null
}

const transformToImageProps = (properties: Property[]): ImageProps[] => {
  return properties.flatMap((property) =>
    property.items.map((item) => {
      return {
        name: item.name,
        trait: property.name,
        uri: item.uri,
        url: getFetchableUrls(item.uri)?.[0] ?? item.uri,
      }
    })
  )
}

const transformToOrderedTraits = (properties: Property[]): OrderedTraits => {
  return properties
    .map((property) => ({
      trait: property.name,
      properties: property.items.map((item) => item.name),
    }))
    .reverse()
}

const fetcher = async (url: string): Promise<PropertyItemsResponse> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to fetch property items')
  }
  const data = await res.json()

  return {
    ...data,
    images: transformToImageProps(data.properties),
    orderedLayers: transformToOrderedTraits(data.properties),
  }
}

export const usePlaygroundData = ({
  chainId,
  metadataAddress,
}: UsePlaygroundDataParams): UsePlaygroundDataReturn => {
  const shouldFetch = chainId && metadataAddress
  const { data, error, isLoading } = useSWR<PropertyItemsResponse>(
    shouldFetch
      ? `/api/property-items?chainId=${chainId}&metadataAddress=${metadataAddress}`
      : null,
    fetcher
  )

  return {
    ...data,
    isLoading,
    error: error || null,
  }
}
