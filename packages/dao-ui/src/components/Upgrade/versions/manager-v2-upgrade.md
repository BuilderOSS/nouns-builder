## Summary

This proposal upgrades the Builder Manager contract to v2.0.0.

It upgrades the manager proxy, registers Token/Auction/Governor upgrade mappings for both 1.1.0 and 1.2.0 bases, and transfers manager ownership to the Gnosis Safe.

### Auction Rewards Policy Update

The new Auction implementation sets:

- `builderRewardsBPS = 250` (2.5%)
- `referralRewardsBPS = 250` (2.5%)

For upgraded DAOs, settled auction proceeds route these splits through protocol rewards before the remainder is sent to treasury.

### Included Calls

1. `upgradeTo(address)` on Manager proxy
2. `registerUpgrade(address,address)` for Token 1.1.0 -> new Token impl
3. `registerUpgrade(address,address)` for Token 1.2.0 -> new Token impl
4. `registerUpgrade(address,address)` for Auction 1.1.0 -> new Auction impl
5. `registerUpgrade(address,address)` for Auction 1.2.0 -> new Auction impl
6. `registerUpgrade(address,address)` for Governor 1.1.0 -> new Governor impl
7. `registerUpgrade(address,address)` for Governor 1.2.0 -> new Governor impl
8. `safeTransferOwnership(address)` to `0x6257eDA33CB66EdA10354ebCf6Ab49e9E7558739` (Gnosis Safe)

### Notes

MetadataRenderer and Treasury implementations are unchanged in this release.
