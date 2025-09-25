import { votersRequest } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { collectionId, chainId, page, limit } = req.query

  try {
    if (!collectionId || !chainId) {
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
        parsedPage !== undefined && Number.isFinite(parsedPage) && parsedPage > 0
          ? parsedPage
          : undefined
      const normalizedLimit =
        parsedLimit !== undefined && Number.isFinite(parsedLimit) && parsedLimit > 0
          ? parsedLimit
          : undefined

      const membersList = await votersRequest(
        Number(chainId) as CHAIN_ID,
        (collectionId as string).toLowerCase(),
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

    while (hasMore) {
      const members = await votersRequest(
        Number(chainId) as CHAIN_ID,
        (collectionId as string).toLowerCase(),
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
    res.status(500).json({ error })
  }
}
export default handler
