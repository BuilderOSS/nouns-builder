import type { NextApiRequest, NextApiResponse } from 'next'

import { BASE_URL } from 'src/constants/baseUrl'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).end()
    return
  }

  const frame = {
    version: '1',
    name: 'Nouns Builder',
    description:
      'Unlock the possibilities of collective creation. Start with a vision. Start a DAO. All onchain.',
    iconUrl: `${BASE_URL}/builder-avatar-circle.png`,
    homeUrl: `${BASE_URL}`,
    heroImageUrl: `${BASE_URL}/social-preview.jpg`,
    splashImageUrl: `${BASE_URL}/noggles-square.png`,
    splashBackgroundColor: '#ffffff',
    primaryCategory: 'social',
  }

  res.setHeader('Content-Type', 'application/json')
  res.status(200).json({ frame })
}
