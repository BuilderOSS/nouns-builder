# Optimise RPC usage: replace chain event polling with cached subgraph polling

## Context

The app finds new bids and auctions with wagmi `useWatchContractEvent`. Each watcher runs `eth_newFilter` + `eth_getFilterChanges` at viem's default polling interval. Nothing sets `pollingInterval`, so that's **1s on Base/Optimism** (2s block time) and 4s on mainnet. We pay for every call.

| Watcher                           | RPC cost today                                        |
| --------------------------------- | ----------------------------------------------------- |
| Auction page (`useAuctionEvents`) | 2 filter polls per open tab                           |
| Bid modal (`useAuctionEvents`)    | 2 filter polls while open                             |
| Dashboard (`DaoAuctionCard`)      | 2 filter polls **per DAO card**, hidden ones included |
| Proposal page (`VoteStatus`)      | 1 `VoteCast` filter poll, with no `chainId`           |

`useAuctionEvents` and `VoteStatus` also pass an inline `onLogs`, so every re-render tears the filter down and rebuilds it. Events can be missed in the gap.

On the dashboard, each event refreshes `/api/dashboard`, but that route returns a 5-minute Redis cache (`dashboardService.ts:18`). Those RPC polls do nothing useful today.

Goldsky subgraphs bill for indexing worker hours, not queries, so polling the subgraph is much cheaper. The catch is a **10 req/s limit, which we treat as shared across all users**. Browsers can't poll Goldsky directly. Polling has to go through a cached server route, so subgraph load stays the same however many people are watching.

Outcome:

- Zero RPC event filters in the app.
- A single cached snapshot per chain answers "what changed in auctions" for every viewer.
- Polling runs every 5s while an auction is live and the tab is visible.
- Plus some general RPC tuning and small bug fixes.

## Step 0: Worktree

```bash
git -C /Users/dan13ram/code/nouns/builder/staging fetch origin staging
git -C /Users/dan13ram/code/nouns/builder/staging worktree add -b feat/optimise-rpc-usage /Users/dan13ram/code/nouns/builder/optimise-rpc-usage origin/staging
cp /Users/dan13ram/code/nouns/builder/staging/apps/web/.env.local /Users/dan13ram/code/nouns/builder/optimise-rpc-usage/apps/web/.env.local
pnpm install   # in the new worktree
```

Copy this plan into the worktree as `docs/plans/optimise-rpc-usage.md` (or the PR description) so it travels with the branch.

## Design: per-chain live-auction snapshot

The server makes **one subgraph query per chain every ~3s**, no matter how many viewers or DAOs there are. Worst case is 5 chains × ⅓ rps ≈ 1.7 req/s, well under 10. The rest of the budget is left for the existing direct-from-browser subgraph traffic.

### 1. Subgraph query and SDK wrapper (`packages/sdk`)

New file `src/subgraph/queries/liveAuctions.graphql`:

```graphql
query liveAuctions($first: Int!, $skip: Int!) {
  auctions(
    where: { settled: false }
    first: $first
    skip: $skip
    orderBy: endTime
    orderDirection: desc
  ) {
    id
    endTime
    extended
    settled
    bidCount
    highestBid {
      amount
      bidder
    }
    token {
      tokenId
      name
      image
    }
    dao {
      id
      auctionAddress
    }
  }
  _meta {
    block {
      number
    }
  }
}
```

- Add a batched `daosCurrentAuction(ids)` query (`daos(where: { id_in })` → `currentAuction`). It's the fallback for DAOs with no unsettled auction (paused, or just settled); one request covers every missing DAO, so a dashboard full of paused DAOs costs one call, not one per DAO.
- Put the shared fields in a fragment `fragments/AuctionStatus.graphql`.
- Run `pnpm --filter @buildeross/sdk codegen` to regenerate `sdk.generated.ts`. _(Implemented: the pinned schema `0.1.18` no longer exists on Goldsky, so `codegen.yml` now points at the sepolia `latest` deployment; the regenerated output is purely additive.)_
- New wrapper `src/subgraph/requests/liveAuctions.ts`. It pages with `first: 1000`, stops when a page comes back short, and returns `Record<daoId, AuctionStatus>` plus `syncedBlock`. Export it from the subgraph index.
- Fix `requests/sync.ts`: `getSyncStatus` returns the promise without `await`, so its `catch` never runs. Also dedupe concurrent `getSyncStatus` calls per chain with an in-flight promise map. `executeAppTransaction` polls every 2s, and duplicate calls burn the rate budget.

