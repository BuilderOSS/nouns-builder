import { NextApiRequest, NextApiResponse } from 'next'

const PINATA_API_KEY = process.env.PINATA_API_KEY

type PinCidOptions = {
  cid: string
  name?: string
  group_id?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { cid, name, group_id } = req.body
      if (!cid) {
        return res.status(400).json({
          text: 'CID is required',
        })
      }
      if (!!name && name.length > 32) {
        return res.status(400).json({
          text: 'Name is too long',
        })
      }
      const options: PinCidOptions = { cid }
      if (name) {
        options.name = name
      }
      if (group_id) {
        options.group_id = group_id
      }

      const data = JSON.stringify(options)

      const pinResponse = await fetch(
        'https://api.pinata.cloud/v3/files/public/pin_by_cid',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${PINATA_API_KEY}`,
          },
          body: data,
        }
      )
      if (!pinResponse.ok) {
        console.error('Error pinning CID:', await pinResponse.text())
        throw new Error('Error pinning CID')
      }
      return res.status(200).json({ text: 'CID pinned' })
    } catch (error) {
      console.error('Error pinning CID:', error)
      return res.status(500).json({ text: 'Error pinning CID' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
