# @buildeross/utils

Comprehensive utility library for BuilderOSS applications, providing helper functions for blockchain operations, data formatting, validation schemas, and common development tasks.

## Installation

```bash
pnpm install @buildeross/utils
```

## Features

- **Address Utilities**: Wallet address formatting and validation
- **Number Formatting**: Crypto value formatting with BigNumber precision
- **String Processing**: Slugification, sanitization, and text utilities
- **Date & Time**: Duration handling and blockchain date parsing
- **Validation Schemas**: Yup schemas for common blockchain data types
- **Wagmi Integration**: Chain configurations and server-side utilities
- **Data Helpers**: Object manipulation, comparison, and array utilities
- **ENS Support**: Ethereum Name Service utilities
- **Testing**: Comprehensive test coverage with Vitest

## Usage

### Address Utilities

```typescript
import { walletSnippet } from '@buildeross/utils'

// Create address snippets for display
const snippet = walletSnippet('0x742d35Cc6634C0532925a3b8D2C31883a29B8f8D')
// Result: "0x742...B8f8D"

// Custom snippet length
const customSnippet = walletSnippet('0x742d35Cc6634C0532925a3b8D2C31883a29B8f8D', 6)
// Result: "0x742d...1B8f8D"
```

### Number Formatting

```typescript
import { formatCryptoVal, numberFormatter } from '@buildeross/utils'

// Format crypto values with appropriate precision
formatCryptoVal('1234567890000000000') // "1.23B"
formatCryptoVal('1000000000000000000') // "1.00"
formatCryptoVal('123456789') // "123.46M"
formatCryptoVal('0.000001234567') // "0.000001"

// General number formatting
numberFormatter(1234.5678) // "1,234.568"
numberFormatter('98765') // "98,765"
```

### String Processing

```typescript
import { slugify, unslugify, sanitize } from '@buildeross/utils'

// Convert strings to URL-friendly slugs
slugify('My DAO Name & Special Characters!') // "my-dao-name-and-special-characters"
slugify('Nouns DAO #123') // "nouns-dao-123"

// Convert slugs back to readable text
unslugify('my-dao-name') // "My Dao Name"

// Sanitize HTML content
sanitize('<script>alert("xss")</script><p>Safe content</p>') // "<p>Safe content</p>"
```

### Duration Utilities

```typescript
import { toSeconds, fromSeconds, formatDuration } from '@buildeross/utils'

// Convert duration to seconds
const duration = { days: 3, hours: 2, minutes: 30, seconds: 15 }
const totalSeconds = toSeconds(duration) // 266415

// Convert seconds back to duration
const parsed = fromSeconds(266415)
// Result: { days: 3, hours: 2, minutes: 30, seconds: 15 }

// Format duration for display
formatDuration(duration) // "3 days, 2 hours, 30 minutes"
```

### Data Helpers

```typescript
import {
  isEmpty,
  flatten,
  isEqual,
  compareAndReturn,
  unpackOptionalArray,
} from '@buildeross/utils'

// Check if object is empty
isEmpty({}) // true
isEmpty({ key: 'value' }) // false

// Flatten nested objects
const nested = { a: { b: { c: 'value' } } }
flatten(nested) // { c: 'value' }

// Deep equality comparison
isEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } }) // true

// Compare objects and return changes
const initial = { name: 'DAO', tokens: 100 }
const updated = { name: 'My DAO', tokens: 100 }
const changes = compareAndReturn(initial, updated)
// Result: [{ field: 'name', value: 'My DAO' }]

// Handle optional arrays from contract calls
const result = unpackOptionalArray(maybeArray, 5)
// Returns array or array of 5 undefined values
```

### Blockchain Date Parsing

```typescript
import { parseBlockchainDate, formatDate, formatDateTime } from '@buildeross/utils'

// Parse blockchain timestamps
const date = parseBlockchainDate(1640995200) // Unix timestamp
console.log(date) // Date object

// Format dates for display
formatDate(new Date(), false) // "2024-01-15"
formatDate(new Date(), true) // "01/15/2024"

// Format with time
formatDateTime(new Date()) // "Jan 15, 2024 10:30 AM"
```

### ENS Utilities

```typescript
import { isENSName, resolveENS } from '@buildeross/utils'

// Check if string is ENS name
isENSName('vitalik.eth') // true
isENSName('0x742d35...') // false

// Resolve ENS name to address
const address = await resolveENS('vitalik.eth')
console.log(address) // "0x..."
```

### Gradient Utilities

```typescript
import { generateGradient, createGradientFromAddress } from '@buildeross/utils'

// Generate gradient from colors
const gradient = generateGradient(['#ff0000', '#00ff00', '#0000ff'])

// Create gradient from wallet address
const addressGradient = createGradientFromAddress(
  '0x742d35Cc6634C0532925a3b8D2C31883a29B8f8D'
)
```

## Modular Imports

Import specific utilities to reduce bundle size:

```typescript
// Import specific functions
import { walletSnippet, formatCryptoVal } from '@buildeross/utils'

// Import from specific modules
import { walletSnippet } from '@buildeross/utils/helpers'
import { formatCryptoVal } from '@buildeross/utils/numbers'

// Import validation schemas
import { addressSchema, durationSchema } from '@buildeross/utils/yup'

// Import wagmi utilities
import { chains, serverConfig } from '@buildeross/utils/wagmi'
```

