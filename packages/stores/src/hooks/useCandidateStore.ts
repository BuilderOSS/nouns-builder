import type { TransactionBundle, TransactionType } from '@buildeross/types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type TransactionFormType = TransactionType

export const CANDIDATE_STORE_IDENTIFIER = `nouns-builder-candidate-${process.env.NEXT_PUBLIC_NETWORK_TYPE}`
const CANDIDATE_STORE_VERSION = 1

type State = {
  transactions: TransactionBundle[]
  disabled: boolean
  candidateId?: string // Unique identifier for this candidate group (salt-based)
  candidateNumber?: number
  salt?: string // Random salt for creating candidateId
  versionNumber?: number // Version number for this candidate
  title?: string
  summary?: string
  discussionUrl?: string
  transactionType: TransactionFormType | null
}

type Actions = {
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
        State,
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
        State,
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
  setTransactionType: (type: TransactionFormType | null) => void
  resetTransactionType: () => void
}

const initialState: State = {
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

type PersistedCandidateState = Partial<
  Pick<
    State,
    | 'transactions'
    | 'disabled'
    | 'title'
    | 'summary'
    | 'discussionUrl'
    | 'candidateId'
    | 'candidateNumber'
    | 'salt'
    | 'versionNumber'
    | 'transactionType'
  >
>

const migratePersistedState = (persistedState: unknown): PersistedCandidateState => {
  if (!persistedState || typeof persistedState !== 'object') {
    return {}
  }

  const state = persistedState as PersistedCandidateState

  return {
    ...state,
    transactions: Array.isArray(state.transactions)
      ? state.transactions.map((transaction) =>
          normalizeBundle(transaction as TransactionBundle)
        )
      : [],
  }
}

export const useCandidateStore = create<State & Actions>()(
  persist(
    (set) => ({
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
        ) as Partial<State>

        set(() => ({
          ...initialState,
          ...sanitizedDraft,
          transactions: (sanitizedDraft.transactions || []).map(normalizeBundle),
        }))
      },
      setTransactionType: (type) => set({ transactionType: type }),
      resetTransactionType: () => set({ transactionType: null }),
    }),
    {
      name: CANDIDATE_STORE_IDENTIFIER,
      version: CANDIDATE_STORE_VERSION,
      migrate: (persistedState) => migratePersistedState(persistedState),
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        disabled: state.disabled,
        title: state.title,
        summary: state.summary,
        discussionUrl: state.discussionUrl,
        candidateId: state.candidateId,
        candidateNumber: state.candidateNumber,
        salt: state.salt,
        versionNumber: state.versionNumber,
        transactionType: state.transactionType,
      }),
    }
  )
)
