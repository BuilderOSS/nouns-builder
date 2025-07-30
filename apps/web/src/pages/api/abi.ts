import * as Sentry from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { ContractABIResult, getContractABIByAddress } from 'src/services/abiService'
import { ErrorResult } from 'src/services/errorResult'
import { InvalidRequestError, NotFoundError } from 'src/services/errors'

const fetchRedis = async (
  req: NextApiRequest,
  res: NextApiResponse<ContractABIResult | ErrorResult>
) => {
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
