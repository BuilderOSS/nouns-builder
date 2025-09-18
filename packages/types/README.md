# @buildeross/types

Shared TypeScript type definitions for BuilderOSS applications, providing type safety across blockchain interactions, transaction decoding, and multi-chain operations.

## Installation

```bash
pnpm install @buildeross/types
```

## Features

- **Chain Types**: Multi-chain support with proper chain ID typing
- **Address Types**: Type-safe Ethereum address handling
- **Proposal States**: Governance proposal state management
- **Transaction Decoding**: Type-safe transaction data parsing
- **Duration Utilities**: Time-based operations and scheduling
- **Viem Integration**: Compatible with Viem's type system
- **Type Safety**: Strict TypeScript definitions for blockchain data

## Usage

### Chain Types

```typescript
import { CHAIN_ID, Chain } from '@buildeross/types'

// Chain ID enum for type safety
function getChainName(chainId: CHAIN_ID): string {
  switch (chainId) {
    case CHAIN_ID.ETHEREUM:
      return 'Ethereum'
    case CHAIN_ID.BASE:
      return 'Base'
    case CHAIN_ID.OPTIMISM:
      return 'Optimism'
    case CHAIN_ID.ZORA:
      return 'Zora'
    default:
      return 'Unknown'
  }
}

// Chain interface with additional metadata
const chains: Chain[] = [
  {
    id: CHAIN_ID.ETHEREUM,
    name: 'Ethereum',
    slug: 'ethereum',
    icon: '/chains/ethereum.svg',
    // ... other viem chain properties
  },
]
```

### Address Types

```typescript
import { AddressType, BytesType } from '@buildeross/types'

// Type-safe address handling
function validateAddress(address: AddressType): boolean {
  return address.startsWith('0x') && address.length === 42
}

// Contract interaction with typed addresses
interface ContractCall {
  to: AddressType
  data: BytesType
  value?: bigint
}

const call: ContractCall = {
  to: '0x742d35Cc6634C0532925a3b8D2C31883a29B8f8D',
  data: '0x70a08231000000000000000000000000742d35cc6634c0532925a3b8d2c31883a29b8f8d',
}
```

### Proposal States

```typescript
import { ProposalState } from '@buildeross/types'

// Type-safe proposal state handling
function getProposalStatus(state: ProposalState): string {
  switch (state) {
    case ProposalState.Pending:
      return 'Waiting to start'
    case ProposalState.Active:
      return 'Voting in progress'
    case ProposalState.Succeeded:
      return 'Passed - ready to queue'
    case ProposalState.Queued:
      return 'Queued for execution'
    case ProposalState.Executed:
      return 'Successfully executed'
    case ProposalState.Canceled:
      return 'Canceled'
    case ProposalState.Defeated:
      return 'Voting failed'
    case ProposalState.Expired:
      return 'Execution window expired'
    case ProposalState.Vetoed:
      return 'Vetoed by admin'
    default:
      return 'Unknown state'
  }
}

// Check if proposal can be voted on
function canVote(state: ProposalState): boolean {
  return state === ProposalState.Active
}

// Check if proposal can be executed
function canExecute(state: ProposalState): boolean {
  return state === ProposalState.Queued
}
```

### Transaction Decoding

```typescript
import { DecodedTransactionData, DecodedArg, DecodedValue } from '@buildeross/types'

// Type-safe transaction data
const decodedTx: DecodedTransactionData = {
  functionName: 'transfer',
  functionSig: 'transfer(address,uint256)',
  args: {
    to: {
      name: 'to',
      type: 'address',
      value: '0x742d35Cc6634C0532925a3b8D2C31883a29B8f8D',
    },
    amount: {
      name: 'amount',
      type: 'uint256',
      value: '1000000000000000000',
    },
  },
}

// Helper to extract argument values
function getArgValue<T = DecodedValue>(
  decoded: DecodedTransactionData,
  argName: string
): T | undefined {
  return decoded.args[argName]?.value as T
}

const recipient = getArgValue<string>(decodedTx, 'to')
const amount = getArgValue<string>(decodedTx, 'amount')
```

### Duration Types

```typescript
import { Duration } from '@buildeross/types'

// Type-safe duration handling
const votingPeriod: Duration = {
  days: 3,
  hours: 0,
  minutes: 0,
  seconds: 0,
}

const executionDelay: Duration = {
  days: 2,
}

// Convert duration to seconds
function durationToSeconds(duration: Duration): number {
  const { days = 0, hours = 0, minutes = 0, seconds = 0 } = duration
  return days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds
}

// Create duration from seconds
function secondsToDuration(totalSeconds: number): Duration {
  const days = Math.floor(totalSeconds / (24 * 60 * 60))
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds }
}
```

