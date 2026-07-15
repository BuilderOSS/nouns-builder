---
'@buildeross/create-proposal-ui': minor
---

Add 0xSplits support to the droposal builder: an optional "split payout among multiple recipients" section that deploys a 0xSplits v1 split from the connected wallet and sets it as the droposal funds recipient. Recipients are validated (addresses, unique, allocations totalling 100%) before creation. Ported from the production Gnars pattern (r4topunk/gnars-website), adapted to be wagmi-native.
