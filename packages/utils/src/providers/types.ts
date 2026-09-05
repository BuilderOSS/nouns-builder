import type { Address } from 'viem'

export interface SafeInfo {
  safeAddress: Address
  chainId: number
  threshold: number
  owners: Address[]
  isReadOnly: boolean
  nonce?: number
  version?: string
}

export interface EIP1193Provider {
  request(args: {
    method: string
    params?: unknown[] | Record<string, unknown>
  }): Promise<unknown>
  on(event: string, listener: (...args: unknown[]) => void): void
  removeListener(event: string, listener: (...args: unknown[]) => void): void
}

export interface SendTransactionParams {
  from: string
  to: string
  value?: string
  data?: string
  gas?: string
  gasPrice?: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  nonce?: string
}

export interface CallParams {
  from?: string
  to: string
  data?: string
  gas?: string
  gasPrice?: string
  value?: string
}
