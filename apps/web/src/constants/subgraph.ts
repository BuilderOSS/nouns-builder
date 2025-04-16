import {CHAIN_ID} from 'src/typings'

export const PUBLIC_SUBGRAPH_URL: Map<CHAIN_ID, string> = new Map([
  [CHAIN_ID.ETHEREUM, 'https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-ethereum-mainnet/latest/gn'],
  [CHAIN_ID.OPTIMISM, 'https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-optimism-mainnet/latest/gn'],
  [CHAIN_ID.SEPOLIA, 'https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-ethereum-sepolia/latest/gn'],
  [CHAIN_ID.BASE, 'https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-base-mainnet/latest/gn'],
  [CHAIN_ID.ZORA, 'https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-zora-mainnet/latest/gn'],
  [CHAIN_ID.FOUNDRY, 'https://api.thegraph.com/subgraphs/name/neokry/nouns-builder-mainnet']
]);