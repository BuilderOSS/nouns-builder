---
'@buildeross/types': minor
'@buildeross/ui': patch
'@buildeross/create-proposal-ui': patch
'@buildeross/sdk': patch
'@buildeross/candidate-ui': patch
---

Simulation now pinpoints the call that fails a proposal when `eth_simulateV1` rejects the whole request (for example when the treasury can't fund a call's value), instead of returning a generic error. `SimulationOutput` adds an optional `notSimulated` flag for calls the simulation stopped before; `SimulationWarning` labels them separately, and the proposal review page shows the simulation error and failed/not simulated counts. Also fixes candidate submission failing with `InvalidAddressError` for candidates with 2+ transactions, and candidate transaction errors now stay visible in the status modal.
