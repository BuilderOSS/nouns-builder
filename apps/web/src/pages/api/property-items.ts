import { getPropertyItems } from '@buildeross/sdk/contract'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'
import { getRedisConnection } from 'src/services/redisConnection'
import { withCors } from 'src/utils/api/cors'
import { isAddress } from 'viem'

// Increase timeout to 60 seconds for DAOs with many properties
export const config = {
  maxDuration: 60,
}

const getPropertyItemsRedisKey = (chainId: number, metadataAddress: string) =>
  `property-items:${chainId}:${metadataAddress.toLowerCase()}`

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { chainId, metadataAddress } = req.query

  if (!chainId || !metadataAddress) {
    return res.status(400).json({ error: 'Missing chainId or metadataAddress parameter' })
  }

  const chainIdNum = parseInt(chainId as string, 10)

  if (!Object.values(CHAIN_ID).includes(chainIdNum)) {
    return res.status(400).json({ error: 'Invalid chainId' })
  }

  if (!isAddress(metadataAddress as string)) {
    return res.status(400).json({ error: 'Invalid metadata address' })
  }

  const metadataAddressLower = (metadataAddress as string).toLowerCase()
  const cacheKey = getPropertyItemsRedisKey(chainIdNum, metadataAddressLower)

  console.log('[property-items API] Fetching properties:', {
    chainId: chainIdNum,
    metadataAddress: metadataAddressLower,
    cacheKey,
  })

  try {
    // Try to get from Redis cache first
    const redisConnection = getRedisConnection()
    const cachedData = await redisConnection?.get(cacheKey)

    if (cachedData) {
      console.log('[property-items API] Cache hit:', {
        chainId: chainIdNum,
        metadataAddress: metadataAddressLower,
      })

      const result = JSON.parse(cachedData)
      return res.status(200).json({ ...result, source: 'cache' })
    }

    console.log('[property-items API] Cache miss, fetching from blockchain:', {
      chainId: chainIdNum,
      metadataAddress: metadataAddressLower,
    })

    // Cache miss - fetch from blockchain
    const result = await getPropertyItems(
      chainIdNum as CHAIN_ID,
      metadataAddressLower as AddressType
    )

    console.log('[property-items API] Blockchain fetch success:', {
      propertiesCount: result.propertiesCount,
      itemsCount: result.propertyItemsCount,
    })

    // Store in Redis cache for 7 days (property data rarely changes)
    // Using 7 days instead of longer to allow for any property updates
    const TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days
    await redisConnection?.setex(cacheKey, TTL_SECONDS, JSON.stringify(result))

    console.log('[property-items API] Cached result for 7 days')

    return res.status(200).json({ ...result, source: 'blockchain' })
  } catch (error) {
    console.error('[property-items API] Error fetching properties:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      chainId: chainIdNum,
      metadataAddress: metadataAddressLower,
    })
    return res.status(500).json({
      error: 'Failed to fetch property items',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export default withCors()(handler)
