---
'@buildeross/constants': minor
'@buildeross/utils': minor
'@buildeross/sdk': patch
---

Authenticate server-side Alchemy calls with short-lived JWTs so the public `NEXT_PUBLIC_ALCHEMY_API_KEY` can be locked to our domains. Server code calls keyless Alchemy URLs with an `Authorization: Bearer` header carrying a JWT signed with `ALCHEMY_JWT_PRIVATE_KEY`/`ALCHEMY_JWT_KEY_ID`, falling back to `ALCHEMY_API_KEY` and then the public key. `@buildeross/utils/alchemyAuth` adds `getAlchemyServerAuthHeader`, `alchemyServerFetch` and `isAlchemyServerAuthConfigured`. `getRpcTransports` is added and `transports` put an authenticated Alchemy transport first on the server. `getAlchemyServerRpcUrl` now returns a keyless URL, and `getAlchemyServerNftUrl` and `ALCHEMY_PRICES_URL` are added. `RPC_URLS` only includes the public Alchemy URL in the browser.
