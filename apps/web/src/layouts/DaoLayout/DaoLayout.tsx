import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { type DaoContractAddresses } from '@buildeross/types'
import { ReactElement } from 'react'

import { DefaultLayout } from '../DefaultLayout'

type DaoPageProps = {
  addresses?: DaoContractAddresses
  chainId?: number
}

export function getDaoLayout(page: ReactElement<DaoPageProps>) {
  const addresses = page.props?.addresses ?? {}
  const chainId = page.props?.chainId ?? 1
  const chain =
    PUBLIC_DEFAULT_CHAINS.find((c) => c.id === chainId) ?? PUBLIC_DEFAULT_CHAINS[0]

  return (
    <DefaultLayout chain={chain} addresses={addresses}>
      {page}
    </DefaultLayout>
  )
}
