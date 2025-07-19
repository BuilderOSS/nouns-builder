import { chains, transports } from './chains'
import { createConfig } from 'wagmi'

export const serverConfig = createConfig({
  chains,
  transports,
})
