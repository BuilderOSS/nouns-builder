import type { TransactionBundle, TransactionType } from '@buildeross/types'
import React from 'react'

export interface TransactionComposerValue {
  transactionType: TransactionType | null
  setTransactionType: (type: TransactionType | null) => void
  resetTransactionType: () => void
  transactions: TransactionBundle[]
  addTransaction: (transaction: TransactionBundle) => void
  addTransactions: (transactions: TransactionBundle[]) => void
  removeTransaction: (index: number) => void
  removeAllTransactions: () => void
}

const TransactionComposerContext = React.createContext<TransactionComposerValue | null>(
  null
)

interface TransactionComposerProviderProps {
  value: TransactionComposerValue
  children: React.ReactNode
}

export const TransactionComposerProvider: React.FC<TransactionComposerProviderProps> = ({
  value,
  children,
}) => {
  return (
    <TransactionComposerContext.Provider value={value}>
      {children}
    </TransactionComposerContext.Provider>
  )
}

export const useTransactionComposer = () => {
  const context = React.useContext(TransactionComposerContext)

  if (!context) {
    throw new Error(
      'useTransactionComposer must be used within a TransactionComposerProvider'
    )
  }

  return context
}
