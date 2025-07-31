import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { Chain } from '@buildeross/types'
import { ReactElement, ReactNode } from 'react'
import { useChainStore } from 'src/stores/useChainStore'
import { DaoContractAddresses, useDaoStore } from 'src/stores/useDaoStore'

import { getDefaultLayout } from './DefaultLayout'

function DaoLayout({
  children,
  addresses,
  chain,
}: {
  children: ReactNode
  addresses: DaoContractAddresses
  chain: Chain
}) {
  useDaoStore((state) => (state.addresses = addresses))
  useChainStore((state) => (state.chain = chain))

  return <>{children}</>
}

export function getDaoLayout(page: ReactElement) {
  const addresses = (page.props as any)?.addresses ?? {}
  const chainId = (page.props as any)?.chainId ?? 1
  const chain =
    PUBLIC_DEFAULT_CHAINS.find((c) => c.id === chainId) ?? PUBLIC_DEFAULT_CHAINS[0]

  return getDefaultLayout(
    <DaoLayout addresses={addresses} chain={chain}>
      {page}
    </DaoLayout>
  )
}
