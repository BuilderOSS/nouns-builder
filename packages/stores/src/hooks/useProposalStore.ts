import type { TransactionBundle, TransactionType } from '@buildeross/types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type { TransactionBundle }

export type TransactionFormType = TransactionType

export const PROPOSAL_STORE_IDENTIFIER = `nouns-builder-proposal-${process.env.NEXT_PUBLIC_NETWORK_TYPE}`
const PROPOSAL_STORE_VERSION = 1

type State = {
  transactions: TransactionBundle[]
  disabled: boolean
  title?: string
  summary?: string
  representedAddress?: string
  discussionUrl?: string
  representedAddressEnabled: boolean
  transactionType: TransactionFormType | null
}

type Actions = {
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
  setDraftMetadata: (
    draftMetadata: Partial<
      Pick<
        State,
        | 'title'
        | 'summary'
        | 'representedAddress'
        | 'discussionUrl'
        | 'representedAddressEnabled'
      >
    >
  ) => void
  startProposalDraft: (
    draft?: Partial<
      Pick<
        State,
        | 'title'
        | 'summary'
        | 'representedAddress'
        | 'discussionUrl'
        | 'representedAddressEnabled'
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
  representedAddress: undefined,
  discussionUrl: undefined,
  representedAddressEnabled: false,
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

type PersistedProposalState = Partial<
  Pick<
    State,
    | 'transactions'
    | 'disabled'
    | 'title'
    | 'summary'
    | 'representedAddress'
    | 'discussionUrl'
    | 'representedAddressEnabled'
    | 'transactionType'
  >
>

const migratePersistedState = (persistedState: unknown): PersistedProposalState => {
  if (!persistedState || typeof persistedState !== 'object') {
    return {}
  }

  const state = persistedState as PersistedProposalState

  return {
    ...state,
    transactions: Array.isArray(state.transactions)
      ? state.transactions.map((transaction) =>
          normalizeBundle(transaction as TransactionBundle)
        )
      : [],
  }
}

export const useProposalStore = create<State & Actions>()(
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
      clearProposal: () => set(() => ({ ...initialState })),
      setTitle: (title) => set({ title }),
      setSummary: (summary) => set({ summary }),
      setRepresentedAddress: (representedAddress) => set({ representedAddress }),
      setDiscussionUrl: (discussionUrl) => set({ discussionUrl }),
      setRepresentedAddressEnabled: (representedAddressEnabled) =>
        set({ representedAddressEnabled }),
      setDraftMetadata: (draftMetadata) => set(draftMetadata),
      startProposalDraft: (draft = {}) => {
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
      name: PROPOSAL_STORE_IDENTIFIER,
      version: PROPOSAL_STORE_VERSION,
      migrate: (persistedState) => migratePersistedState(persistedState),
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        disabled: state.disabled,
        title: state.title,
        summary: state.summary,
        representedAddress: state.representedAddress,
        discussionUrl: state.discussionUrl,
        representedAddressEnabled: state.representedAddressEnabled,
        transactionType: state.transactionType,
      }),
    }
  )
)
