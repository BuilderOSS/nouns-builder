---
'@buildeross/constants': minor
'@buildeross/types': minor
'@buildeross/ui': minor
'@buildeross/create-proposal-ui': minor
---

Replace Tenderly with Alchemy. Transaction simulation now uses `eth_simulateV1` via Alchemy, and failed simulations show the decoded revert reason inline instead of a Tenderly dashboard link. `SimulationOutput` drops `id` and `url` and adds an optional `error`. The Tenderly RPC fallback (`getTenderlyRpcUrl`) is removed; RPC fallback is now Alchemy then Infura. `getAlchemyServerRpcUrl` is added for server-side calls (uses the optional `ALCHEMY_API_KEY`). `NEXT_PUBLIC_DISABLE_TENDERLY_SIMULATION` is renamed to `NEXT_PUBLIC_DISABLE_SIMULATION`.
