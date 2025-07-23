# @buildeross/sdk

Comprehensive SDK for BuilderOSS applications, providing contract ABIs, GraphQL clients, blockchain utilities, and EAS integration for decentralized governance and auctions.

## Installation

```bash
pnpm install @buildeross/sdk
```

## Features

- **Contract Integration**: Complete ABIs and utilities for all Builder protocol contracts
- **GraphQL Subgraph**: Type-safe GraphQL client with auto-generated types
- **EAS Integration**: Ethereum Attestation Service client and helpers
- **Farcaster Support**: Social integrations and attestations
- **Multi-Chain**: Support for Ethereum, Base, Optimism, and Zora networks
- **Type Safety**: Fully typed with auto-generated TypeScript definitions
- **Modular Exports**: Import only what you need with targeted exports

## Main Entry Points

The SDK provides three main entry points for different functionality:

### SubgraphSDK - GraphQL Data Access
Primary entry point for querying blockchain data via GraphQL subgraphs.

```typescript
import { SubgraphSDK } from '@buildeross/sdk/subgraph'

// Query DAO information
const dao = await SubgraphSDK.daoQuery({
  chainId: CHAIN_ID.ETHEREUM,
  collectionAddress: '0x...'
})

// Get proposals with filtering
const proposals = await SubgraphSDK.proposalsQuery({
  chainId: CHAIN_ID.ETHEREUM,
  collectionAddress: '0x...',
  filter: { state: 'ACTIVE' }
})
```

### ContractSDK - Blockchain Interactions
Entry point for direct contract interactions and utilities.

```typescript
import { ContractSDK } from '@buildeross/sdk/contract'

// Get complete DAO addresses
const addresses = await ContractSDK.getDAOAddresses({
  managerAddress: '0x...',
  tokenAddress: '0x...',
  chainId: CHAIN_ID.ETHEREUM
})

// Check proposal state
const state = await ContractSDK.getProposalState({
  proposalId: '1',
  governorAddress: '0x...',
  chainId: CHAIN_ID.ETHEREUM
})
```

### EasSDK - Attestation Services
Entry point for Ethereum Attestation Service operations.

```typescript
import { EasSDK } from '@buildeross/sdk/eas'

// Get delegation attestations
const delegate = await EasSDK.getEscrowDelegate({
  recipient: '0x...',
  chainId: CHAIN_ID.ETHEREUM
})

// Get proposal dates from attestations
const dates = await EasSDK.getPropDates({
  proposalId: '1',
  chainId: CHAIN_ID.ETHEREUM
})
```

## Usage

### Contract Interactions

```typescript
import { 
  auctionAbi, 
  tokenAbi, 
  governorAbi,
  getDAOAddresses,
  getProposalState,
  ContractSDK 
} from '@buildeross/sdk/contract'

// Get DAO addresses from manager
const addresses = await getDAOAddresses({
  managerAddress: '0x...',
  tokenAddress: '0x...',
  chainId: CHAIN_ID.ETHEREUM
})

// Check proposal state
const state = await getProposalState({
  proposalId: '1',
  governorAddress: addresses.governor,
  chainId: CHAIN_ID.ETHEREUM
})

// Use with wagmi
import { useReadContract } from 'wagmi'

function AuctionInfo() {
  const { data: auction } = useReadContract({
    address: auctionAddress,
    abi: auctionAbi,
    functionName: 'auction',
    chainId: CHAIN_ID.ETHEREUM
  })

  return <div>Current bid: {auction?.highestBid}</div>
}
```

### Subgraph Queries

```typescript
import { 
  daoQuery,
  proposalsQuery,
  auctionHistory,
  SubgraphSDK 
} from '@buildeross/sdk/subgraph'

// Fetch DAO information
const dao = await daoQuery({
  chainId: CHAIN_ID.ETHEREUM,
  collectionAddress: '0x...'
})

// Get proposals with filtering and pagination
const proposals = await proposalsQuery({
  chainId: CHAIN_ID.ETHEREUM,
  collectionAddress: '0x...',
  pagination: {
    limit: 10,
    offset: 0
  },
  filter: {
    state: 'ACTIVE'
  }
})

// Fetch auction history
const history = await auctionHistory({
  chainId: CHAIN_ID.ETHEREUM,
  collectionAddress: '0x...',
  startTime: Date.now() - 86400000, // Last 24 hours
  endTime: Date.now()
})
```

### EAS (Ethereum Attestation Service)

```typescript
import { 
  getEscrowDelegate,
  getPropDates,
  EasSDK 
} from '@buildeross/sdk/eas'

// Get escrow delegation attestations
const delegate = await getEscrowDelegate({
  recipient: '0x...',
  chainId: CHAIN_ID.ETHEREUM
})

// Get proposal dates from attestations
const propDates = await getPropDates({
  proposalId: '1',
  chainId: CHAIN_ID.ETHEREUM
})
```

### Farcaster Integration

```typescript
import { FarcasterSDK } from '@buildeross/sdk/farcaster'

// Get Farcaster profile data
const profile = await FarcasterSDK.getProfile({
  fid: 123
})

// Get casts related to a DAO
const casts = await FarcasterSDK.getCasts({
  daoAddress: '0x...',
  limit: 10
})
```

## Modular Imports

The SDK supports targeted imports to reduce bundle size:

```typescript
// Import specific modules
import { auctionAbi, tokenAbi } from '@buildeross/sdk/contract'
import { daoQuery, proposalsQuery } from '@buildeross/sdk/subgraph'
import { getEscrowDelegate } from '@buildeross/sdk/eas'

// Or import everything
import { 
  auctionAbi, 
  daoQuery, 
  getEscrowDelegate 
} from '@buildeross/sdk'
```

## Contract ABIs

