import { createConfig } from 'wagmi'

import { chains, transports } from './chains'

export const serverConfig = createConfig({
  chains,
  transports,
})
