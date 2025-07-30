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

### Subgraph Functions - GraphQL Data Access
Direct function imports for querying blockchain data via GraphQL subgraphs using the internal SDK client.

```typescript
import { encodedDaoMetadataRequest } from '@buildeross/sdk/subgraph'

// Get encoded DAO metadata for L1 chains
const metadata = await encodedDaoMetadataRequest(
  CHAIN_ID.MAINNET, // Only L1 chains supported
  '0x...' // tokenAddress
)
```

### EAS Functions - Attestation Services
Direct function imports for Ethereum Attestation Service operations.

```typescript
import { getEscrowDelegate } from '@buildeross/sdk/eas'

// Get delegation attestations
const delegate = await getEscrowDelegate(
  '0x...', // tokenAddress
  '0x...', // treasuryAddress
  CHAIN_ID.BASE
)
```

## Usage

### Contract Interactions

```typescript
import { 
  auctionAbi, 
  tokenAbi, 
  governorAbi,
  getDAOAddresses
} from '@buildeross/sdk/contract'


// Get DAO addresses
const addresses = await getDAOAddresses(
  CHAIN_ID.BASE,
  '0x...'
)

// Check proposal state
const state = await getProposalState(
  CHAIN_ID.BASE,
  '0x...',
  '0x...'
)

// Use with wagmi
import { useReadContract } from 'wagmi'

function AuctionInfo() {
  const { data: auction } = useReadContract({
    address: auctionAddress,
    abi: auctionAbi,
    functionName: 'auction',
    chainId: CHAIN_ID.BASE
  })

  return <div>Current bid: {auction?.highestBid}</div>
}
```

### Subgraph Queries

```typescript
import { encodedDaoMetadataRequest } from '@buildeross/sdk/subgraph'

// Get encoded DAO metadata (L1 chains only)
const metadata = await encodedDaoMetadataRequest(
  CHAIN_ID.MAINNET, // Only L1 chains supported
  '0x...' // tokenAddress
)
```

### EAS (Ethereum Attestation Service)

```typescript
import { getEscrowDelegate } from '@buildeross/sdk/eas'

// Get escrow delegation attestations
const delegate = await getEscrowDelegate(
  '0x...', // tokenAddress  
  '0x...', // treasuryAddress
  CHAIN_ID.BASE
)
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
import { encodedDaoMetadataRequest } from '@buildeross/sdk/subgraph'
import { getEscrowDelegate } from '@buildeross/sdk/eas'

// Or import everything
import { 
  auctionAbi, 
  encodedDaoMetadataRequest, 
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
  chainId: CHAIN_ID.BASE
})
// Returns: { token, auction, treasury, governor, metadata }
```

### Metadata Parsing
```typescript
import { getMetadataAttributes } from '@buildeross/sdk/contract'

const attributes = await getMetadataAttributes({
  contractAddress: '0x...',
  tokenId: '1',
  chainId: CHAIN_ID.BASE
})
```

### Proposal State Checking
```typescript
import { getProposalState, ProposalState } from '@buildeross/sdk/contract'

const state = await getProposalState({
  proposalId: '1',
  governorAddress: '0x...',
  chainId: CHAIN_ID.BASE
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

- **Ethereum Mainnet** (`CHAIN_ID.BASE`)
- **Base** (`CHAIN_ID.BASE`) 
- **Optimism** (`CHAIN_ID.OPTIMISM`)
- **Zora** (`CHAIN_ID.ZORA`)
- **Testnets**: Sepolia, Base Sepolia, Optimism Sepolia, Zora Sepolia

## Error Handling

The SDK includes comprehensive error handling:

```typescript
import { encodedDaoMetadataRequest } from '@buildeross/sdk/subgraph'

try {
  const metadata = await encodedDaoMetadataRequest(
    CHAIN_ID.MAINNET,
    '0x...'
  )
} catch (error) {
  if (error.message.includes('Only L1 Chains are supported')) {
    // Handle unsupported chain
  } else if (error.message.includes('No metadata found')) {
    // Handle no metadata
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
