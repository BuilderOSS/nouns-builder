import { ErrorResult } from '@buildeross/types'
import * as Sentry from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { ContractABIResult, getContractABIByAddress } from 'src/services/abiService'
import { InvalidRequestError, NotFoundError } from 'src/services/errors'
import { withCors } from 'src/utils/cors'

const fetchRedis = async (
  req: NextApiRequest,
  res: NextApiResponse<ContractABIResult | ErrorResult>
) => {
  if (!req.query.address || typeof req.query.address !== 'string') {
    return res.status(400).json({ error: 'address is required' })
  }
  if (!req.query.chainid || typeof req.query.chainid !== 'string') {
    return res.status(400).json({ error: 'chainid is required' })
  }

  try {
    const chainId = parseInt(req.query.chainid as string)
    const abi = await getContractABIByAddress(chainId, req.query.address)
    return res.status(200).json(abi)
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
}

export default withCors(['GET'])(fetchRedis)
