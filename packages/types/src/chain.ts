import { Chain as ViemChain } from 'viem'

export enum CHAIN_ID {
  ETHEREUM = 1,
  SEPOLIA = 11155111,
  OPTIMISM = 10,
  OPTIMISM_SEPOLIA = 11155420,
  BASE = 8453,
  BASE_SEPOLIA = 84532,
  ZORA = 7777777,
  ZORA_SEPOLIA = 999999999,
  FOUNDRY = 31337,
}

export interface Chain extends ViemChain {
  id: CHAIN_ID
  slug: string
  icon: string
}
