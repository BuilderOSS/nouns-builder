import type { TransactionBundle, TransactionType } from '@buildeross/types'
import { createStore, type StateCreator } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const CANDIDATE_STORE_IDENTIFIER = `nouns-builder-candidate-${process.env.NEXT_PUBLIC_NETWORK_TYPE}`
const CANDIDATE_STORE_VERSION = 2

export type CandidateStoreState = {
  transactions: TransactionBundle[]
  disabled: boolean
  candidateId?: string
  candidateNumber?: number
  salt?: string
  versionNumber?: number
  title?: string
  summary?: string
  discussionUrl?: string
  transactionType: TransactionType | null
}

export type CandidateStoreActions = {
  addTransaction: (builderTransaction: TransactionBundle) => void
  addTransactions: (builderTransactions: TransactionBundle[]) => void
  removeTransaction: (index: number) => void
  removeAllTransactions: () => void
  clearCandidate: () => void
  setTitle: (title?: string) => void
  setSummary: (summary?: string) => void
  setDiscussionUrl: (discussionUrl?: string) => void
  setCandidateId: (candidateId?: string) => void
  setCandidateNumber: (candidateNumber?: number) => void
  setSalt: (salt?: string) => void
  setVersionNumber: (versionNumber?: number) => void
  setCandidateMetadata: (
    metadata: Partial<
      Pick<
        CandidateStoreState,
        | 'title'
        | 'summary'
        | 'discussionUrl'
        | 'candidateId'
        | 'candidateNumber'
        | 'salt'
        | 'versionNumber'
      >
    >
  ) => void
  startCandidateDraft: (
    draft?: Partial<
      Pick<
        CandidateStoreState,
        | 'title'
        | 'summary'
        | 'discussionUrl'
        | 'candidateId'
        | 'candidateNumber'
        | 'salt'
        | 'versionNumber'
        | 'transactions'
        | 'disabled'
        | 'transactionType'
      >
    >
  ) => void
  setTransactionType: (type: TransactionType | null) => void
  resetTransactionType: () => void
}

export type CandidateStoreProps = CandidateStoreState & CandidateStoreActions

export const buildCandidateStoreNamespace = ({
  chainId,
  walletAddress,
  tokenAddress,
}: {
  chainId: number
  walletAddress: string
  tokenAddress: string
}) =>
  `${CANDIDATE_STORE_IDENTIFIER}-${chainId}-${walletAddress.toLowerCase()}-${tokenAddress.toLowerCase()}`

const initialState: CandidateStoreState = {
  summary: undefined,
  title: undefined,
  discussionUrl: undefined,
  candidateId: undefined,
  candidateNumber: undefined,
  salt: undefined,
  versionNumber: undefined,
  disabled: false,
  transactions: [],
  transactionType: null,
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

const createCandidateState: StateCreator<CandidateStoreProps> = (set) => ({
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
  clearCandidate: () => set(() => ({ ...initialState })),
  setTitle: (title) => set({ title }),
  setSummary: (summary) => set({ summary }),
  setDiscussionUrl: (discussionUrl) => set({ discussionUrl }),
  setCandidateId: (candidateId) => set({ candidateId }),
  setCandidateNumber: (candidateNumber) => set({ candidateNumber }),
  setSalt: (salt) => set({ salt }),
  setVersionNumber: (versionNumber) => set({ versionNumber }),
  setCandidateMetadata: (metadata) => set(metadata),
  startCandidateDraft: (draft = {}) => {
    const sanitizedDraft = Object.fromEntries(
      Object.entries(draft).filter(([, value]) => value !== undefined)
    ) as Partial<CandidateStoreState>

    set(() => ({
      ...initialState,
      ...sanitizedDraft,
      transactions: (sanitizedDraft.transactions || []).map(normalizeBundle),
    }))
  },
  setTransactionType: (type) => set({ transactionType: type }),
  resetTransactionType: () => set({ transactionType: null }),
})

const candidateStoreCache = new Map<string, ReturnType<typeof createCandidateStore>>()
const fallbackCandidateStore = createStore<CandidateStoreProps>(createCandidateState)

export const createCandidateStore = (namespace?: string) => {
  if (!namespace) {
    return fallbackCandidateStore
  }

  const storage =
    typeof window !== 'undefined'
      ? createJSONStorage<CandidateStoreProps>(() => localStorage)
      : undefined

  return createStore(
    persist<CandidateStoreProps>(createCandidateState, {
      name: namespace,
      storage,
      version: CANDIDATE_STORE_VERSION,
    })
  )
}

export const getCandidateStore = (namespace?: string) => {
  if (!namespace) return fallbackCandidateStore

  const existing = candidateStoreCache.get(namespace)
  if (existing) return existing

  const store = createCandidateStore(namespace)
  candidateStoreCache.set(namespace, store)
  return store
}