## Validation Schemas

The package includes Yup validation schemas for common blockchain data:

### Address Schema

```typescript
import { addressSchema } from '@buildeross/utils/yup'

const schema = yup.object().shape({
  recipient: addressSchema,
  token: addressSchema,
})

// Validates Ethereum addresses
schema.validate({
  recipient: '0x742d35Cc6634C0532925a3b8D2C31883a29B8f8D',
  token: '0x...',
})
```

### Duration Schema

```typescript
import { durationSchema } from '@buildeross/utils/yup'

const schema = yup.object().shape({
  votingPeriod: durationSchema,
})

// Validates duration objects
schema.validate({
  votingPeriod: { days: 3, hours: 0, minutes: 0, seconds: 0 },
})
```

### URL Schema

```typescript
import { urlSchema } from '@buildeross/utils/yup'

const schema = yup.object().shape({
  website: urlSchema,
  image: urlSchema,
})

// Validates URLs and IPFS URIs
schema.validate({
  website: 'https://nouns.build',
  image: 'ipfs://QmHash...',
})
```

## Wagmi Integration

Wagmi-specific utilities for server-side and client-side configuration:

```typescript
import { chains, serverConfig } from '@buildeross/utils/wagmi'

// Pre-configured chains for wagmi
const config = createConfig({
  chains,
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
})

// Server-side configuration
const serverClient = createPublicClient(serverConfig)
```

## Testing

The package includes comprehensive test coverage:

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test --coverage
```

### Test Utilities

```typescript
// Test files are co-located with source files
// helpers.test.ts, slugify.test.ts, etc.

// Example test usage
import { slugify } from '@buildeross/utils'

describe('slugify', () => {
  it('converts strings to URL-friendly slugs', () => {
    expect(slugify('My DAO Name!')).toBe('my-dao-name')
  })
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

# Run tests
pnpm test

# Run type checking
pnpm type-check

# Run linting
pnpm lint
```

### Scripts

- `pnpm build` - Build the package for production
- `pnpm dev` - Build in watch mode for development
- `pnpm test` - Run test suite with Vitest
- `pnpm test:watch` - Run tests in watch mode
- `pnpm type-check` - Run TypeScript type checking
- `pnpm lint` - Run ESLint with auto-fix
- `pnpm clean` - Remove build artifacts

## Dependencies

### Runtime Dependencies

- `@buildeross/constants` - Shared constants
- `@buildeross/types` - TypeScript type definitions
- `@buildeross/ipfs-service` - IPFS utilities
- `bignumber.js` - Precise decimal arithmetic
- `tinycolor2` - Color manipulation

### Peer Dependencies

- `viem` ^2.30.0 - Ethereum library
- `wagmi` ^2.15.4 - React hooks for Ethereum
- `yup` ^1.6.1 - Schema validation

### Development Dependencies

- `vitest` - Testing framework
- TypeScript and ESLint configurations

## Utility Categories

### String Processing

- `slugify` - Convert strings to URL-friendly slugs
- `unslugify` - Convert slugs back to readable text
- `sanitize` - Sanitize HTML content
- `camelToTitle` - Convert camelCase to Title Case
- `maxChar` - Truncate strings with ellipsis
- `isPossibleMarkdown` - Detect markdown syntax

### Number & Value Formatting

- `formatCryptoVal` - Format crypto values with precision
- `numberFormatter` - General number formatting
- `BigNumberish` - Type for various number formats

### Address & Blockchain

- `walletSnippet` - Create address snippets
- `parseBlockchainDate` - Parse blockchain timestamps
- `parseContractURI` - Parse contract metadata URIs
- `chainIdToSlug` - Convert chain ID to URL slug

### Duration & Time

- `toSeconds` - Convert duration to seconds
- `fromSeconds` - Convert seconds to duration
- `formatDuration` - Format duration for display
- `formatDate` - Format dates
- `formatDateTime` - Format dates with time
- `yearsAhead` - Calculate future dates
- `handleGMTOffset` - Handle timezone offsets

### Data Manipulation

- `isEmpty` - Check if object is empty
- `flatten` - Flatten nested objects
- `isEqual` - Deep equality comparison
- `compareAndReturn` - Find object differences
- `unpackOptionalArray` - Handle optional arrays
- `resolvedPromise` - Convert function to promise

### Validation & Schemas

- `addressSchema` - Ethereum address validation
- `durationSchema` - Duration object validation
- `urlSchema` - URL and IPFS URI validation

### Encoding & Parsing

- `encodePageNumToEndCursor` - Pagination cursor encoding
- `formABI` - ABI formatting utilities
- `fetch` - Enhanced fetch utilities
- `provider` - Provider configuration

## Error Handling

The utilities include proper error handling and graceful fallbacks:

```typescript
import { formatCryptoVal, walletSnippet } from '@buildeross/utils'

// Handles invalid inputs gracefully
formatCryptoVal('invalid') // "0"
walletSnippet(undefined) // ""
walletSnippet('not-an-address') // "not-an-address"
```

## Performance Considerations

- Uses BigNumber.js for precise decimal arithmetic
- Implements efficient string processing algorithms
- Provides lazy evaluation where appropriate
- Includes memoization for expensive operations

## License

MIT License - see LICENSE file for details.
