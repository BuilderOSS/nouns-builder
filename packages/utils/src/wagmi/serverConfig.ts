import { createConfig } from 'wagmi'

import { chains, pollingInterval, transports } from './chains'

export const serverConfig = createConfig({
  chains,
  transports,
  pollingInterval,
})
