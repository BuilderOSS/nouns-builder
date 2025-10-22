import { transports } from '@buildeross/utils/wagmi'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

import { getDaoConfig } from '@/config'

// Get the DAO chain
const daoChain = getDaoConfig().chain

if (!daoChain) {
  throw new Error(`DAO chain not found. Make sure to run the prebuild script first.`)
}

export const config = getDefaultConfig({
  appName: 'Builder Template',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'dummy_project_id',
  chains: [daoChain],
  transports: {
    [daoChain.id]: transports[daoChain.id],
  },
})
