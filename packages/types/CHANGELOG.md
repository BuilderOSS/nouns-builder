# @buildeross/types

## 0.4.0

### Minor Changes

- 2e875f5: Replace Tenderly with Alchemy. Transaction simulation now uses `eth_simulateV1` via Alchemy, and failed simulations show the decoded revert reason inline instead of a Tenderly dashboard link. `SimulationOutput` drops `id` and `url` and adds an optional `error`. The Tenderly RPC fallback (`getTenderlyRpcUrl`) is removed; RPC fallback is now Alchemy then Infura. `getAlchemyServerRpcUrl` is added for server-side calls (uses the optional `ALCHEMY_API_KEY`). `NEXT_PUBLIC_DISABLE_TENDERLY_SIMULATION` is renamed to `NEXT_PUBLIC_DISABLE_SIMULATION`.
- Bump all publishable packages from 0.3.2 to 0.4.0.
- 4090236: Simulation now pinpoints the call that fails a proposal when `eth_simulateV1` rejects the whole request (for example when the treasury can't fund a call's value), instead of returning a generic error. `SimulationOutput` adds an optional `notSimulated` flag for calls the simulation stopped before; `SimulationWarning` labels them separately, and the proposal review page shows the simulation error and failed/not simulated counts. Also fixes candidate submission failing with `InvalidAddressError` for candidates with 2+ transactions, and candidate transaction errors now stay visible in the status modal.

## 0.3.2

### Patch Changes

- Release improves dark mode, accessibility, responsive UI polish, and about-page/proposal UX across the monorepo while hardening theme-token consistency and upgrade-path handling.

## 0.3.1

### Patch Changes

- A large batch of updates adding new features (like proposal types, DAO tools, and UI improvements) alongside numerous bug fixes and performance enhancements. Overall, it refines functionality, expands DAO capabilities, and improves user experience across the app.

## 0.3.0

### Minor Changes

- Bump all publishable packages from 0.2.2 to 0.3.0.

## 0.2.2

### Patch Changes

- Sablier streams support, revamped Send Tokens (CSV + unified flow), fully redesigned Dashboard Feed with filters + actions, improved DAO search, playground upgrades, new proposal types, and tons of UX, performance & subgraph fixes.

## 0.2.1

### Patch Changes

- support propdates in our internal subgraph

## 0.2.0

### Minor Changes

- refactor modules to separate packages

## 0.1.3

### Patch Changes

- removed bridge modal

## 0.1.2

### Patch Changes

- Added property items API, fast DAO deployment, add artwork proposals, fixed auction settlement bugs, enhanced IPFS uploads, and improved UI

## 0.1.1

### Patch Changes

- fixed build + reduces package size
