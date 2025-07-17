# @buildeross/utils

Shared utility functions for the Builder OSS project.

## Installation

This package is part of the Builder OSS monorepo and is installed as a workspace dependency.

## Usage

```typescript
import { 
  walletSnippet, 
  formatCryptoVal, 
  slugify, 
  formatDuration 
} from '@buildeross/utils'

// Or import from specific modules
import { walletSnippet } from '@buildeross/utils/helpers'
import { formatCryptoVal } from '@buildeross/utils/numbers'
```

## Utilities

This package exports common utility functions used across the Builder OSS ecosystem:

- **helpers.ts**: General utility functions like `walletSnippet`, `isEmpty`, `flatten`
- **numbers.ts**: Number formatting utilities like `formatCryptoVal`, `numberFormatter`
- **slugify.ts**: String slugification utilities
- **formatDuration.ts**: Duration formatting utilities
- **wagmi/**: Wagmi-specific utilities for chains and transports
- **yup/**: Yup schema validation utilities
- **proposalState.ts**: Proposal state utilities
- **ens.ts**: ENS utilities
- **gradient.ts**: Gradient utilities
- **sanitize.ts**: Sanitization utilities