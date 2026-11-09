import { getSavedSafeInfo, SafeServiceError, setSafeInfo } from '@buildeross/utils'
import { getAddress } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { isOwnerOfSafeMock } = vi.hoisted(() => ({ isOwnerOfSafeMock: vi.fn() }))

vi.mock('@buildeross/utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@buildeross/utils')>()),
  isOwnerOfSafe: isOwnerOfSafeMock,
}))

import { createSafeOwnerConnector, setWagmiConfig } from './safeOwnerConnector'

const safeAddress = getAddress('0x0000000000000000000000000000000000005afe')
const ownerA = getAddress('0x00000000000000000000000000000000000000aa')
const ownerB = getAddress('0x00000000000000000000000000000000000000bb')
const stranger = getAddress('0x00000000000000000000000000000000000000cc')

function createOwnerProvider() {
  const listeners = new Map<string, Set<(...args: unknown[]) => void>>()
  return {
    listeners,
    request: vi.fn(),
    on: vi.fn((event: string, listener: (...args: unknown[]) => void) => {
      if (!listeners.has(event)) listeners.set(event, new Set())
      listeners.get(event)!.add(listener)
    }),
    removeListener: vi.fn((event: string, listener: (...args: unknown[]) => void) => {
      listeners.get(event)?.delete(listener)
    }),
    emit(event: string, ...args: unknown[]) {
      listeners.get(event)?.forEach((listener) => listener(...args))
    },
  }
}

function setup(accounts: () => Promise<`0x${string}`[]>) {
  const ownerProvider = createOwnerProvider()
  const ownerConnector = {
    id: 'injected',
    getAccounts: vi.fn(accounts),
    getProvider: vi.fn(async () => ownerProvider),
    isAuthorized: vi.fn(async () => true),
  }
  setWagmiConfig({ connectors: [ownerConnector] } as any)

  const emitter = { emit: vi.fn() }
  const connector = (createSafeOwnerConnector() as any)({
    emitter,
    chains: [{ id: 1 }],
  })

  return { connector, emitter, ownerConnector, ownerProvider }
}

describe('SafeOwnerConnector', () => {
  beforeEach(() => {
    localStorage.clear()
    isOwnerOfSafeMock.mockReset()
    setSafeInfo(
      {
        safeAddress,
        chainId: 1,
        threshold: 1,
        owners: [ownerA, ownerB],
        isReadOnly: false,
      },
      'injected',
      ownerA
    )
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('getOwnerAddress', () => {
    it('signs as the saved owner when the wallet still has it selected', async () => {
      const { connector } = setup(async () => [ownerA])

      await expect(connector.getOwnerAddress()).resolves.toBe(ownerA)
      expect(getSavedSafeInfo()?.ownerAddress).toBe(ownerA)
    })

    it('adopts a switched account that is also an owner, everywhere', async () => {
      const { connector } = setup(async () => [ownerB])

      await expect(connector.getOwnerAddress()).resolves.toBe(ownerB)
      expect(getSavedSafeInfo()?.ownerAddress).toBe(ownerB)
      expect(connector.cachedOwnerAddress).toBe(ownerB)
    })

    it('refuses to sign when the wallet switched to a non-owner', async () => {
      const { connector } = setup(async () => [stranger])

      await expect(connector.getOwnerAddress()).rejects.toThrow(/not an owner/)
      expect(getSavedSafeInfo()?.ownerAddress).toBe(ownerA)
    })

    it('falls back to the saved owner when the wallet cannot list accounts', async () => {
      const { connector } = setup(async () => {
        throw new Error('not ready')
      })

      await expect(connector.getOwnerAddress()).resolves.toBe(ownerA)
    })
  })

  describe('owner wallet events', () => {
    it('disconnects the Safe when the owner account is no longer available', async () => {
      const { connector, emitter, ownerProvider } = setup(async () => [ownerA])
      await connector.getProvider()

      ownerProvider.emit('accountsChanged', [ownerA, stranger])
      expect(emitter.emit).not.toHaveBeenCalledWith('disconnect')

      ownerProvider.emit('accountsChanged', [stranger])
      expect(emitter.emit).toHaveBeenCalledWith('disconnect')
      expect(getSavedSafeInfo()).toBeNull()
    })

    it('disconnects the Safe when the owner wallet disconnects', async () => {
      const { connector, emitter, ownerProvider } = setup(async () => [ownerA])
      await connector.getProvider()

      ownerProvider.emit('disconnect')
      expect(emitter.emit).toHaveBeenCalledWith('disconnect')
    })

    it('stops listening once the Safe is disconnected', async () => {
      const { connector, emitter, ownerProvider } = setup(async () => [ownerA])
      await connector.getProvider()
      await connector.disconnect()

      ownerProvider.emit('accountsChanged', [stranger])
      expect(emitter.emit).not.toHaveBeenCalled()
    })
  })

  describe('isAuthorized', () => {
    it('keeps the saved Safe connection when the Safe service is unavailable', async () => {
      const { connector } = setup(async () => [ownerA])
      isOwnerOfSafeMock.mockRejectedValue(new SafeServiceError('rate limited'))

      await expect(connector.isAuthorized()).resolves.toBe(true)
      expect(getSavedSafeInfo()).not.toBeNull()
    })

    it('clears the saved Safe when the owner is really no longer an owner', async () => {
      const { connector } = setup(async () => [ownerA])
      isOwnerOfSafeMock.mockResolvedValue(false)

      await expect(connector.isAuthorized()).resolves.toBe(false)
      expect(getSavedSafeInfo()).toBeNull()
    })
  })
})
