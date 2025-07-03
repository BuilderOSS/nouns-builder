import { foundry } from 'wagmi/chains'

import { CHAIN_ID } from 'src/typings'

import { getAlchemyRpcUrl } from './alchemy'
import { getInfuraRpcUrl } from './infura'
import { getTenderlyRpcUrl } from './tenderly'

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
  addToUrls(CHAIN_ID.ZORA, 'https://rpc.zora.energy')
  addToUrls(CHAIN_ID.ZORA_SEPOLIA, 'https://sepolia.rpc.zora.energy')

  for (const key of Object.keys(CHAIN_ID)) {
    if (isNaN(Number(key))) {
      const chainId = CHAIN_ID[key as keyof typeof CHAIN_ID]
      const tenderly = getTenderlyRpcUrl(chainId)
      if (tenderly) addToUrls(chainId, tenderly)

      const alchemy = getAlchemyRpcUrl(chainId)
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
