# @buildeross/data

Shared data layer utilities for the Builder OSS project.

## Installation

This package is part of the Builder OSS monorepo and is installed as a workspace dependency.

## Usage

```typescript
import { 
  auctionAbi, 
  tokenAbi, 
  SDK as SubgraphSDK 
} from '@buildeross/data'

// Or import from specific modules
import { auctionAbi } from '@buildeross/data/contract'
import { SDK } from '@buildeross/data/subgraph'
```

## Data Modules

This package exports data layer utilities used across the Builder OSS ecosystem:

- **contract/**: Smart contract ABIs and contract interaction utilities
- **subgraph/**: GraphQL subgraph client and queries
- **eas/**: Ethereum Attestation Service client and helpers
- **farcaster/**: Farcaster client and queries

## Structure

- **contract/abis/**: Contract ABIs (Auction, Token, Treasury, etc.)
- **contract/requests/**: Contract interaction functions
- **subgraph/client.ts**: GraphQL client for subgraph queries
- **subgraph/fragments/**: GraphQL fragments
- **subgraph/queries/**: GraphQL query files
- **subgraph/requests/**: TypeScript request functions
- **eas/client.ts**: EAS GraphQL client
- **eas/requests/**: EAS request functions
- **farcaster/client.ts**: Farcaster Hub client