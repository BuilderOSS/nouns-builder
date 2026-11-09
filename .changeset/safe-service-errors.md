---
'@buildeross/utils': patch
---

Stop reporting Safe Transaction Service failures as "not found" or "not an owner". Add `lookupSafeInfo`, `SafeServiceError` and `isSafeServiceError`: `lookupSafeInfo` resolves to `null` only when the Safe doesn't exist and throws `SafeServiceError` on network errors, rate limits and other non-404 responses. `isOwnerOfSafe`, `getSafeOwners` and `isSafeAddress` now throw `SafeServiceError` in those cases instead of returning `false`/`[]`. `getSafeInfo` keeps returning `null` for both.
