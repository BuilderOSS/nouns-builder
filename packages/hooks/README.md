# @buildeross/hooks

Collection of reusable React hooks for BuilderOSS applications, providing blockchain interactions, UI utilities, and data management.

## Installation

```bash
pnpm install @buildeross/hooks
```

## Features

- **Blockchain Hooks**: DAO auctions, governance, token interactions
- **UI Utilities**: Countdown timers, scroll detection, pagination
- **Data Management**: ENS resolution, NFT metadata, token balances
- **File Handling**: IPFS artwork upload and preview
- **Type-Safe**: Full TypeScript support with proper typing
- **Optimized**: Built for performance with proper dependency management

## Usage

### Blockchain Hooks

#### useDaoAuction

Hook for fetching current DAO auction data.

```tsx
import { useDaoAuction } from '@buildeross/hooks'

function AuctionComponent() {
  const auction = useDaoAuction({
    collectionAddress: '0x...',
    auctionAddress: '0x...',
    chainId: CHAIN_ID.ETHEREUM,
  })

  return (
    <div>
      <p>Current Bid: {auction.highestBid} ETH</p>
      <p>Token ID: {auction.tokenId?.toString()}</p>
      <p>Time Remaining: {auction.endTime}</p>
    </div>
  )
}
```

#### useVotes

Hook for checking user's voting power and delegation status.

```tsx
import { useVotes } from '@buildeross/hooks'

function VotingPower() {
  const votes = useVotes({
    chainId: CHAIN_ID.ETHEREUM,
    collectionAddress: '0x...',
    governorAddress: '0x...',
    signerAddress: '0x...',
  })

  return (
    <div>
      <p>Votes: {votes.votes?.toString()}</p>
      <p>Can Propose: {votes.hasThreshold ? 'Yes' : 'No'}</p>
      <p>Delegating: {votes.isDelegating ? 'Yes' : 'No'}</p>
    </div>
  )
}
```

#### useDaoMembership

Hook for checking DAO membership and token ownership.

```tsx
import { useDaoMembership } from '@buildeross/hooks'

function MembershipStatus() {
  const membership = useDaoMembership({
    chainId: CHAIN_ID.ETHEREUM,
    tokenAddress: '0x...',
    userAddress: '0x...',
  })

  return (
    <div>
      <p>Is Member: {membership.isMember ? 'Yes' : 'No'}</p>
      <p>Token Count: {membership.tokenCount}</p>
    </div>
  )
}
```

### UI Utility Hooks

#### useCountdown

Hook for countdown timers with formatted display.

```tsx
import { useCountdown, useIsMounted } from '@buildeross/hooks'

function CountdownTimer() {
  const isMounted = useIsMounted()
  const countdown = useCountdown(endTimestamp, () => console.log('Timer ended!'))

  if (!isMounted) return null

  return (
    <div>
      <p>{countdown.countdownString}</p>
      <p>Ended: {countdown.isEnded ? 'Yes' : 'No'}</p>
    </div>
  )
}
```

#### usePagination

Hook for handling pagination state and navigation.

```tsx
import { usePagination } from '@buildeross/hooks'

function PaginatedList() {
  const pagination = usePagination({
    totalItems: 100,
    itemsPerPage: 10,
  })

  return (
    <div>
      <button onClick={pagination.previousPage}>Previous</button>
      <span>
        Page {pagination.currentPage} of {pagination.totalPages}
      </span>
      <button onClick={pagination.nextPage}>Next</button>
    </div>
  )
}
```

#### useScrollDirection

Hook for detecting scroll direction.

```tsx
import { useScrollDirection } from '@buildeross/hooks'

function NavigationBar() {
  const scrollDirection = useScrollDirection()

  return (
    <nav
      style={{
        transform: scrollDirection === 'down' ? 'translateY(-100%)' : 'translateY(0)',
      }}
    >
      Navigation content
    </nav>
  )
}
```

### Data Hooks

#### useEnsData

Hook for resolving ENS names and avatars.

```tsx
import { useEnsData } from '@buildeross/hooks'

function UserProfile({ address }) {
  const ens = useEnsData(address)

  return (
    <div>
      <img src={ens.avatar} alt="Avatar" />
      <p>{ens.name || address}</p>
    </div>
  )
}
```

#### useTokenMetadata

Hook for fetching token metadata.

```tsx
import { useTokenMetadata } from '@buildeross/hooks'

function TokenInfo() {
  const metadata = useTokenMetadata({
    contractAddress: '0x...',
    tokenId: '1',
    chainId: CHAIN_ID.ETHEREUM,
  })

  return (
    <div>
      <h3>{metadata.name}</h3>
      <p>{metadata.description}</p>
      <img src={metadata.image} alt={metadata.name} />
    </div>
  )
}
```

