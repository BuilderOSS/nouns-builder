import { AddressType } from '@buildeross/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { TransactionType } from '../constants'

export type Transaction = {
  functionSignature: string
  target: AddressType
  value: string
  calldata: string
}

export type BuilderTransaction = {
  type: TransactionType
  transactions: Transaction[]
  summary?: string
}

interface State {
  transactions: BuilderTransaction[]
  disabled: boolean
  title?: string
  summary?: string
}

interface Actions {
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
}

const initialState: State = {
  summary: undefined,
  title: undefined,
  disabled: false,
  transactions: [],
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
    }),
    {
      name: 'proposal-store', // localStorage key
      partialize: (state) => ({
        transactions: state.transactions,
        disabled: state.disabled,
        title: state.title,
        summary: state.summary,
      }),
    }
  )
)
