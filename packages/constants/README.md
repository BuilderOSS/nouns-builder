# @buildeross/constants

Shared constants and configuration values for BuilderOSS applications, including contract addresses, chain configurations, cache settings, and API endpoints.

## Installation

```bash
pnpm install @buildeross/constants
```

## Features

- **Multi-Chain Support**: Contract addresses for Ethereum, Base, Optimism, and Zora
- **Environment-Aware**: Testnet and mainnet configurations
- **Cache Configuration**: Optimized cache timing for different data types
- **Type-Safe**: Full TypeScript support with typed addresses and chain IDs
- **Comprehensive Coverage**: All Builder protocol contracts and external services

## Usage

### Contract Addresses

```typescript
import { 
  PUBLIC_MANAGER_ADDRESS, 
  PUBLIC_BUILDER_ADDRESS,
  PUBLIC_ZORA_NFT_CREATOR 
} from '@buildeross/constants'

// Get manager address for specific chain
const managerAddress = PUBLIC_MANAGER_ADDRESS[CHAIN_ID.ETHEREUM]

// Get builder treasury address
const builderAddress = PUBLIC_BUILDER_ADDRESS[CHAIN_ID.ETHEREUM]
```

### Chain Configuration

```typescript
import { 
  PUBLIC_DEFAULT_CHAINS, 
  PUBLIC_ALL_CHAINS,
  L1_CHAINS,
  L2_CHAINS 
} from '@buildeross/constants'

// Use default chains based on environment
const chains = PUBLIC_DEFAULT_CHAINS

// Get L2 chains only
const l2Chains = L2_CHAINS
```

### Cache Settings

```typescript
import { CACHE_TIMES } from '@buildeross/constants'

// Use optimized cache times for different data types
const daoInfoCache = CACHE_TIMES.DAO_INFO
const proposalCache = CACHE_TIMES.DAO_PROPOSAL
```

### API Configuration

```typescript
import { 
  PUBLIC_SUBGRAPH_URL,
  PUBLIC_ALCHEMY_API_URL,
  PUBLIC_ETHERSCAN_API_URL 
} from '@buildeross/constants'

// Access configured API endpoints
const subgraphUrl = PUBLIC_SUBGRAPH_URL[chainId]
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

# Run type checking
pnpm type-check

# Run linting
pnpm lint
```

### Scripts

- `pnpm build` - Build the package for production
- `pnpm dev` - Build in watch mode for development
- `pnpm type-check` - Run TypeScript type checking
- `pnpm lint` - Run ESLint with auto-fix
- `pnpm clean` - Remove build artifacts

## Dependencies

### Dependencies
- `@buildeross/types`: Shared TypeScript types

### Peer Dependencies
- `wagmi`: ^2.15.4 (for chain configurations)

## Exported Constants

### Contract Addresses
- `PUBLIC_MANAGER_ADDRESS` - DAO manager contract addresses
- `PUBLIC_L1_BRIDGE_ADDRESS` - Layer 1 bridge contract addresses
- `PUBLIC_BUILDER_ADDRESS` - Builder treasury addresses
- `PUBLIC_NOUNS_ADDRESS` - Nouns treasury addresses
- `PUBLIC_ZORA_NFT_CREATOR` - Zora NFT creator contract addresses
- `MERKLE_RESERVE_MINTER` - Merkle reserve minter addresses
- `L2_MIGRATION_DEPLOYER` - L2 migration deployer addresses
- `MERKLE_METADATA_RENDERER` - Merkle metadata renderer addresses
- `L1_CROSS_DOMAIN_MESSENGER` - Cross-domain messenger addresses
- `NULL_ADDRESS` - Zero address constant
- `ALLOWED_MIGRATION_DAOS` - Whitelisted DAO addresses for migration

### Chain Configuration
- `PUBLIC_DEFAULT_CHAINS` - Default chains based on environment
- `PUBLIC_ALL_CHAINS` - All supported chains (mainnet + testnet)
- `PUBLIC_IS_TESTNET` - Environment flag for testnet mode
- `L1_CHAINS` - Layer 1 chain IDs
- `L2_CHAINS` - Layer 2 chain IDs

### Cache Settings
- `CACHE_TIMES` - Optimized cache durations for different data types
  - `DAO_INFO` - DAO metadata caching
  - `DAO_PROPOSAL` - Proposal data caching
  - `TOKEN_INFO` - Token metadata caching
  - `EXPLORE` - Explore page data caching
  - `IN_PROGRESS_PROPOSAL` - Active proposal caching
  - `SETTLED_PROPOSAL` - Historical proposal caching
  - `DECODE` - Transaction decode caching
  - `DAO_FEED` - Activity feed caching
  - `PROFILE` - User profile caching
  - `RENDERER` - Metadata renderer caching

### API & Service Configuration
- `PUBLIC_SUBGRAPH_URL` - GraphQL subgraph endpoints
- `PUBLIC_ALCHEMY_API_KEY` - Alchemy API configuration
- `PUBLIC_ETHERSCAN_API_KEY` - Etherscan API configuration
- `PUBLIC_TENDERLY_*` - Tenderly simulation configuration
- `PUBLIC_INFURA_*` - Infura RPC configuration
- `PUBLIC_WALLETCONNECT_*` - WalletConnect configuration
- `FARCASTER_ENABLED` - Farcaster integration flag
- `SWR_KEYS` - Standardized SWR cache keys
- `LAYERS` - Z-index layer constants for UI
- `MESSAGES` - Standard error and info messages

## Type Safety

All addresses are typed using `AddressType` from `@buildeross/types`, ensuring type safety across the application. Chain IDs use the `CHAIN_ID` enum for consistent chain identification.

## Environment Support

The package automatically detects the environment using `NEXT_PUBLIC_NETWORK_TYPE` and provides appropriate configurations for both testnet and mainnet deployments.

## License

MIT License - see LICENSE file for details.