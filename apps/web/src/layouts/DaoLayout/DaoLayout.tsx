import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { ReactElement } from 'react'

import { DefaultLayout } from '../DefaultLayout'

export function getDaoLayout(page: ReactElement) {
  const addresses = (page.props as any)?.addresses ?? {}
  const chainId = (page.props as any)?.chainId ?? 1
  const chain =
    PUBLIC_DEFAULT_CHAINS.find((c) => c.id === chainId) ?? PUBLIC_DEFAULT_CHAINS[0]

  return (
    <DefaultLayout chain={chain} addresses={addresses}>
      {page}
    </DefaultLayout>
  )
}
