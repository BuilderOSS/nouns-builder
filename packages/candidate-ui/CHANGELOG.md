# @buildeross/candidate-ui

## 0.4.0

### Minor Changes

- Bump all publishable packages from 0.3.2 to 0.4.0.

### Patch Changes

- 4090236: Simulation now pinpoints the call that fails a proposal when `eth_simulateV1` rejects the whole request (for example when the treasury can't fund a call's value), instead of returning a generic error. `SimulationOutput` adds an optional `notSimulated` flag for calls the simulation stopped before; `SimulationWarning` labels them separately, and the proposal review page shows the simulation error and failed/not simulated counts. Also fixes candidate submission failing with `InvalidAddressError` for candidates with 2+ transactions, and candidate transaction errors now stay visible in the status modal.
- Updated dependencies [fc1a9fc]
- Updated dependencies [c54bba0]
- Updated dependencies [fabd645]
- Updated dependencies [2e875f5]
- Updated dependencies [fea19c6]
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
  - @buildeross/create-proposal-ui@0.4.0
  - @buildeross/proposal-ui@0.4.0
  - @buildeross/stores@0.4.0
  - @buildeross/zord@0.4.0
