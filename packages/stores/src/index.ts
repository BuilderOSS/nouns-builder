// Re-export hooks (maintains existing import paths)
export { useAuthStore } from './hooks/useAuthStore'
export * from './hooks/useCandidateStore'
export { type ChainStoreWithHydration, useChainStore } from './hooks/useChainStore'
export { useDaoStore } from './hooks/useDaoStore'
export * from './hooks/useProposalStore'

// Export store factories
export {
  type AuthenticationStatus,
  AuthStatusContext,
  type AuthStoreState,
  SessionContext,
  type SessionData,
} from './createAuthStore'
export {
  buildCandidateStoreNamespace,
  CANDIDATE_STORE_IDENTIFIER,
  type CandidateStoreActions,
  type CandidateStoreProps,
  type CandidateStoreState,
  createCandidateStore,
  getCandidateStore,
} from './createCandidateStore'
export {
  CHAIN_STORE_IDENTIFIER,
  type ChainStoreProps,
  createChainStore,
} from './createChainStore'
export {
  createDaoStore,
  type DaoContractAddresses,
  type DaoStoreProps,
} from './createDaoStore'
export {
  buildProposalStoreNamespace,
  createProposalStore,
  getProposalStore,
  PROPOSAL_STORE_IDENTIFIER,
  type ProposalStoreActions,
  type ProposalStoreProps,
  type ProposalStoreState,
} from './createProposalStore'

// Export providers
export { AuthStoreProvider } from './providers/AuthStoreProvider'
export { CandidateStoreProvider } from './providers/CandidateStoreProvider'
export { ChainStoreProvider } from './providers/ChainStoreProvider'
export { DaoStoreProvider } from './providers/DaoStoreProvider'
export { ProposalStoreProvider } from './providers/ProposalStoreProvider'
