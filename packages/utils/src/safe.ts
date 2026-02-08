import { SAFE_APP_URL, SAFE_HOME_URL } from '@buildeross/constants/safe'
import { CHAIN_ID } from '@buildeross/types'
import { Address } from 'viem'

export const createSafeAppUrl = (
  chainId: CHAIN_ID,
  safeAddress: Address,
  appUrl: string
) => {
  const safeUrl = SAFE_APP_URL[chainId]
  const encodedUrl = encodeURIComponent(appUrl)
  return `${safeUrl}:${safeAddress}&appUrl=${encodedUrl}`
}

export const createSafeUrl = (chainId: CHAIN_ID, safeAddress: Address) => {
  const safeUrl = SAFE_HOME_URL[chainId]
  return `${safeUrl}:${safeAddress}`
}
