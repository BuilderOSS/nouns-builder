import type { NextApiRequest, NextApiResponse } from 'next'

import { BASE_URL } from 'src/constants/baseUrl'
import { PUBLIC_IS_TESTNET } from 'src/constants/defaultChains'

const TESTNET_ACCOUNT_ASSOCIATION = {
  // testnet.nouns.build
  // by dan13ram.eth
  header:
    'eyJmaWQiOjM5NzE0MywidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDZGRGRBRjE5RjNERjJiMWNCYTE2YTM1MkIzZTJiQzkwQTVEMWU2OTEifQ',
  payload: 'eyJkb21haW4iOiJ0ZXN0bmV0Lm5vdW5zLmJ1aWxkIn0',
  signature:
    'MHhjMTgyMmEyNzBlNzMzNTQ5MTAwNzI3ZTkzMmY4N2M3MDVlMzZmZjkzMGNhZDE0M2Y3ODEzMTQzMWFkMDI5YWVkNTIxYTc0MDY0ZDY0Y2RjYzJlYzgyMGQ3NjkyOTY0ZjEwMGMyM2ExOTQ1YTE0ODVmOWYxNDBhNDdiZWI0MmE3MTFj',
}

const MAINNET_ACCOUNT_ASSOCIATION = {
  // nouns.build
  // by dan13ram.eth
  header:
    'eyJmaWQiOjM5NzE0MywidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDZGRGRBRjE5RjNERjJiMWNCYTE2YTM1MkIzZTJiQzkwQTVEMWU2OTEifQ',
  payload: 'eyJkb21haW4iOiJub3Vucy5idWlsZCJ9',
  signature:
    'MHhkZTg2N2RkMGVjYTI4MzZjZjc0YTczMDNiYTg3NTdiYjRkM2EzYzcxODRmM2I1ZDAyZTNhYWIzM2RmY2U4NjljNDIyYmY3ZDM1MzY5NTc0NjY2YjE0OTYxMjNkYTc3NTlkODBmZWQ3YjM3MTY5NDM0Y2JmYWFiMzNkOWM0YjQ4MjFi',
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).end()
    return
  }

  const name = PUBLIC_IS_TESTNET ? 'Testnet Nouns Builder' : 'Nouns Builder'

  const frame = {
    version: '1',
    name,
    description:
      'Unlock the possibilities of collective creation. Start with a vision. Start a DAO. All onchain.',
    iconUrl: `${BASE_URL}/builder-avatar-circle.png`,
    homeUrl: `${BASE_URL}`,
    heroImageUrl: `${BASE_URL}/social-preview.jpg`,
    splashImageUrl: `${BASE_URL}/noggles-square.png`,
    splashBackgroundColor: '#ffffff',
    primaryCategory: 'social',
  }

  const accountAssociation = PUBLIC_IS_TESTNET
    ? TESTNET_ACCOUNT_ASSOCIATION
    : MAINNET_ACCOUNT_ASSOCIATION

  const isProduction = process.env.VERCEL_ENV === 'production'

  const farcaster =
    isProduction && accountAssociation ? { frame, accountAssociation } : { frame }

  res.setHeader('Content-Type', 'application/json')
  res.status(200).json(farcaster)
}
