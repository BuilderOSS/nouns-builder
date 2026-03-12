# @buildeross/sdk

SDK for interacting with Builder contracts and subgraphs.

## Installation

```bash
pnpm install @buildeross/sdk
```

## Entry Points

- `@buildeross/sdk` - combined exports
- `@buildeross/sdk/contract` - contract ABIs and read helpers
- `@buildeross/sdk/subgraph` - subgraph query helpers and generated GraphQL types

## Quick Usage

### Contract Helpers

```ts
import {
  getDAOAddresses,
  getProposalState,
  ProposalState,
} from '@buildeross/sdk/contract'
import { CHAIN_ID } from '@buildeross/types'

const addresses = await getDAOAddresses(CHAIN_ID.BASE, '0x...')

const state = await getProposalState(CHAIN_ID.BASE, '0xGovernorAddress', '0x01')

if (state === ProposalState.Active) {
  // proposal is active
}
```

### Subgraph Helpers

```ts
import { encodedDaoMetadataRequest, getEscrowDelegate } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'

const metadataCalls = await encodedDaoMetadataRequest(CHAIN_ID.ETHEREUM, '0x...')

const delegate = await getEscrowDelegate(
  '0xTokenAddress',
  '0xTreasuryAddress',
  CHAIN_ID.BASE
)
```

## Main Exports

### Contract

- ABIs: `auctionAbi`, `tokenAbi`, `governorAbi`, `managerAbi`, `treasuryAbi`, `metadataAbi`, and more
- Requests: `getDAOAddresses`, `getMetadataAttributes`, `getPropertyItems`, `getProposalState`, `getAuctionRewards`

### Subgraph

- Requests: `daoQuery`, `proposalQuery`, `proposalsQuery`, `tokensQuery`, `dashboardQuery`, `exploreQueries`, `homepageQuery`, `feedQuery`, and more
- Generated types/enums are exported from `sdk.generated.ts` via `@buildeross/sdk/subgraph`

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Install dependencies
pnpm install

# Build package
pnpm build

# Generate GraphQL types
pnpm codegen

# Generate contract ABIs
pnpm generate-abis

# Type-check
pnpm type-check

# Lint
pnpm lint
```

### Scripts

- `pnpm build` - build for production
- `pnpm codegen` - generate GraphQL types
- `pnpm generate-abis` - regenerate contract ABI files
- `pnpm type-check` - run TypeScript checks
- `pnpm lint` - run linting
- `pnpm clean` - remove build artifacts

## Dependencies

### Runtime Dependencies

- `graphql` ^16.11.0
- `graphql-request` ^7.1.2
- `graphql-tag` ^2.12.6

### Peer Dependencies

- `@buildeross/constants` >=0.3.0
- `@buildeross/types` >=0.3.0
- `@buildeross/utils` >=0.3.0
- `@sentry/nextjs` ^9.22.0 (optional)
- `viem` ^2.47.1
- `wagmi` ^2.18.1

## License

MIT License - see LICENSE file for details.
