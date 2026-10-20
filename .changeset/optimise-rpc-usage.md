---
'@buildeross/sdk': minor
'@buildeross/hooks': minor
'@buildeross/constants': patch
'@buildeross/utils': patch
'@buildeross/auction-ui': patch
'@buildeross/proposal-ui': patch
'@buildeross/dao-ui': patch
---

Replace RPC contract-event watchers with polling of a cached subgraph-backed auction status API. Adds `liveAuctionsRequest`/`daosAuctionStatusRequest` to the SDK and `useAuctionStatus`/`useAuctionStatusByChain` hooks, removes the `VoteCast` watcher in favour of an optimistic vote on submit, dedupes `getSyncStatus` calls, sets per-chain viem polling intervals, and fixes the Infura RPC URL.
