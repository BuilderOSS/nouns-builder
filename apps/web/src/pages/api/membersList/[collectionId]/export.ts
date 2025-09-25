import { votersRequest } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { collectionId, chainId } = req.query

  try {
    if (!collectionId || !chainId) {
      throw new Error('Invalid query')
    }

    const allMembers = []
    let page = 1
    const limit = 1000
    let hasMore = true
    const MAX_PAGES = 200

    while (hasMore && page <= MAX_PAGES) {
      const members = await votersRequest(
        Number(chainId) as CHAIN_ID,
        (collectionId as string).toLowerCase(),
        page,
        limit
      )

      if (members && members.length > 0) {
        allMembers.push(...members)
        // If we got fewer than the limit, we've reached the end
        hasMore = members.length === limit
        page++
      } else {
        hasMore = false
      }
    }

    if (allMembers.length === 0) {
      res.status(404).json({ error: 'No delegates found' })
      return
    }

    // Format data for CSV export
    const csvData = allMembers.map((member) => ({
      address: member.voter,
      tokenCount: member.tokenCount,
      tokenIds: member.tokens.join(';'),
      dateJoined: new Date(member.timeJoined * 1000).toISOString().split('T')[0],
    }))

    res.status(200).json({ delegates: csvData })
  } catch (error) {
    console.error('Export API error:', error)
    res.status(500).json({ error: 'Failed to export delegates data' })
  }
}

export default handler
