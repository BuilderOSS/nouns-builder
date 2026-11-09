# @buildeross/constants

## 0.4.0

### Minor Changes

- fabd645: Authenticate server-side Alchemy calls with short-lived JWTs so the public `NEXT_PUBLIC_ALCHEMY_API_KEY` can be locked to our domains. Server code calls keyless Alchemy URLs with an `Authorization: Bearer` header carrying a JWT signed with `ALCHEMY_JWT_PRIVATE_KEY`/`ALCHEMY_JWT_KEY_ID`, falling back to `ALCHEMY_API_KEY` and then the public key. `@buildeross/utils/alchemyAuth` adds `getAlchemyServerAuthHeader`, `alchemyServerFetch` and `isAlchemyServerAuthConfigured`. `getRpcTransports` is added and `transports` put an authenticated Alchemy transport first on the server. `getAlchemyServerRpcUrl` now returns a keyless URL, and `getAlchemyServerNftUrl` and `ALCHEMY_PRICES_URL` are added. `RPC_URLS` only includes the public Alchemy URL in the browser.
- 2e875f5: Replace Tenderly with Alchemy. Transaction simulation now uses `eth_simulateV1` via Alchemy, and failed simulations show the decoded revert reason inline instead of a Tenderly dashboard link. `SimulationOutput` drops `id` and `url` and adds an optional `error`. The Tenderly RPC fallback (`getTenderlyRpcUrl`) is removed; RPC fallback is now Alchemy then Infura. `getAlchemyServerRpcUrl` is added for server-side calls (uses the optional `ALCHEMY_API_KEY`). `NEXT_PUBLIC_DISABLE_TENDERLY_SIMULATION` is renamed to `NEXT_PUBLIC_DISABLE_SIMULATION`.
- Bump all publishable packages from 0.3.2 to 0.4.0.

### Patch Changes

- 5ce3fdb: Add global search across DAOs, profiles, proposals, candidates, votes and bids. The subgraph gains `proposalSearch`, `candidateSearch`, `voteSearch` and `bidSearch` fulltext indexes and a denormalized `dao` field on `ProposalVote` and `AuctionBid`. Adds `globalSearchRequest`, `globalAddressLookupRequest`, `globalAddressPrefixLookupRequest` and `globalTxLookupRequest` to the SDK, the `useGlobalSearch` hook, `classifyQuery` and `rankText`/`rankDao` (moved from the web search API) to utils, and an optional `NEXT_PUBLIC_SUBGRAPH_VERSION` override for testing a subgraph version before moving the dev/latest tags.
- 5068fa1: Replace RPC contract-event watchers with polling of a cached subgraph-backed auction status API. Adds `liveAuctionsRequest`/`daosAuctionStatusRequest` to the SDK and `useAuctionStatus`/`useAuctionStatusByChain` hooks, removes the `VoteCast` watcher in favour of an optimistic vote on submit, dedupes `getSyncStatus` calls, sets per-chain viem polling intervals, and fixes the Infura RPC URL.
- Updated dependencies [2e875f5]
- Updated dependencies
- Updated dependencies [4090236]
  - @buildeross/types@0.4.0

## 0.3.2

### Patch Changes

- Release improves dark mode, accessibility, responsive UI polish, and about-page/proposal UX across the monorepo while hardening theme-token consistency and upgrade-path handling.
- Updated dependencies
  - @buildeross/types@0.3.2

## 0.3.1

### Patch Changes

- A large batch of updates adding new features (like proposal types, DAO tools, and UI improvements) alongside numerous bug fixes and performance enhancements. Overall, it refines functionality, expands DAO capabilities, and improves user experience across the app.
- Updated dependencies
  - @buildeross/types@0.3.1

## 0.3.0

### Minor Changes

- Bump all publishable packages from 0.2.2 to 0.3.0.

### Patch Changes

- Updated dependencies
  - @buildeross/types@0.3.0

## 0.2.2

### Patch Changes

- Sablier streams support, revamped Send Tokens (CSV + unified flow), fully redesigned Dashboard Feed with filters + actions, improved DAO search, playground upgrades, new proposal types, and tons of UX, performance & subgraph fixes.
- Updated dependencies
  - @buildeross/types@0.2.2

## 0.2.1

### Patch Changes

- support propdates in our internal subgraph
- Updated dependencies
  - @buildeross/types@0.2.1

## 0.2.0

### Minor Changes

- refactor modules to separate packages

### Patch Changes

- Updated dependencies
  - @buildeross/types@0.2.0

## 0.1.3

### Patch Changes

- removed bridge modal
- Updated dependencies
  - @buildeross/types@0.1.3

## 0.1.2

### Patch Changes

- Added property items API, fast DAO deployment, add artwork proposals, fixed auction settlement bugs, enhanced IPFS uploads, and improved UI
- Updated dependencies
  - @buildeross/types@0.1.2

## 0.1.1

### Patch Changes

- fixed build + reduces package size
- Updated dependencies
  - @buildeross/types@0.1.1