### 2. Server service and route (`apps/web`)

**`src/services/auctionStatusService.ts`**, following the patterns in `coinPriceService.ts` (in-process cache + in-flight dedupe) and `dashboardService.ts` (Redis lock):

`getLiveAuctionSnapshot(chainId)` checks three layers in order:

1. The in-process cache (TTL 3s).
2. Redis `auction-status:{chain}:snapshot` (`SET … EX 3`).
3. A fetch from the subgraph. A Redis lock (`SET NX PX 5000`) makes sure only one instance refreshes; the others wait about 300ms and re-read.

If the subgraph fails, serve the last good snapshot (keep a longer-lived `:stale` key, around 60s) and flag it `stale: true`.

`getDaoAuctionStatus(chainId, daoId)`:

- Look the DAO up in the snapshot first.
- On a miss, use the batched `daosCurrentAuction` fallback, cached per DAO in memory and Redis (`MGET`) for 15s.

Use the `PUBLIC_IS_TESTNET` key prefix the same way `dashboardService` does.

**`src/pages/api/auction/status.ts`**: `GET ?chainId=…&daos=0xa,0xb` (at most 100 per call).

- Returns `{ syncedBlock, stale, auctions: { [daoId]: AuctionStatus | null } }`.
- Validate the input by hand, matching the other API routes (`apps/web` has no zod dependency): chainId must be in `PUBLIC_DEFAULT_CHAINS`, addresses lowercased and checked with `isAddress`.
- Header: `Cache-Control: public, s-maxage=3, stale-while-revalidate=5`.
- Wrap it in `withCors()(withRateLimit({ maxRequests: 120, windowSeconds: 60, keyPrefix: 'auction-status' }))`, the same pattern as `api/auctionHistory/[token].ts`.

### 3. Client hooks (`packages/hooks`, `packages/constants`)

Add `SWR_KEYS.AUCTION_STATUS` to `packages/constants/src/swrKeys.ts`.

**`useAuctionStatus({ chainId, daos, enabled })`**:

- SWR key: `[AUCTION_STATUS, chainId, sortedDaos.join(',')]`.
- Fetches `${BASE_URL}/api/auction/status`.
- `refreshInterval` is a function: **5s** if any returned auction is live (`!settled`, and `endTime > now` or ended within the last ~60s while awaiting settlement), otherwise **30s**.
- Uses SWR defaults `refreshWhenHidden: false` and `dedupingInterval: 2000`.

### 4. Replace the watchers

**`packages/auction-ui/src/hooks/useAuctionEvents.ts`**:

- Rewrite it on top of `useAuctionStatus`. Keep the same signature and name so `Auction.tsx:86` and `feed-ui/src/Modals/BidModal.tsx:91` don't change.
- Keep the previous snapshot in a `useRef` and diff each new one:

| Change in snapshot                 | Action                                                                                                                           |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `auction.id` changed (new auction) | Mutate `AUCTION` and `AUCTION_BIDS` for the new tokenId, then call `onAuctionCreated(tokenId)`                                   |
| `bidCount` or `highestBid` changed | Mutate `AUCTION` and `AUCTION_BIDS`, then call `onAuctionBidCreated`                                                             |
| `settled` flipped                  | Mutate `AUCTION`. This also fixes the paused-settle gap: `settleAuction` emits no `AuctionCreated`, so the page used to go stale |

- Drop `awaitSubgraphSync`, because the data already comes from the subgraph.
- Keep the callbacks in refs, so nothing gets rebuilt on re-render.
- `useCurrentAuction` stays as an RPC multicall, because `paused` isn't in the subgraph. It now runs only on mount, on focus, and when the status changes.

**Dashboard** (`apps/web/src/modules/dashboard/Dashboard.tsx`, `DaoAuctionCard.tsx`):

- Remove both `useWatchContractEvent` calls and the `setTimeout` / `handleMutate` plumbing.
- In `Dashboard`, group the DAOs by `chainId` and call `useAuctionStatus` once per chain. That's at most 5 polls in total, not 2 × N.
- Overlay the live status onto each DAO's `currentAuction` (endTime, highestBid, token) in `Dashboard` via `withLiveAuctions` (`liveAuction.ts`), so the cards, `BidActionButton` and `AuctionPaused` all update without touching the 5-minute Redis dashboard cache. Uses a multi-chain `useAuctionStatusByChain` hook (one SWR key, one request per chain).
- Change the card `key` from `endTime` to the auction id, so a time extension doesn't remount the card.