#### useNFTBalance

Hook for checking NFT balance of an address.

```tsx
import { useNFTBalance } from '@buildeross/hooks'

function NFTBalance() {
  const balance = useNFTBalance({
    address: '0x...',
    contractAddress: '0x...',
    chainId: CHAIN_ID.ETHEREUM,
  })

  return <p>NFT Balance: {balance.toString()}</p>
}
```

### File Handling Hooks

#### useArtworkUpload

Hook for uploading artwork to IPFS.

```tsx
import { useArtworkUpload } from '@buildeross/hooks'

function ArtworkUploader() {
  const { upload, isUploading, error } = useArtworkUpload()

  const handleUpload = async (file: File) => {
    const result = await upload(file)
    console.log('IPFS Hash:', result.hash)
  }

  return (
    <div>
      <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
      {isUploading && <p>Uploading...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  )
}
```

#### useArtworkPreview

Hook for generating artwork previews.

```tsx
import { useArtworkPreview } from '@buildeross/hooks'

function ArtworkPreview({ file }) {
  const preview = useArtworkPreview(file)

  return preview ? <img src={preview} alt="Preview" /> : null
}
```

### Utility Hooks

#### useInterval

Hook for setting up intervals with automatic cleanup.

```tsx
import { useInterval } from '@buildeross/hooks'

function Timer() {
  const [count, setCount] = useState(0)

  useInterval(() => {
    setCount((c) => c + 1)
  }, 1000)

  return <p>Count: {count}</p>
}
```

#### useTimeout

Hook for setting up timeouts with automatic cleanup.

```tsx
import { useTimeout } from '@buildeross/hooks'

function DelayedMessage() {
  const [show, setShow] = useState(false)

  useTimeout(() => {
    setShow(true)
  }, 3000)

  return show ? <p>Hello after 3 seconds!</p> : null
}
```

#### useIsMounted

Hook for preventing hydration mismatches.

```tsx
import { useIsMounted } from '@buildeross/hooks'

function ClientOnlyComponent() {
  const isMounted = useIsMounted()

  if (!isMounted) return null

  return <div>This only renders on client</div>
}
```

#### usePrevious

Hook for accessing previous values.

```tsx
import { usePrevious } from '@buildeross/hooks'

function ValueTracker({ value }) {
  const previousValue = usePrevious(value)

  return (
    <div>
      <p>Current: {value}</p>
      <p>Previous: {previousValue}</p>
    </div>
  )
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

- `@buildeross/ipfs-service` - IPFS utilities
- `@buildeross/constants` - Shared constants
- `@buildeross/sdk` - Core SDK and contract ABIs
- `@buildeross/types` - TypeScript types
- `@buildeross/utils` - Utility functions
- `dayjs` - Date manipulation

### Peer Dependencies

- `react` ^19.1.0
- `react-dom` ^19.1.0
- `viem` ^2.30.0
- `swr` ^2.3.3
- `next` ^15.3.2
- `wagmi` ^2.15.4

## Hook Categories

### Blockchain Interaction

- `useDaoAuction` - Current auction data
- `useDaoMembership` - DAO membership status
- `useVotes` - Voting power and delegation
- `useDelegate` - Delegation management
- `useDelayedGovernance` - Governance timing
- `useTokenBalances` - Token balance queries
- `useIsContract` - Contract detection
- `useIsGnosisSafe` - Gnosis Safe detection

### UI & UX

- `useCountdown` - Countdown timers
- `usePagination` - Pagination state
- `useScrollDirection` - Scroll detection
- `useBridgeModal` - Bridge modal management

### Data & Metadata

- `useEnsData` - ENS resolution
- `useTokenMetadata` - Token metadata
- `useNftMetadata` - NFT metadata
- `useNFTBalance` - NFT balance checking
- `useDecodedTransactions` - Transaction decoding

### File Handling

- `useArtworkUpload` - IPFS artwork upload
- `useArtworkPreview` - Artwork preview generation

### Utilities

- `useInterval` - Interval management
- `useTimeout` - Timeout management
- `useIsMounted` - Mount detection
- `usePrevious` - Previous value tracking

## Type Safety

All hooks are fully typed with TypeScript and include proper return type definitions. Generic hooks accept type parameters for additional type safety.

## Best Practices

1. Always use `useIsMounted()` with `useCountdown()` to prevent hydration errors
2. Handle loading states for blockchain hooks
3. Provide fallbacks for undefined data
4. Use proper error boundaries for hooks that can fail
5. Cleanup intervals and timeouts automatically handled

## License

MIT License - see LICENSE file for details.
