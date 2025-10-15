import { Abi } from 'viem'
import { create } from 'zustand'

interface CustomTransactionProps {
  contract?: {
    address: string
    abi: Abi
  }
  address: string
  arguments?: any
  function: {
    name: string
    inputs: any[]
  }
  calldata?: string
  value: string
  customABI?: string
}

interface State {
  active: number
  customTransaction: CustomTransactionProps
}

interface Actions {
  next: () => void
  previous: () => void
  reset: () => void
  composeCustomTransaction: (customTransaction: CustomTransactionProps) => void
}

export const initCustomTransaction: CustomTransactionProps = {
  contract: undefined,
  address: '',
  arguments: [],
  function: {
    name: '',
    inputs: [],
  },
  calldata: undefined,
  value: '',
}

const initialState: State = {
  active: 0,
  customTransaction: initCustomTransaction,
}

export const useCustomTransactionStore = create<State & Actions>((set) => ({
  ...initialState,
  next: () => set((state) => ({ active: state.active + 1 })),
  previous: () => set((state) => ({ active: state.active - 1 })),
  reset: () => set(() => ({ ...initialState })),
  composeCustomTransaction: (customTransaction: CustomTransactionProps) =>
    set({ customTransaction }),
}))
