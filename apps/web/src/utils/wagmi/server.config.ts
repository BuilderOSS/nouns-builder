import { createConfig } from 'wagmi'

import { chains, transports } from './chains'

export const config = createConfig({
  chains,
  transports,
})
