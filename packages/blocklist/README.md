# @buildeross/blocklist

Ethereum address blocklist validation against the US Treasury's Specially Designated Nationals (SDN) list for compliance and security.

## Installation

```bash
pnpm install @buildeross/blocklist
```

## Features

- **SDN Compliance**: Validates addresses against US Treasury SDN list
- **React Hook**: Easy integration with React applications
- **Synchronous Check**: Imperative function for non-React usage
- **TypeScript Support**: Full type definitions included
- **Environment-Aware**: Different lists for development and production
- **Address Validation**: Uses viem for proper Ethereum address handling

## Usage

### React Hook

```tsx
import { useBlocklist } from '@buildeross/blocklist'
import { useAccount } from 'wagmi'

function WalletStatus() {
  const { address } = useAccount()
  const isBlocked = useBlocklist(address)

  if (isBlocked) {
    return <div>Address is blocked</div>
  }

  return <div>Address is valid</div>
}
```

### Imperative Function

```ts
import { isBlocked } from '@buildeross/blocklist'

// Check if address is blocked
if (isBlocked('0x742d35Cc6634C0532925a3b8D2C31883a29B8f8D')) {
  console.log('Address is blocked')
}

// Returns false for invalid addresses
console.log(isBlocked('invalid-address')) // false
console.log(isBlocked(undefined)) // false
```

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Install dependencies
pnpm install

# Run linting
pnpm lint

# Update SDN list
pnpm run update
```

### Scripts

- `pnpm lint` - Run ESLint
- `pnpm run update` - Fetch latest SDN list and update local files

## Dependencies

### Peer Dependencies
- `viem`: ^2.30.0

### Development Dependencies
- `react`: ^19.1.0 (for hook usage)
- TypeScript and ESLint configurations

## API Reference

### useBlocklist(address)

React hook to check if an address is blocked.

**Parameters:**
- `address` (string | undefined) - Ethereum address to check

**Returns:**
- `boolean` - True if address is blocked, false otherwise

### isBlocked(address)

Synchronous function to check if an address is blocked.

**Parameters:**
- `address` (string | undefined) - Ethereum address to check

**Returns:**
- `boolean` - True if address is blocked, false otherwise

## Data Sources

The blocklist is sourced from the US Treasury's Specially Designated Nationals And Blocked Persons List (SDN). The package includes:

- `sdnlist.json` - Production blocklist
- `sdnlist.dev.json` - Development blocklist (smaller subset for testing)

## Environment Handling

The package automatically selects the appropriate blocklist based on `NODE_ENV`:
- `production` - Uses full SDN list
- `development` - Uses reduced development list
- Default fallback to development list

## License

MIT License - see LICENSE file for details.
