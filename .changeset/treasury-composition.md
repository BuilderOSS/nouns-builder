---
'@buildeross/dao-ui': minor
---

Add a treasury composition view to the DAO Treasury tab: an allocation donut and curated asset rows (ETH plus a per-chain registry of common tokens and the DAO's clanker token, valued in USD) read via on-chain multicall; DAO NFT holdings read natively from the Builder subgraph; and an auction-revenue analytics chart. Replaces the Alchemy-dependent token/NFT balance sections with key-free, subgraph/RPC-backed equivalents.
