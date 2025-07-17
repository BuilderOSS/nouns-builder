import { CHAIN_ID, Chain } from '@buildeross/types'
import { foundry } from 'wagmi/chains'

export const FOUNDRY_CHAIN: Chain = {
  ...foundry,
  id: CHAIN_ID.FOUNDRY,
  slug: '',
  icon: '',
}
