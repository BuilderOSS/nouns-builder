# feat(m2): Gnars DAO Proposal 61 — Milestone 2 (voting power, vote metrics, active members, feed urgency alerts)

This PR delivers Milestone 2 of Gnars DAO Proposal 61, bundling four independently-built feature tracks into a single integrated changeset. Each track was implemented and reviewed on its own branch, then squash-merged here in dependency order with a final cross-track integration fix. The work focuses on making governance and the activity feed more legible and actionable for members: explaining a viewer's voting power on a proposal, visualizing how a vote is progressing, surfacing who is actually active in the DAO, and warning members before time-sensitive auction/voting/execution windows close.

## Track A — Voting Power Explanation Component

**What:** A state-aware `VotingPowerExplainer` in the proposal vote panel that tells a viewer, in plain language, what their voting power is for the current proposal and what (if anything) they can do about it.

**Why:** Members frequently don't understand why they can or can't vote (not connected, delegated away, acquired tokens after the snapshot, etc.). This replaces the previous terse can/cannot-vote messages with case-specific copy and contextual CTAs.

**How:** A pure, dependency-free decision tree (`getVotingPowerCase`) maps connection, delegation, token ownership, and snapshot state to a `VotingPowerCase`, in a fixed priority order. The component wires that to `useVotes`, `useDaoMembership`, `useEnsData`, and the chain/dao stores, renders per-case copy, and links to the auction, the DAO activity tab, or the docs as appropriate. The snapshot reference uses the proposal's `timeCreated` (new prop threaded through `VoteStatus` from `ProposalActions`).

**How to test:** Open a proposal's vote panel in each state — disconnected, connected with no tokens, connected with delegated-away tokens, connected with votable power, and tokens acquired after the snapshot — and confirm the explainer copy and CTA match the state.

## Track B — Vote Metrics Components with Visualizations

**What:** A `VoteMetrics` module in proposal-ui with three custom-SVG, no-chart-library visualizations: `QuorumProgress` (FOR votes vs quorum with a threshold marker), `VoteTimeline` (cumulative for/against/abstain step chart built from per-vote timestamps), and `ParticipationHistory` (participation rate across the DAO's last ten proposals).

**Why:** Voters and proposers want a quick read on whether a proposal is on track to pass and how engaged the DAO has been recently, without parsing raw vote tables.

**How:** Pure rendering logic lives in `VoteMetrics.helper.ts` (fully unit-tested). `QuorumProgress` is integrated into `ProposalDetailsGrid`; `VoteTimeline` and `ParticipationHistory` into the Votes tab of `ProposalVotes`. This required adding a `timestamp` field to the `ProposalVote` GraphQL fragment; the generated SDK type is applied as an OPTIONAL `timestamp?` so it stays compatible with the voting-power track's existing fragment usages.

**How to test:** Open a proposal with several votes and confirm the quorum bar/marker, the timeline step chart (hover tooltips), and the participation-history chart render. Verify the timeline reflects vote order by timestamp.

## Track C — Active Member Detection

**What:** Detection and surfacing of "active" DAO members, with an Active badge on member cards and All/Active filter buttons (with counts) in the members list header.

**Why:** DAOs want to distinguish engaged members from passive token holders at a glance, for treasury, delegation, and outreach decisions.

**How:** Computed entirely client/API-side from existing subgraph data — no schema or codegen changes. A new `daoActivity` subgraph request, a pure `computeActiveMembers` helper, and a `useActiveMembers` SWR hook feed the UI. **Definition (configurable end-to-end, pending DAO validation):** a member is active if they voted on at least one of the DAO's last 5 completed (non-canceled) proposals OR placed an auction bid in the last 30 days. The list degrades gracefully — badges hide and the Active filter is disabled while activity loads or errors. v1 limitations: bidders are matched by address (a member bidding from a non-delegate wallet may be missed), vetoed proposals still count (only canceled are excluded), and there is no explicit Inactive state.

**How to test:** Open a DAO's About/Members surface. Confirm Active badges appear on members who voted recently or bid in the last 30 days, the All/Active filter toggles the list with correct counts, and the Active filter is disabled while activity data loads.

## Track D — Time-Based Feed Alerts (voting / auction urgency)

**What:** An `UrgencyAlerts` module pinned above the dashboard feed that warns members about time-sensitive windows: auction ending, voting ending, and proposal execution window expiring.

**Why:** Members miss deadlines because the feed doesn't foreground time pressure. These alerts make closing windows impossible to miss.

**How:** A pure `deriveUrgencyAlerts` helper derives alerts from dashboard DAO state with **configurable thresholds (pending DAO validation): warning < 24h, critical < 2h**. Each alert renders a live countdown, a level-styled pill (warning vs critical), a deep link to the relevant resource, and a session-scoped dismiss action. Wired into the apps/web `Dashboard` (single integration point covering home `/`, `/dashboard`, and the mobile feed tab). This track adds feed-ui test tooling (vitest/jsdom/testing-library, mirroring auction-ui) — the only lockfile change in this PR, an 18-line additive block scoped to feed-ui devDependencies.

**How to test:** With a connected wallet that has DAOs with auctions/proposals near their deadlines, open the dashboard and confirm urgency alerts appear above the feed, show a live countdown, switch styling under the 2h critical threshold, deep-link correctly, and stay dismissed for the session.

## Cross-track integration fix

One genuine integration defect was found and fixed (`fix(m2): cross-track integration`): feed-ui's production dts build and type-check failed in the combined checkout. Cause: (1) the feed-ui test devDeps had only been installed in the source worktree, so their node_modules symlinks were absent in the main checkout, and (2) feed-ui's tsconfig `types` array carried a spurious `"node"` entry that diverged from the repo-standard proposal-ui/dao-ui pattern. Resolved by materializing the deps via `pnpm install --frozen-lockfile` (lockfile UNCHANGED) and aligning the tsconfig `types` to `["@testing-library/jest-dom", "vitest/globals"]`.

## Testing

CI run in the integrated checkout (lockfile unchanged from base apart from the documented feed-ui devDeps block):

- `pnpm build:packages` — PASS (19/19 tasks)
- `pnpm type-check` — PASS (39/39 tasks)
- `pnpm test` — all new M2 tests green; feed-ui 26/26, dao-ui 14/14, utils 126/126, hooks 24/24, auction-ui 12/12, ui 10/10, ipfs-service 47/47, nouns-builder 22/22; proposal-ui 58 passing new+existing.

Pre-existing failures (NOT introduced by this PR): 6 tests fail with `TypeError: storage.getItem is not a function` from the shared test-fixtures `Providers`/zustand-persist under jsdom — `proposal-ui` ProposalCard (x2) + ProposalNavigation (x1), and `create-proposal-ui` MintGovernanceTokens (x3). Verified identical on a clean `staging` checkout (same files, same error); none of the failing test files, `test-fixtures/src/utils.tsx`, or `@buildeross/stores` are modified here.

## Screenshots

_To be added:_
- Voting Power Explainer — each viewer state (disconnected / no tokens / delegated away / can vote / acquired after snapshot)
- Vote Metrics — QuorumProgress, VoteTimeline, ParticipationHistory on a live proposal
- Active Members — Active badges + All/Active filter on the members list
- Feed Urgency Alerts — warning and critical states above the dashboard feed

🤖 Generated with [Claude Code](https://claude.com/claude-code)
