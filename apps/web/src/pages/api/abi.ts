import { ErrorResult } from '@buildeross/types'
import * as Sentry from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { ContractABIResult, getContractABIByAddress } from 'src/services/abiService'
import { InvalidRequestError, NotFoundError } from 'src/services/errors'

const fetchRedis = async (
  req: NextApiRequest,
  res: NextApiResponse<ContractABIResult | ErrorResult>
) => {
  // Set CORS headers to allow any origin
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (
    req.query.address &&
    typeof req.query.address === 'string' &&
    req.query.chainid &&
    typeof req.query.address === 'string'
  ) {
    try {
      const chainId = parseInt(req.query.chainid as string)
      return res
        .status(200)
        .json(await getContractABIByAddress(chainId, req.query.address))
    } catch (error) {
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
  } else {
    return res.status(404).json({ error: 'no address request' })
  }
}

export default fetchRedis
