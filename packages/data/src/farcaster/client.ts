import { getSSLHubRpcClient } from '@farcaster/hub-nodejs'

export const farcasterClient = () => {
  const client = getSSLHubRpcClient(
    process.env.FARCASTER_HUB || 'testnet1.farcaster.xyz:2283',
  )

  return client
}
