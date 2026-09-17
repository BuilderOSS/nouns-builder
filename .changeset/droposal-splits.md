---
'@buildeross/create-proposal-ui': minor
---

Redesign the droposal builder and add 0xSplits revenue-split support.

- **Layout**: the flat field list is regrouped into scannable sections (Collection, Artwork, Sale, Revenue) with an Advanced section that holds edition type/size, royalty, mint-limit-per-address, and default admin. Defaults follow the friendlier Gnars pattern — open edition and unlimited mints per wallet unless changed in Advanced.
- **Revenue split (0xSplits)**: an optional "use revenue split" card deploys a 0xSplits v1 split from the connected wallet (`@0xsplits/splits-sdk`, wagmi-native) and sets it as the droposal funds recipient. Recipients are validated (addresses, unique, allocations totalling 100%) and visualized with a Sankey-style flow chart. Ported from the production Gnars pattern (r4topunk/gnars-website).
