---
'@buildeross/sdk': minor
'@buildeross/hooks': minor
'@buildeross/utils': minor
'@buildeross/constants': patch
---

Add global search across DAOs, profiles, proposals, candidates, votes and bids. The subgraph gains `proposalSearch`, `candidateSearch`, `voteSearch` and `bidSearch` fulltext indexes and a denormalized `dao` field on `ProposalVote` and `AuctionBid`. Adds `globalSearchRequest`, `globalAddressLookupRequest`, `globalAddressPrefixLookupRequest` and `globalTxLookupRequest` to the SDK, the `useGlobalSearch` hook, `classifyQuery` and `rankText`/`rankDao` (moved from the web search API) to utils, and an optional `NEXT_PUBLIC_SUBGRAPH_VERSION` override for testing a subgraph version before moving the dev/latest tags.
