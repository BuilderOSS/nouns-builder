import { votersRequest } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Set CORS headers to allow any origin
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { collectionId, chainId, page, limit } = req.query

  try {
    const rawChainId = Array.isArray(chainId) ? chainId[0] : chainId
    const parsedChainId = rawChainId !== undefined ? Number(rawChainId) : undefined
    const normalizedChainId: CHAIN_ID | undefined =
      parsedChainId !== undefined && Number.isInteger(parsedChainId) && parsedChainId > 0
        ? (parsedChainId as CHAIN_ID)
        : undefined

    const rawCollectionId = Array.isArray(collectionId) ? collectionId[0] : collectionId

    const collectionAddress: string | undefined = rawCollectionId?.trim().toLowerCase()

    if (!collectionAddress || !normalizedChainId) {
      throw new Error('Invalid query')
    }

    // If pagination parameters are provided, use them
    if (page !== undefined || limit !== undefined) {
      const parsedPage = Array.isArray(page)
        ? Number(page[0])
        : page !== undefined
          ? Number(page)
          : undefined
      const parsedLimit = Array.isArray(limit)
        ? Number(limit[0])
        : limit !== undefined
          ? Number(limit)
          : undefined

      const normalizedPage =
        parsedPage !== undefined && Number.isInteger(parsedPage) && parsedPage > 0
          ? parsedPage
          : undefined
      const normalizedLimit =
        parsedLimit !== undefined && Number.isInteger(parsedLimit) && parsedLimit > 0
          ? parsedLimit
          : undefined

      const membersList = await votersRequest(
        normalizedChainId,
        collectionAddress,
        normalizedPage,
        normalizedLimit
      )
      res.status(200).json({ membersList })
      return
    }

    // If no pagination parameters, fetch all members
    const allMembers = []
    let currentPage = 1
    const batchLimit = 1000
    let hasMore = true
    const MAX_PAGES = 200

    while (hasMore && currentPage <= MAX_PAGES) {
      const members = await votersRequest(
        normalizedChainId,
        collectionAddress,
        currentPage,
        batchLimit
      )

      if (members && members.length > 0) {
        allMembers.push(...members)
        hasMore = members.length === batchLimit
        currentPage++
      } else {
        hasMore = false
      }
    }

    res.status(200).json({ membersList: allMembers })
  } catch (error) {
    res.status(500).json({ error: (error as Error)?.message ?? 'Internal Server Error' })
  }
}
export default handler
