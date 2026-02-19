import type { CHAIN_ID, ImageProps, OrderedTraits, Property } from '@buildeross/types'
import {
  transformPropertiesToImageProps,
  transformPropertiesToOrderedTraits,
} from '@buildeross/utils'
import useSWR from 'swr'

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

const fetcher = async (url: string): Promise<PropertyItemsResponse> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to fetch property items')
  }
  const data = await res.json()

  return {
    ...data,
    images: transformPropertiesToImageProps(data.properties),
    orderedLayers: transformPropertiesToOrderedTraits(data.properties),
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
