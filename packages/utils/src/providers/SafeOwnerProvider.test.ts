import { describe, expect, it, vi } from 'vitest'

import {
  registerSafeTransactionHandler,
  unregisterSafeTransactionHandler,
} from '../safe/handler'
import { SafeOwnerProvider } from './SafeOwnerProvider'

const safeInfo = {
  safeAddress: '0x0000000000000000000000000000000000000001' as const,
  chainId: 1,
  threshold: 2,
  owners: ['0x0000000000000000000000000000000000000002' as const],
  isReadOnly: false,
}

const createEoaProvider = () => {
  const listeners = new Map<string, Set<(...args: unknown[]) => void>>()

  return {
    on: vi.fn((event: string, listener: (...args: unknown[]) => void) => {
      const current = listeners.get(event) ?? new Set()
      current.add(listener)
      listeners.set(event, current)
    }),
    removeListener: vi.fn((event: string, listener: (...args: unknown[]) => void) => {
      listeners.get(event)?.delete(listener)
    }),
    request: vi.fn(),
    emit(event: string, ...args: unknown[]) {
      for (const listener of listeners.get(event) ?? []) {
        listener(...args)
      }
    },
  }
}

const publicClient = {} as any

describe('SafeOwnerProvider', () => {
  it('disconnects when the backing EOA account changes', () => {
    const eoaProvider = createEoaProvider()
    const safeProvider = new SafeOwnerProvider(
      safeInfo as any,
      eoaProvider as any,
      publicClient
    )
    const disconnect = vi.fn()

    safeProvider.on('disconnect', disconnect)
    eoaProvider.emit('accountsChanged', ['0x0000000000000000000000000000000000000003'])

    expect(disconnect).toHaveBeenCalledTimes(1)
  })

  it('disconnects when the backing EOA chain changes', () => {
    const eoaProvider = createEoaProvider()
    const safeProvider = new SafeOwnerProvider(
      safeInfo as any,
      eoaProvider as any,
      publicClient
    )
    const disconnect = vi.fn()

    safeProvider.on('disconnect', disconnect)
    eoaProvider.emit('chainChanged', '0x2')

    expect(disconnect).toHaveBeenCalledTimes(1)
  })

  it('disconnects when the backing EOA disconnects', () => {
    const eoaProvider = createEoaProvider()
    const safeProvider = new SafeOwnerProvider(
      safeInfo as any,
      eoaProvider as any,
      publicClient
    )
    const disconnect = vi.fn()

    safeProvider.on('disconnect', disconnect)
    eoaProvider.emit('disconnect')

    expect(disconnect).toHaveBeenCalledTimes(1)
  })

  it('removes backing EOA listeners on destroy', () => {
    const eoaProvider = createEoaProvider()
    const safeProvider = new SafeOwnerProvider(
      safeInfo as any,
      eoaProvider as any,
      publicClient
    )
    const disconnect = vi.fn()

    safeProvider.on('disconnect', disconnect)
    safeProvider.destroy()
    eoaProvider.emit('accountsChanged', ['0x0000000000000000000000000000000000000003'])

    expect(eoaProvider.removeListener).toHaveBeenCalled()
    expect(disconnect).not.toHaveBeenCalled()
  })

  it('delegates signing to a contract owner wallet', async () => {
    const ownerAddress = '0x000000000000000000000000000000000000c0de'
    const eoaProvider = createEoaProvider()
    eoaProvider.request.mockImplementation(async ({ method, params }) => {
      if (method === 'eth_accounts') return [ownerAddress]
      if (method === 'personal_sign') {
        expect(params).toEqual(['0x1234', ownerAddress])
        return '0xsignature'
      }
      throw new Error(`Unexpected method: ${method}`)
    })
    const safeProvider = new SafeOwnerProvider(
      safeInfo as any,
      eoaProvider as any,
      publicClient
    )

    await expect(
      safeProvider.request({
        method: 'personal_sign',
        params: ['0x1234', safeInfo.safeAddress],
      })
    ).resolves.toBe('0xsignature')
  })

  it('forwards the requested chain to the Safe transaction handler', async () => {
    const eoaProvider = createEoaProvider()
    const safeProvider = new SafeOwnerProvider(
      safeInfo as any,
      eoaProvider as any,
      publicClient
    )
    const handler = vi.fn().mockResolvedValue({ mode: 'propose', safeTxHash: '0xhash' })
    registerSafeTransactionHandler(handler)

    await expect(
      safeProvider.request({
        method: 'eth_sendTransaction',
        params: [{ to: safeInfo.safeAddress, data: '0x', chainId: safeInfo.chainId }],
      })
    ).resolves.toBe('0xhash')

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        transaction: expect.objectContaining({ chainId: safeInfo.chainId }),
      })
    )
    unregisterSafeTransactionHandler()
  })

  it('forwards a chain mismatch to the Safe handler for modal feedback', async () => {
    const eoaProvider = createEoaProvider()
    const safeProvider = new SafeOwnerProvider(
      safeInfo as any,
      eoaProvider as any,
      publicClient
    )
    const handler = vi.fn().mockResolvedValue({ mode: 'propose', safeTxHash: '0xhash' })
    registerSafeTransactionHandler(handler)

    await expect(
      safeProvider.request({
        method: 'eth_sendTransaction',
        params: [{ to: safeInfo.safeAddress, chainId: 8453 }],
      })
    ).resolves.toBe('0xhash')
    expect(handler).toHaveBeenCalledOnce()
    unregisterSafeTransactionHandler()
  })
})
