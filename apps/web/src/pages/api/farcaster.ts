import type { NextApiRequest, NextApiResponse } from 'next'

import { getBaseUrl } from 'src/utils/baseUrl'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).end()
    return
  }
  const baseUrl = getBaseUrl()

  const frame = {
    version: '1',
    name: 'Nouns Builder',
    description:
      'Unlock the possibilities of collective creation. Start with a vision. Start a DAO. All onchain.',
    iconUrl: `${baseUrl}/builder-avatar-circle.png`,
    homeUrl: `${baseUrl}`,
    heroImageUrl: `${baseUrl}/social-preview.jpg`,
    splashImageUrl: `${baseUrl}/noggles-square.png`,
    splashBackgroundColor: '#ffffff',
    primaryCategory: 'social',
  }

  res.setHeader('Content-Type', 'application/json')
  res.status(200).json({ frame })
}
