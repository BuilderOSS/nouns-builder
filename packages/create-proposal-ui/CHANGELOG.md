# @buildeross/create-proposal-ui

## 0.4.0

### Minor Changes

- 2e875f5: Replace Tenderly with Alchemy. Transaction simulation now uses `eth_simulateV1` via Alchemy, and failed simulations show the decoded revert reason inline instead of a Tenderly dashboard link. `SimulationOutput` drops `id` and `url` and adds an optional `error`. The Tenderly RPC fallback (`getTenderlyRpcUrl`) is removed; RPC fallback is now Alchemy then Infura. `getAlchemyServerRpcUrl` is added for server-side calls (uses the optional `ALCHEMY_API_KEY`). `NEXT_PUBLIC_DISABLE_TENDERLY_SIMULATION` is renamed to `NEXT_PUBLIC_DISABLE_SIMULATION`.
- fea19c6: Redesign the droposal builder and add 0xSplits revenue-split support.

  - **Layout**: the flat field list is regrouped into scannable sections (Collection, Artwork, Sale, Revenue) with an Advanced section that holds edition type/size, royalty, mint-limit-per-address, and default admin. Defaults follow the friendlier Gnars pattern — open edition and unlimited mints per wallet unless changed in Advanced.
  - **Revenue split (0xSplits)**: an optional "use revenue split" card deploys a 0xSplits v1 split from the connected wallet (`@0xsplits/splits-sdk`, wagmi-native) and sets it as the droposal funds recipient. Recipients are validated (addresses, unique, allocations totalling 100%) and visualized with a Sankey-style flow chart. Ported from the production Gnars pattern (r4topunk/gnars-website).

- Bump all publishable packages from 0.3.2 to 0.4.0.

### Patch Changes

- 4090236: Simulation now pinpoints the call that fails a proposal when `eth_simulateV1` rejects the whole request (for example when the treasury can't fund a call's value), instead of returning a generic error. `SimulationOutput` adds an optional `notSimulated` flag for calls the simulation stopped before; `SimulationWarning` labels them separately, and the proposal review page shows the simulation error and failed/not simulated counts. Also fixes candidate submission failing with `InvalidAddressError` for candidates with 2+ transactions, and candidate transaction errors now stay visible in the status modal.
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
  - @buildeross/swap@0.4.0
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
