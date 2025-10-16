import { NextApiRequest, NextApiResponse } from 'next'

const PINATA_API_KEY = process.env.PINATA_API_KEY

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers to allow any origin
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const data = req.body

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid or missing JSON data' })
    }

    // Step 1: Pin JSON to Pinata (pinJSONToIPFS)
    const pinataPayload = JSON.stringify({
      pinataOptions: {
        cidVersion: 0,
      },
      pinataContent: data,
    })

    const pinRes = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PINATA_API_KEY}`,
      },
      body: pinataPayload,
    })

    if (!pinRes.ok) {
      const errorText = await pinRes.text()
      console.error('Error pinning JSON:', errorText)
      throw new Error('Failed to pin JSON to Pinata')
    }

    const pinJsonResponse = await pinRes.json()
    const cid = pinJsonResponse.IpfsHash

    if (!cid) {
      throw new Error('Missing CID in Pinata response')
    }

    // Step 2: Pin the CID using pin_by_cid
    const pinByCidPayload = JSON.stringify({ cid })

    const pinCidRes = await fetch('https://api.pinata.cloud/v3/files/public/pin_by_cid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PINATA_API_KEY}`,
      },
      body: pinByCidPayload,
    })

    if (!pinCidRes.ok) {
      const errorText = await pinCidRes.text()
      console.error('Error pinning CID via pin_by_cid:', errorText)
      throw new Error('Failed to pin CID using pin_by_cid')
    }

    // Step 3: Return CIDv0
    return res.status(200).json({
      cid,
      status: 'Pinned successfully',
    })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
