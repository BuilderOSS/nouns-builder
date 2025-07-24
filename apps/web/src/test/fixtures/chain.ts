import { Chain, CHAIN_ID } from '@buildeross/types'
import { foundry } from 'wagmi/chains'

export const FOUNDRY_CHAIN: Chain = {
  ...foundry,
  id: CHAIN_ID.FOUNDRY,
  slug: '',
  icon: '',
}
