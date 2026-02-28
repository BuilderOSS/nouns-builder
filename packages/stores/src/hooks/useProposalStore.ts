import type { BuilderTransaction, TransactionType } from '@buildeross/types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type { BuilderTransaction }

export type TransactionFormType = TransactionType

export const PROPOSAL_STORE_IDENTIFIER = `nouns-builder-proposal-${process.env.NEXT_PUBLIC_NETWORK_TYPE}`

type State = {
  transactions: BuilderTransaction[]
  disabled: boolean
  title?: string
  summary?: string
  transactionType: TransactionFormType | null
}

type Actions = {
  addTransaction: (builderTransaction: BuilderTransaction) => void
  addTransactions: (builderTransactions: BuilderTransaction[]) => void
  removeTransaction: (index: number) => void
  removeAllTransactions: () => void
  createProposal: ({
    title,
    summary,
    disabled,
    transactions,
  }: Pick<State, 'title' | 'summary' | 'transactions' | 'disabled'>) => void
  clearProposal: () => void
  setTransactionType: (type: TransactionFormType | null) => void
  resetTransactionType: () => void
}

const initialState: State = {
  summary: undefined,
  title: undefined,
  disabled: false,
  transactions: [],
  transactionType: null,
}

export const useProposalStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...initialState,
      addTransaction: (transaction: BuilderTransaction) => {
        set((state) => ({
          transactions: [...state.transactions, transaction],
        }))
      },
      addTransactions: (transaction: BuilderTransaction[]) => {
        set((state) => ({
          transactions: [...state.transactions, ...transaction],
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
      createProposal: ({ title, summary, disabled, transactions }) =>
        set({ title, summary, disabled, transactions }),
      clearProposal: () => set(() => ({ ...initialState })),
      setTransactionType: (type) => set({ transactionType: type }),
      resetTransactionType: () => set({ transactionType: null }),
    }),
    {
      name: PROPOSAL_STORE_IDENTIFIER,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        disabled: state.disabled,
        title: state.title,
        summary: state.summary,
        transactionType: state.transactionType,
      }),
    }
  )
)
