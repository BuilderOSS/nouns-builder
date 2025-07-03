import { NextRequest, NextResponse } from 'next/server'

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

export async function POST(_request: NextRequest): Promise<NextResponse> {
  try {
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
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
    return NextResponse.json({ JWT }, { status: 200 })
  } catch (e) {
    console.error('Error generating JWT', e)
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}
