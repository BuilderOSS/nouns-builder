# @buildeross/dao-ui

## 0.4.0

### Minor Changes

- Bump all publishable packages from 0.3.2 to 0.4.0.
- 0abc87c: Add a treasury composition view to the DAO Treasury tab: an allocation donut and curated asset rows (ETH plus a per-chain registry of common tokens and the DAO's clanker token, valued in USD) read via on-chain multicall; DAO NFT holdings read natively from the Builder subgraph; and an auction-revenue analytics chart. Replaces the Alchemy-dependent token/NFT balance sections with key-free, subgraph/RPC-backed equivalents.

### Patch Changes

- 5068fa1: Replace RPC contract-event watchers with polling of a cached subgraph-backed auction status API. Adds `liveAuctionsRequest`/`daosAuctionStatusRequest` to the SDK and `useAuctionStatus`/`useAuctionStatusByChain` hooks, removes the `VoteCast` watcher in favour of an optimistic vote on submit, dedupes `getSyncStatus` calls, sets per-chain viem polling intervals, and fixes the Infura RPC URL.
- Updated dependencies [fc1a9fc]
- Updated dependencies [c54bba0]
- Updated dependencies [fabd645]
- Updated dependencies [2e875f5]
- Updated dependencies [5ce3fdb]
- Updated dependencies [5068fa1]
- Updated dependencies
- Updated dependencies [90c09a7]
- Updated dependencies [4090236]
- Updated dependencies [d41d9e9]
  - @buildeross/ui@0.4.0
  - @buildeross/hooks@0.4.0
  - @buildeross/constants@0.4.0
  - @buildeross/utils@0.4.0
  - @buildeross/sdk@0.4.0
  - @buildeross/types@0.4.0
  - @buildeross/proposal-ui@0.4.0
  - @buildeross/ipfs-service@0.4.0
  - @buildeross/stores@0.4.0
  - @buildeross/zord@0.4.0

## 0.3.2

### Patch Changes

- Release improves dark mode, accessibility, responsive UI polish, and about-page/proposal UX across the monorepo while hardening theme-token consistency and upgrade-path handling.
- Updated dependencies
  - @buildeross/constants@0.3.2
  - @buildeross/hooks@0.3.2
  - @buildeross/ipfs-service@0.3.2
  - @buildeross/proposal-ui@0.3.2
  - @buildeross/sdk@0.3.2
  - @buildeross/stores@0.3.2
  - @buildeross/types@0.3.2
  - @buildeross/ui@0.3.2
  - @buildeross/utils@0.3.2
  - @buildeross/zord@0.3.2

## 0.3.1

### Patch Changes

- A large batch of updates adding new features (like proposal types, DAO tools, and UI improvements) alongside numerous bug fixes and performance enhancements. Overall, it refines functionality, expands DAO capabilities, and improves user experience across the app.
- Updated dependencies
  - @buildeross/constants@0.3.1
  - @buildeross/hooks@0.3.1
  - @buildeross/ipfs-service@0.3.1
  - @buildeross/proposal-ui@0.3.1
  - @buildeross/sdk@0.3.1
  - @buildeross/stores@0.3.1
  - @buildeross/types@0.3.1
  - @buildeross/ui@0.3.1
  - @buildeross/utils@0.3.1
  - @buildeross/zord@0.3.1

## 0.3.0

### Minor Changes

- Bump all publishable packages from 0.2.2 to 0.3.0.

### Patch Changes

- Updated dependencies
  - @buildeross/constants@0.3.0
  - @buildeross/hooks@0.3.0
  - @buildeross/ipfs-service@0.3.0
  - @buildeross/proposal-ui@0.3.0
  - @buildeross/sdk@0.3.0
  - @buildeross/stores@0.3.0
  - @buildeross/types@0.3.0
  - @buildeross/ui@0.3.0
  - @buildeross/utils@0.3.0
  - @buildeross/zord@0.3.0

## 0.2.2

### Patch Changes

- Sablier streams support, revamped Send Tokens (CSV + unified flow), fully redesigned Dashboard Feed with filters + actions, improved DAO search, playground upgrades, new proposal types, and tons of UX, performance & subgraph fixes.
- Updated dependencies
  - @buildeross/constants@0.2.2
  - @buildeross/hooks@0.2.2
  - @buildeross/ipfs-service@0.2.2
  - @buildeross/proposal-ui@0.2.2
  - @buildeross/sdk@0.2.2
  - @buildeross/stores@0.2.2
  - @buildeross/types@0.2.2
  - @buildeross/ui@0.2.2
  - @buildeross/utils@0.2.2
  - @buildeross/zord@0.2.2

## 0.2.1

### Patch Changes

- support propdates in our internal subgraph
- Updated dependencies
  - @buildeross/proposal-ui@0.2.1
  - @buildeross/hooks@0.2.1
  - @buildeross/sdk@0.2.1
  - @buildeross/constants@0.2.1
  - @buildeross/ipfs-service@0.2.1
  - @buildeross/stores@0.2.1
  - @buildeross/types@0.2.1
  - @buildeross/ui@0.2.1
  - @buildeross/utils@0.2.1
  - @buildeross/zord@0.2.1

## 0.2.0

### Minor Changes

- refactor modules to separate packages

### Patch Changes

- Updated dependencies
  - @buildeross/constants@0.2.0
  - @buildeross/hooks@0.2.0
  - @buildeross/ipfs-service@0.2.0
  - @buildeross/proposal-ui@0.2.0
  - @buildeross/sdk@0.2.0
  - @buildeross/stores@0.2.0
  - @buildeross/types@0.2.0
  - @buildeross/ui@0.2.0
  - @buildeross/utils@0.2.0
  - @buildeross/zord@0.2.0
