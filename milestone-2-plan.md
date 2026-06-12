# Milestone 2 — Plano de desenvolvimento

> Proposta 61 (Gnars DAO / Base): "Enhance the Official Builder Template and Upstream Feature Batches"
> M2 = Day ~60, 1.25 ETH, 4 feature tracks de menor complexidade.
> Repo alvo: BuilderOSS/nouns-builder (monorepo Turborepo, Next.js 15 pages router, React 19, wagmi 2, SWR, Vanilla Extract + zord, Vitest).

## TL;DR

4 tracks, ~4 semanas. Ordem: A (Voting Power Explanation) → B (Vote Metrics) → C (Active Members) → D (Feed Alerts). Cada track fecha com: PR upstream + doc curto + link público (exigência da proposta). Maior risco: C pode exigir mudança de schema no subgraph (ciclo de deploy/indexação lento) — validar na semana 1.

---

## Track A — Voting Power Explanation Component

**O que é:** componente que explica ao usuário POR QUE ele pode/não pode votar em uma proposal (estados confusos hoje viram apenas "You must hold at least one token to vote").

**Base existente:**
- `packages/hooks/src/useVotes.ts` — já retorna `votes`, `isDelegating`, `delegatedTo`, `getPastVotes(address, timestamp)` (checkpoint), `proposalVotesRequired`
- `packages/proposal-ui/src/components/ProposalActions/VoteStatus/VoteStatus.tsx:125-128` — ponto de integração

**Estados a cobrir (árvore de decisão):**
1. Sem tokens → "compre/ganhe um token"
2. Token adquirido APÓS o snapshot da proposal (`getPastVotes = 0`, `getVotes > 0`) → estado mais confuso, prioridade #1
3. Delegou para outro endereço → mostrar `delegatedTo` + CTA para re-delegar
4. É delegate de terceiros → mostrar poder agregado
5. Já votou → mostrar voto + peso

**Entregáveis:** componente em `packages/proposal-ui` + integração no VoteStatus + testes Vitest dos 5 estados + doc.
**Esforço:** S-M (3-4 dias). Sem dependência de subgraph.

## Track B — Vote Metrics + Visualizações

**O que é:** componentes de métricas de votação com visualização (distribuição, participação, progresso de quorum).

**Base existente:**
- `packages/proposal-ui/src/components/ProposalDetailsGrid/` — tiles For/Against/Abstain com progress bar
- `packages/proposal-ui/src/components/ProposalVotes/VoterParticipation.tsx` — participação vs supply
- `packages/auction-ui/src/components/AuctionChart/AuctionGraph.tsx` — padrão de chart SVG custom (NÃO adicionar Recharts/D3; seguir convenção do repo + deps mínimas)
- Dados já no fragment `Proposal.graphql`: forVotes, againstVotes, abstainVotes, quorumVotes

**Componentes propostos:**
1. Quorum progress (votos acumulados vs quorum, com marker)
2. Vote timeline (votos ao longo da janela de votação — dados já existem via `ProposalVote` timestamps)
3. Participation rate histórico (últimas N proposals)

**Entregáveis:** 2-3 componentes em `packages/proposal-ui` reutilizando o padrão SVG do AuctionGraph + testes + doc.
**Esforço:** M (4-5 dias). Sem dependência de subgraph.

## Track C — Active Member Detection

**O que é:** lógica para classificar membros como ativos/inativos (vota? dá bid? delega?).

**Base existente:**
- `packages/sdk/src/subgraph/requests/daoVoters.ts` — voters com tokenCount, timeJoined
- `packages/sdk/src/subgraph/requests/daoMembership.ts` — voteCount, voteDistribution, delegate
- `packages/dao-ui/src/components/MembersList/` — UI de membros
- API route `/api/membersList/{token}`

**Decisão de design necessária (semana 1):** definição de "ativo". Proposta inicial:
`ativo = votou em ≥1 das últimas 5 proposals OU deu bid em leilão nos últimos 30 dias`

