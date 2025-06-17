import { CHAIN_ID } from 'src/typings'

const GOLDSKY_PROJECT_ID = 'project_cm33ek8kjx6pz010i2c3w8z25'
const VERSION = process.env.VERCEL_ENV === 'production' ? 'latest' : '0.1.1'

const createSubgraphUrl = (name: string, version = VERSION): string =>
  `https://api.goldsky.com/api/public/${GOLDSKY_PROJECT_ID}/subgraphs/${name}/${version}/gn`

export const PUBLIC_SUBGRAPH_URL: Map<CHAIN_ID, string> = new Map([
  [CHAIN_ID.ETHEREUM, createSubgraphUrl('nouns-builder-ethereum-mainnet')],
  [CHAIN_ID.SEPOLIA, createSubgraphUrl('nouns-builder-ethereum-sepolia')],
  [CHAIN_ID.OPTIMISM, createSubgraphUrl('nouns-builder-optimism-mainnet')],
  [CHAIN_ID.OPTIMISM_SEPOLIA, createSubgraphUrl('nouns-builder-optimism-sepolia')],
  [CHAIN_ID.BASE, createSubgraphUrl('nouns-builder-base-mainnet')],
  [CHAIN_ID.BASE_SEPOLIA, createSubgraphUrl('nouns-builder-base-sepolia')],
  [CHAIN_ID.ZORA, createSubgraphUrl('nouns-builder-zora-mainnet')],
  [CHAIN_ID.ZORA_SEPOLIA, createSubgraphUrl('nouns-builder-zora-sepolia')],
  [CHAIN_ID.FOUNDRY, ''],
])
