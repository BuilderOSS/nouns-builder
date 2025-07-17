import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { bytesToHexString, fromFarcasterTime } from '@farcaster/hub-nodejs'
import { NextApiRequest, NextApiResponse } from 'next'

import { getDAOfeed } from 'src/data/farcaster/queries/daoDiscussion'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query

  try {
    const feedRes = await getDAOfeed(id as string)

    const { maxAge, swr } = CACHE_TIMES.DAO_FEED
    res.setHeader(
      'Cache-Control',
      `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
    )

    // fromFarcasterTime does not work on the client. Running the function here.
    const updatedValue = feedRes.data.map((cast) => ({
      ...cast,
      unixTime: fromFarcasterTime(cast.data.timestamp)._unsafeUnwrap(),
      hexHash: bytesToHexString(cast.hash)._unsafeUnwrap(),
    }))

    const nextPageToken = feedRes.nextPageToken
      ? bytesToHexString(feedRes.nextPageToken)._unsafeUnwrap()
      : undefined

    res.status(200).json({
      nextPageToken,
      value: updatedValue,
    })
  } catch (error) {
    res.status(500).json({ error: error })
  }
}

export default handler