**`VoteStatus.tsx`**:

- Remove the `VoteCast` watcher. It only ever looked for the connected user's own vote.
- `VoteModal.tsx` already waits for the receipt and subgraph sync (inside `executeAppTransaction`), then mutates `PROPOSAL`.
- Move the optimistic `sessionStorage` vote write into the VoteModal success path, where the choice and reason are known. Pass it up through `onSuccess(vote)` so `VoteStatus` can call `setVote`. That keeps the fallback for when subgraph sync times out.

### 5. General RPC tuning

- **Polling interval:** `apps/web/src/utils/clientConfig.ts` `createConfig({ pollingInterval: { [BASE]: 2_000, [BASE_SEPOLIA]: 2_000, [OPTIMISM]: 2_000, [ETHEREUM]: 4_000, [SEPOLIA]: 4_000 } })`. This halves receipt-wait polling on L2s. Do the same in `packages/utils/src/wagmi/serverConfig.ts`.
- **useSplitPayout:** in `packages/hooks/src/useSplitPayout.ts:151`, remove `refetchInterval: 12_000`. Instead, refetch explicitly after the split/distribute transaction completes. Check how the callers use it first.
- **React Query defaults:** in `apps/web/src/pages/_app.tsx:82`, raise `staleTime` from 5_000 to 30_000. Focus refetches then only fire for data older than 30s. Before landing, grep for post-transaction refreshes that relied on the short staleTime (`refetch()` / `invalidateQueries` already bypass it).
- **SWR defaults:** in `_app.tsx:318`, add `focusThrottleInterval: 30_000` to `SWRConfig`. Add `revalidateOnFocus: false` to chain reads that never change: `useEnsName/Address/Avatar`, `contractVersion`, and `useAvailableUpgrade`.
- **Stale comment:** fix the comment at `packages/dao-ui/src/components/Treasury/TreasuryComposition.tsx:142`. It says there's a global 5s refetchInterval, which isn't true.

### 6. Small bug fixes

- `packages/auction-ui/src/components/CurrentAuction/CurrentAuction.tsx:49`: replace the `contractVersion` `useReadContract` (no `chainId`) with the existing `useContractVersion` hook, which passes `chainId` and caches for 5 minutes.
- `packages/constants/src/infura.ts`: it builds an `*.g.alchemy.com` URL with the Infura key. Change it to `https://${network}.infura.io/v3/${INFURA_API_KEY}`, and check the network slugs against Infura's docs.
- `getSyncStatus` missing `await`, already covered in §1.

## Out of scope (note in the PR)

- Other subgraph queries still go straight from the browser to Goldsky and count against the same 10 rps. That's a follow-up if they need to move behind a proxy.
- Coin price polling (10s, served from the server cache) and the server-side one-off RPC reads stay as they are.

## Verification

1. **Unit tests** with vitest, following the existing `*.test.ts` patterns:
   - `auctionStatusService.test.ts`: a cache hit makes no subgraph call; concurrent calls share one fetch; the lock path; the stale fallback on error; a snapshot miss falls back to `daoCurrentAuction`.
   - The `useAuctionEvents` diff logic: a new id, a changed bidCount and a settled flip each fire the right mutate and callback, and an unchanged snapshot fires nothing.
   - Update `executeAppTransaction.test.ts` if `sync.ts` behaviour changes.
2. **Checks:** run `pnpm lint`, `pnpm type-check` (or the turbo equivalents) and `pnpm test` from the worktree root.
3. **Manual test:** run `pnpm dev` and open a live Base auction page in the browser pane.
   - In the network panel: no `eth_newFilter`, `eth_getFilterChanges` or `eth_getLogs` calls; `/api/auction/status` every 5s, with every 30s once settled; polling stops while the tab is hidden.
   - Place a bid from a second wallet or tab (on Base Sepolia). It should show within about 5s plus indexing lag.
   - Settle the auction. The page should navigate to the new token through `onAuctionCreated`.
   - Dashboard with several DAOs: one status request per chain every 5s, and no RPC filter calls.
   - Proposal page: vote, and the vote shows without a `VoteCast` filter.
4. **Server load:** hit `/api/auction/status` from several tabs at once and check the server logs. There should be at most one subgraph `liveAuctions` call per chain per ~3s.
