import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { CHAIN_ID } from '@buildeross/types'
import * as Sentry from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { decodeTransaction } from 'src/services/abiService'
import { InvalidRequestError, NotFoundError } from 'src/services/errors'
import { isHex } from 'viem'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { contract, calldata, chain } = req.body

  if (!contract) return res.status(404).json({ error: 'no address request' })
  if (!calldata) return res.status(404).json({ error: 'no calldata request' })
  if (!chain) return res.status(404).json({ error: 'no chain request' })

  if (!isHex(calldata, { strict: true }))
    return res.status(400).json({ error: 'bad calldata input' })

  const chainInt = parseInt(chain)

  try {
    const data = await decodeTransaction(chainInt as CHAIN_ID, contract, calldata)

    const { maxAge, swr } = CACHE_TIMES.DECODE

    res.setHeader(
      'Cache-Control',
      `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
    )

    res.status(200).json(data)
  } catch (error) {
    console.error(error)

    if (error instanceof NotFoundError) {
      return res.status(404).json({ error: 'abi not found' })
    }
    if (error instanceof InvalidRequestError) {
      return res.status(400).json({ error: 'bad address input ' })
    }

    Sentry.captureException(error)
    await Sentry.flush(2000)

    return res.status(500).json({ error: 'backend failed' })
  }
}
