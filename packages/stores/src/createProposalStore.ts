import type { TransactionBundle, TransactionType } from '@buildeross/types'
import { createStore, type StateCreator } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const PROPOSAL_STORE_IDENTIFIER = `nouns-builder-proposal-${process.env.NEXT_PUBLIC_NETWORK_TYPE}`
const PROPOSAL_STORE_VERSION = 3

export type ProposalStoreState = {
  transactions: TransactionBundle[]
  disabled: boolean
  title?: string
  summary?: string
  representedAddress?: string
  discussionUrl?: string
  representedAddressEnabled: boolean
  transactionType: TransactionType | null
  updateProposalId?: string
  proposalSalt?: string
}

export type ProposalStoreActions = {
  addTransaction: (builderTransaction: TransactionBundle) => void
  addTransactions: (builderTransactions: TransactionBundle[]) => void
  removeTransaction: (index: number) => void
  removeAllTransactions: () => void
  clearProposal: () => void
  setTitle: (title?: string) => void
  setSummary: (summary?: string) => void
  setRepresentedAddress: (representedAddress?: string) => void
  setDiscussionUrl: (discussionUrl?: string) => void
  setRepresentedAddressEnabled: (representedAddressEnabled: boolean) => void
  setUpdateProposalId: (updateProposalId?: string) => void
  setProposalSalt: (proposalSalt?: string) => void
  setDraftMetadata: (
    draftMetadata: Partial<
      Pick<
        ProposalStoreState,
        | 'title'
        | 'summary'
        | 'representedAddress'
        | 'discussionUrl'
        | 'representedAddressEnabled'
        | 'proposalSalt'
      >
    >
  ) => void
  startProposalDraft: (
    draft?: Partial<
      Pick<
        ProposalStoreState,
        | 'title'
        | 'summary'
        | 'representedAddress'
        | 'discussionUrl'
        | 'representedAddressEnabled'
        | 'transactions'
        | 'disabled'
        | 'transactionType'
        | 'updateProposalId'
        | 'proposalSalt'
      >
    >
  ) => void
  setTransactionType: (type: TransactionType | null) => void
  resetTransactionType: () => void
}

export type ProposalStoreProps = ProposalStoreState & ProposalStoreActions

export const buildProposalStoreNamespace = ({
  chainId,
  walletAddress,
  tokenAddress,
}: {
  chainId: number
  walletAddress: string
  tokenAddress: string
}) =>
  `${PROPOSAL_STORE_IDENTIFIER}-${chainId}-${walletAddress.toLowerCase()}-${tokenAddress.toLowerCase()}`

const initialState: ProposalStoreState = {
  summary: undefined,
  title: undefined,
  representedAddress: undefined,
  discussionUrl: undefined,
  representedAddressEnabled: false,
  disabled: false,
  transactions: [],
  transactionType: null,
  updateProposalId: undefined,
  proposalSalt: undefined,
}

const toTitleCase = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const defaultBundleTitle = (type: TransactionType) =>
  toTitleCase(String(type).replace(/-/g, ' '))

const normalizeBundle = (bundle: TransactionBundle): TransactionBundle => {
  const title = bundle.title?.trim() || defaultBundleTitle(bundle.type)
  const summary =
    bundle.summary?.trim() ||
    bundle.transactions
      .map((txn) => txn.functionSignature)
      .filter(Boolean)
      .join(', ') ||
    title

  return {
    ...bundle,
    title,
    summary,
  }
}

const createProposalState: StateCreator<ProposalStoreProps> = (set) => ({
  ...initialState,
  addTransaction: (transaction: TransactionBundle) => {
    set((state) => ({
      transactions: [...state.transactions, normalizeBundle(transaction)],
    }))
  },
  addTransactions: (transaction: TransactionBundle[]) => {
    set((state) => ({
      transactions: [...state.transactions, ...transaction.map(normalizeBundle)],
    }))
  },
  removeTransaction: (index) => {
    set((state) => ({
      transactions: state.transactions.filter((_, i) => i !== index),
    }))
  },
  removeAllTransactions: () => {
    set(() => ({ transactions: [] }))
  },
  clearProposal: () => set(() => ({ ...initialState })),
  setTitle: (title) => set({ title }),
  setSummary: (summary) => set({ summary }),
  setRepresentedAddress: (representedAddress) => set({ representedAddress }),
  setDiscussionUrl: (discussionUrl) => set({ discussionUrl }),
  setRepresentedAddressEnabled: (representedAddressEnabled) =>
    set({ representedAddressEnabled }),
  setUpdateProposalId: (updateProposalId) => set({ updateProposalId }),
  setProposalSalt: (proposalSalt) => set({ proposalSalt }),
  setDraftMetadata: (draftMetadata) => set(draftMetadata),
  startProposalDraft: (draft = {}) => {
    const sanitizedDraft = Object.fromEntries(
      Object.entries(draft).filter(([, value]) => value !== undefined)
    ) as Partial<ProposalStoreState>

    set(() => ({
      ...initialState,
      ...sanitizedDraft,
      transactions: (sanitizedDraft.transactions || []).map(normalizeBundle),
    }))
  },
  setTransactionType: (type) => set({ transactionType: type }),
  resetTransactionType: () => set({ transactionType: null }),
})

const proposalStoreCache = new Map<string, ReturnType<typeof createProposalStore>>()
const fallbackProposalStore = createStore<ProposalStoreProps>(createProposalState)

export const createProposalStore = (namespace?: string) => {
  if (!namespace) {
    return fallbackProposalStore
  }

  const storage =
    typeof window !== 'undefined'
      ? createJSONStorage<ProposalStoreProps>(() => localStorage)
      : undefined

  return createStore(
    persist<ProposalStoreProps>(createProposalState, {
      name: namespace,
      storage,
      version: PROPOSAL_STORE_VERSION,
    })
  )
}

export const getProposalStore = (namespace?: string) => {
  if (!namespace) return fallbackProposalStore

  const existing = proposalStoreCache.get(namespace)
  if (existing) return existing

  const store = createProposalStore(namespace)
  proposalStoreCache.set(namespace, store)
  return store
}