## Type Definitions

### Chain Types

```typescript
// Supported chain IDs
enum CHAIN_ID {
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

// Extended chain interface with metadata
interface Chain extends ViemChain {
  id: CHAIN_ID
  slug: string // URL-friendly identifier
  icon: string // Icon file path
}
```

### Address Types

```typescript
// Type-safe Ethereum addresses
type AddressType = `0x${string}`

// Type-safe bytes data
type BytesType = `0x${string}`
```

### Proposal States

```typescript
// Governance proposal states
enum ProposalState {
  Pending = 0, // Proposal created, voting not started
  Active = 1, // Voting period active
  Canceled = 2, // Proposal canceled
  Defeated = 3, // Voting failed
  Succeeded = 4, // Voting passed
  Queued = 5, // Queued for execution
  Expired = 6, // Execution window expired
  Executed = 7, // Successfully executed
  Vetoed = 8, // Vetoed by admin
}
```

### Transaction Decoding Types

```typescript
// Primitive values from contract calls
type PrimitiveValue = string

// Complex tuple values
type TupleValue = Record<
  string,
  PrimitiveValue | PrimitiveValue[] | Record<string, PrimitiveValue>
>

// Any decoded value type
type DecodedValue = PrimitiveValue | PrimitiveValue[] | TupleValue | TupleValue[]

// Function argument with metadata
type DecodedArg = {
  name: string // Argument name
  type: string // Solidity type
  value: DecodedValue // Decoded value
}

// Complete decoded transaction
type DecodedTransactionData = {
  args: Record<string, DecodedArg> // Function arguments
  functionName: string // Function name
  functionSig: string // Function signature
}
```

### Duration Types

```typescript
// Time duration specification
interface Duration {
  seconds?: number
  minutes?: number
  hours?: number
  days?: number
}
```

## Multi-Chain Support

The package provides comprehensive support for all Builder protocol chains:

### Mainnets

- **Ethereum** (`CHAIN_ID.ETHEREUM`) - Chain ID: 1
- **Base** (`CHAIN_ID.BASE`) - Chain ID: 8453
- **Optimism** (`CHAIN_ID.OPTIMISM`) - Chain ID: 10
- **Zora** (`CHAIN_ID.ZORA`) - Chain ID: 7777777

### Testnets

- **Sepolia** (`CHAIN_ID.SEPOLIA`) - Chain ID: 11155111
- **Base Sepolia** (`CHAIN_ID.BASE_SEPOLIA`) - Chain ID: 84532
- **Optimism Sepolia** (`CHAIN_ID.OPTIMISM_SEPOLIA`) - Chain ID: 11155420
- **Zora Sepolia** (`CHAIN_ID.ZORA_SEPOLIA`) - Chain ID: 999999999

### Development

- **Foundry** (`CHAIN_ID.FOUNDRY`) - Chain ID: 31337

## Integration with Viem

The types are designed to work seamlessly with Viem:

```typescript
import { Chain, CHAIN_ID } from '@buildeross/types'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

// Create a typed chain configuration
const ethereumChain: Chain = {
  ...mainnet,
  id: CHAIN_ID.ETHEREUM,
  slug: 'ethereum',
  icon: '/chains/ethereum.svg',
}

// Use with viem client
const client = createPublicClient({
  chain: ethereumChain,
  transport: http(),
})
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

### Peer Dependencies

- `viem`: ^2.30.0 - Ethereum library for type compatibility

### Development Dependencies

- TypeScript and ESLint configurations

## Best Practices

### Type Guards

Create type guards for runtime validation:

```typescript
import { AddressType, CHAIN_ID } from '@buildeross/types'

function isAddressType(value: unknown): value is AddressType {
  return typeof value === 'string' && value.startsWith('0x') && value.length === 42
}

function isChainId(value: unknown): value is CHAIN_ID {
  return typeof value === 'number' && Object.values(CHAIN_ID).includes(value as CHAIN_ID)
}
```

### Utility Functions

Create utility functions with proper typing:

```typescript
import { ProposalState, Duration, CHAIN_ID } from '@buildeross/types'

function isActiveProposal(state: ProposalState): boolean {
  return state === ProposalState.Active
}

function isMainnet(chainId: CHAIN_ID): boolean {
  return [CHAIN_ID.ETHEREUM, CHAIN_ID.BASE, CHAIN_ID.OPTIMISM, CHAIN_ID.ZORA].includes(
    chainId
  )
}
```

## License

MIT License - see LICENSE file for details.