The SDK includes ABIs for all Builder protocol contracts:

### Core Contracts
- `auctionAbi` - Auction house contract
- `tokenAbi` - DAO token (ERC721) contract
- `governorAbi` - Governance contract
- `treasuryAbi` - Treasury contract
- `managerAbi` - DAO manager contract
- `metadataAbi` - Metadata renderer contract

### Utility Contracts
- `erc20Abi` - Standard ERC20 token interface
- `erc721Abi` - Standard ERC721 NFT interface
- `erc1155Abi` - Standard ERC1155 multi-token interface

### L2 Migration Contracts
- `l1CrossDomainMessengerAbi` - L1 cross-domain messenger
- `l2MigrationDeployerAbi` - L2 migration deployer
- `merklePropertyMetadataAbi` - Merkle property metadata

### External Integrations
- `zoraNftCreatorAbi` - Zora NFT creator contract

## GraphQL Operations

### DAO Queries
- `daoQuery` - Complete DAO information
- `daoMetadata` - DAO metadata and settings
- `daoMembership` - User membership status
- `daoVoters` - DAO voting participants

### Auction Queries  
- `auctionHistory` - Historical auction data
- `activeAuctions` - Currently active auctions
- `getBids` - Auction bid history
- `averageWinningBid` - Auction statistics

### Proposal Queries
- `proposalQuery` - Single proposal details
- `proposalsQuery` - Multiple proposals with filtering
- `proposalOGMetadata` - Proposal social metadata

### Token Queries
- `tokensQuery` - Token ownership and metadata
- `tokenWithDao` - Token with associated DAO data

### Utility Queries
- `exploreQueries` - Discover DAOs and content
- `dashboardQuery` - User dashboard data
- `homepageQuery` - Homepage featured content

## Contract Utilities

### DAO Address Resolution
```typescript
import { getDAOAddresses } from '@buildeross/sdk/contract'

const addresses = await getDAOAddresses({
  managerAddress: '0x...',
  tokenAddress: '0x...',
  chainId: CHAIN_ID.ETHEREUM
})
// Returns: { token, auction, treasury, governor, metadata }
```

### Metadata Parsing
```typescript
import { getMetadataAttributes } from '@buildeross/sdk/contract'

const attributes = await getMetadataAttributes({
  contractAddress: '0x...',
  tokenId: '1',
  chainId: CHAIN_ID.ETHEREUM
})
```

### Proposal State Checking
```typescript
import { getProposalState, ProposalState } from '@buildeross/sdk/contract'

const state = await getProposalState({
  proposalId: '1',
  governorAddress: '0x...',
  chainId: CHAIN_ID.ETHEREUM
})

if (state === ProposalState.Active) {
  // Proposal is active and can be voted on
}
```

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Development build with watch
pnpm dev

# Generate GraphQL types
pnpm codegen

# Generate contract ABIs
pnpm generate-abis

# Run type checking
pnpm type-check

# Run linting
pnpm lint
```

### Scripts

- `pnpm build` - Build the package for production
- `pnpm dev` - Build in watch mode for development
- `pnpm codegen` - Generate GraphQL types from schemas
- `pnpm generate-abis` - Generate contract ABIs from sources
- `pnpm type-check` - Run TypeScript type checking
- `pnpm lint` - Run ESLint with auto-fix
- `pnpm clean` - Remove build artifacts

## Dependencies

### Runtime Dependencies
- `@buildeross/constants` - Shared constants and addresses
- `@buildeross/types` - TypeScript type definitions
- `@buildeross/utils` - Utility functions
- `@farcaster/hub-nodejs` - Farcaster protocol integration
- `graphql` - GraphQL core library
- `graphql-request` - Lightweight GraphQL client
- `graphql-tag` - GraphQL query parsing

### Peer Dependencies
- `viem` ^2.30.0 - Ethereum library
- `wagmi` ^2.15.4 - React hooks for Ethereum

### Development Dependencies
- `@graphql-codegen/*` - GraphQL code generation
- `@wagmi/cli` - Wagmi CLI tools for ABI generation
- TypeScript and ESLint configurations

## Code Generation

The SDK uses automated code generation for type safety:

### GraphQL Types
Auto-generated from subgraph schemas:
```bash
pnpm codegen
```

### Contract ABIs
Auto-generated from contract sources:
```bash
pnpm generate-abis
```

## Multi-Chain Support

The SDK supports all Builder protocol chains:

- **Ethereum Mainnet** (`CHAIN_ID.ETHEREUM`)
- **Base** (`CHAIN_ID.BASE`) 
- **Optimism** (`CHAIN_ID.OPTIMISM`)
- **Zora** (`CHAIN_ID.ZORA`)
- **Testnets**: Sepolia, Base Sepolia, Optimism Sepolia, Zora Sepolia

## Error Handling

The SDK includes comprehensive error handling:

```typescript
import { daoQuery } from '@buildeross/sdk/subgraph'

try {
  const dao = await daoQuery({
    chainId: CHAIN_ID.ETHEREUM,
    collectionAddress: '0x...'
  })
} catch (error) {
  if (error.message.includes('not found')) {
    // Handle DAO not found
  } else if (error.message.includes('network')) {
    // Handle network error
  }
}
```

## Type Definitions

The SDK exports comprehensive TypeScript types:

```typescript
// Contract types
import type { AuctionAbi, TokenAbi, GovernorAbi } from '@buildeross/sdk/contract'

// GraphQL types  
import type { 
  DaoFragment,
  ProposalFragment,
  AuctionFragment,
  ProposalVoteSupport 
} from '@buildeross/sdk/subgraph'

// EAS types
import type { AttestationFragment } from '@buildeross/sdk/eas'
```

## License

MIT License - see LICENSE file for details.
