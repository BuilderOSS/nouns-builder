import { pinataOptions, UploadType } from '@buildeross/ipfs-service'
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

  if (req.method === 'POST') {
    try {
      const { type } = req.body
      if (!type || !pinataOptions[type as UploadType]) {
        return res.status(400).json({
          text: `Invalid type provided, must be one of: ${Object.keys(pinataOptions).join(', ')}`,
        })
      }
      const options = pinataOptions[req.body.type as UploadType]
      const data = JSON.stringify({
        expires: 30,
        date: new Date().getTime(),
        ...options,
      })
      const urlRequest = await fetch('https://uploads.pinata.cloud/v3/files/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${PINATA_API_KEY}`,
        },
        body: data,
      })
      const urlResponse = await urlRequest.json()
      if (!urlResponse.data) {
        console.error('Error creating signed URL:', urlResponse)
        throw new Error('Error creating signed URL')
      }
      return res.status(200).json({ url: urlResponse.data })
    } catch (error) {
      console.error('Error creating signed URL:', error)
      return res.status(500).json({ text: 'Error creating signed URL' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
