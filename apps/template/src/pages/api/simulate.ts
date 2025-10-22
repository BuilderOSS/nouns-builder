import { ErrorResult, SimulationResult } from '@buildeross/types'
import type { NextApiRequest, NextApiResponse } from 'next'
import { InvalidRequestError } from 'src/services/errors'
import { simulate } from 'src/services/simulationService'

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SimulationResult | ErrorResult>
) {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Only POST requests allowed' })
  }

  try {
    const result = await simulate(req.body)
    return res.status(200).json(result)
  } catch (error) {
    console.error(error)

    if (error instanceof InvalidRequestError) {
      return res.status(400).json({ error: error.message })
    }
    if ((error as Error).message.includes('insufficient funds for')) {
      return res.status(400).json({
        error:
          'Insufficient treasury funds to carry out some or all of these transactions',
      })
    }
    return res
      .status(500)
      .json({ error: 'Unexpected Error: Unable to simulate these transactions' })
  }
}

export default handler
