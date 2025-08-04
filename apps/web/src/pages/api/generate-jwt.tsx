import type { NextApiRequest, NextApiResponse } from 'next'

const PINATA_API_KEY = process.env.PINATA_API_KEY

const keyRestrictions = {
  keyName: 'Signed Upload JWT',
  maxUses: 1,
  permissions: {
    endpoints: {
      data: {
        pinList: false,
        userPinnedDataTotal: false,
      },
      pinning: {
        pinFileToIPFS: true,
        pinJSONToIPFS: false,
        pinJobs: false,
        unpin: false,
        userPinPolicy: false,
      },
    },
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        authorization: `Bearer ${PINATA_API_KEY}`,
      },
      body: JSON.stringify(keyRestrictions),
    }

    const jwtResponse = await fetch(
      'https://api.pinata.cloud/users/generateApiKey',
      options
    )
    const json = await jwtResponse.json()

    const { JWT } = json
    return res.status(200).json({ JWT })
  } catch (error) {
    console.error('Error generating JWT:', error)
    return res.status(500).json({ error: 'Server Error' })
  }
}
