import { AddressType, CHAIN_ID } from '@buildeross/types'
import { getCachedIsContract } from '@buildeross/utils'
import { NextApiRequest, NextApiResponse } from 'next'
import { getCachedTokenMetadatas } from 'src/services/alchemyService'
import { withCors } from 'src/utils/api/cors'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { chainId, addresses } = req.query

  if (!chainId || !addresses) {
    return res.status(400).json({ error: 'Missing chainId or addresses parameter' })
  }

  const chainIdNum = parseInt(chainId as string, 10)

  if (!Object.values(CHAIN_ID).includes(chainIdNum)) {
    return res.status(400).json({ error: 'Invalid chainId' })
  }

  // Parse addresses - can be a single address or comma-separated list
  const addressList = Array.isArray(addresses)
    ? addresses
    : (addresses as string).split(',').map((addr) => addr.trim())

  let isContractList: boolean[]

  try {
    isContractList = await Promise.all(
      addressList.map((addr) =>
        getCachedIsContract(chainIdNum as CHAIN_ID, addr as AddressType)
      )
    )
  } catch (error) {
    console.error('Contract check API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }

  const isAnyNotContract = isContractList.some((isContract) => !isContract)

  if (isAnyNotContract) {
    return res.status(400).json({ error: 'Invalid address or not a contract' })
  }

  try {
    const result = await getCachedTokenMetadatas(
      chainIdNum as CHAIN_ID,
      addressList as AddressType[]
    )

    // Handle null result (unsupported chain or missing API key)
    if (!result) {
      return res.status(200).json({
        data: [],
        source: 'fetched',
      })
    }

    // Data is already sanitized by the service
    return res.status(200).json({
      data: result.data,
      source: result.source,
    })
  } catch (error) {
    console.error('Token metadata API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors(['GET'])(handler)
