import { CHAIN_ID } from '@buildeross/types'
import { foundry } from 'wagmi/chains'

import { getAlchemyRpcUrl } from './alchemy'
import { getInfuraRpcUrl } from './infura'

const createRpcUrls = () => {
  const urls: Partial<Record<CHAIN_ID, string[]>> = {}

  const addToUrls = (chainId: CHAIN_ID, url: string) => {
    if (!urls[chainId]) {
      urls[chainId] = [url]
    } else if (!urls[chainId]!.includes(url)) {
      urls[chainId]!.push(url)
    }
  }

  addToUrls(CHAIN_ID.FOUNDRY, foundry.rpcUrls.default.http[0])

  for (const key of Object.keys(CHAIN_ID)) {
    if (isNaN(Number(key))) {
      const chainId = CHAIN_ID[key as keyof typeof CHAIN_ID]
      // The public alchemy key is domain-locked, so it only works from the
      // browser; server transports add a keyless authenticated alchemy URL
      const alchemy =
        typeof window !== 'undefined' ? getAlchemyRpcUrl(chainId) : undefined
      if (alchemy) addToUrls(chainId, alchemy)

      const infura = getInfuraRpcUrl(chainId)
      if (infura) addToUrls(chainId, infura)

      if (urls[chainId]?.length === 0) {
        throw new Error(`No RPC URLs found for chainId ${chainId}`)
      }
    }
  }

  return urls as Record<CHAIN_ID, [string, ...string[]]>
}

export const RPC_URLS: Record<CHAIN_ID, [string, ...string[]]> = createRpcUrls()