**Caminho técnico (2 opções):**
- **Opção 1 (preferida):** computar client/API-side cruzando `ProposalVote` + bids existentes no subgraph — sem mudar schema, fecha loop rápido
- **Opção 2:** adicionar `lastActiveAt` no subgraph — mais limpo, mas exige deploy + re-indexação em todas as chains (latência alta, review do core team)

**Entregáveis:** helper/hook `useActiveMember(s)` no SDK/hooks + badge/filtro na MembersList + doc com a definição de "ativo" justificada.
**Esforço:** M (4-5 dias na opção 1; +1 semana se opção 2).

## Track D — Time-Based Feed Alerts

**O que é:** alertas de urgência no feed/dashboard — "leilão termina em 2h", "votação encerra em 6h", "proposal queued expira em 1d".

**Base existente:**
- `packages/feed-ui/src/Feed.tsx` + items por evento (PROPOSAL_CREATED, AUCTION_BID_PLACED, etc.)
- `packages/hooks/src/useCountdown.ts` — countdown com `onEnd`
- `packages/proposal-ui/.../ProposalStatus.tsx:62-81` — já calcula "Ends in / Expires in"
- `apps/web/src/pages/dashboard.tsx` — superfície principal

**Abordagem:** alertas DERIVADOS client-side (proposals ativas + auctions com `endTime` próximo), não eventos novos de subgraph. Renderizar como itens pinados/banner no topo do feed e dashboard, com thresholds (ex.: <24h amarelo, <2h vermelho).

**Entregáveis:** componente `UrgencyAlerts` em `packages/feed-ui` + integração no dashboard + testes de threshold + doc.
**Esforço:** M (3-4 dias). Sem dependência de subgraph.

---

## Cronograma (4 semanas até Day ~60)

| Semana | Foco | Saída verificável |
|--------|------|-------------------|
| 1 | Track A completo; decidir definição de "ativo" (C) e validar opção 1 vs 2 com core team | PR #1 aberto; decisão registrada |
| 2 | Track B; report público biweekly #1 | PR #2 aberto; update postado |
| 3 | Track C (opção 1) | PR #3 aberto |
| 4 | Track D + buffer para review/iteração nos PRs; report biweekly #2 | PR #4 aberto; 4 links públicos consolidados |

**Definição de pronto (por track):** PR aberto no BuilderOSS/nouns-builder + testes passando + doc curto (o que/por quê/como usar) + screenshot/demo no update público.

## Decisões / Opções / Tarefas

**Decisões (fixar agora):**
- Charts: SVG custom seguindo padrão `AuctionGraph` (zero deps novas)
- Feed alerts: derivados client-side, sem evento novo de subgraph
- Ordem: A → B → C → D (do menor para o maior risco)

**Opções (validar com Vlad/core team na semana 1):**
- C: opção 1 (computado) vs opção 2 (campo no subgraph)
- Onde os componentes aterrissam primeiro: monorepo packages vs template — recomendação: packages no monorepo, template consome depois

**Tarefas imediatas (próximos 7 dias):**
1. Confirmar status/aceite da Milestone 1 e data-base do Day ~60
2. Abrir issue/discussion no repo com este plano (transparência exigida pela proposta)
3. Implementar Track A end-to-end (fecha o primeiro loop)

## Riscos

1. **Latência de review upstream** — PRs no BuilderOSS dependem do core team; mitigar abrindo PRs cedo e pequenos (1 PR por track)
2. **Track C virar mudança de subgraph** — re-indexação multi-chain pode estourar o prazo; mitigar com opção 1
3. **Scope creep em visualizações (B)** — fixar em 2-3 componentes, resto vira backlog de M3

## UNKNOWN

- Data exata de início da contagem (Day 0) e status de aceite da M1
- Definição oficial de "membro ativo" (proposta acima precisa de validação)
- Se há expectativa de os componentes também aterrissarem no template oficial dentro da M2 ou só na M3/follow-up
