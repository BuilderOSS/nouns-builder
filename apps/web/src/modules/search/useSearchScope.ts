import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { CHAIN_ID } from '@buildeross/types'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { isAddress } from 'viem'

export type SearchScope = { chainId: CHAIN_ID; daoAddress: string }

/** The DAO the user is currently looking at, if any (from /dao/[network]/[token]/...). */
export const useCurrentDaoScope = (): SearchScope | undefined => {
  const { pathname, query } = useRouter()
  return useMemo(() => {
    if (!pathname.startsWith('/dao/[network]/[token]')) return undefined
    const chain = PUBLIC_DEFAULT_CHAINS.find((c) => c.slug === query.network)
    const token = query.token
    if (!chain || typeof token !== 'string' || !isAddress(token)) return undefined
    return { chainId: chain.id, daoAddress: token.toLowerCase() }
  }, [pathname, query.network, query.token])
}
