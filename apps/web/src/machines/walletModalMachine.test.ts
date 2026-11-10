import { clearSafeInfo, getSavedSafeInfo } from '@buildeross/utils'
import type { Address } from 'viem'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createActor } from 'xstate'

import { SIWE_REFRESH_EVENT } from '../utils/siweAuthFlow'
import { VERIFY_TIMEOUT_MS, walletModalMachine } from './walletModalMachine'

describe('walletModalMachine verification', () => {
  const address = '0x0000000000000000000000000000000000000002' as Address

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  // Drives the machine into `authenticating` with a verify request that never
  // settles, and returns the AbortSignal the request was made with.
  const startVerifying = () => {
    let verifySignal: AbortSignal | undefined
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init?: RequestInit) => {
        verifySignal = init?.signal ?? undefined
        return new Promise<Response>(() => {})
      })
    )

    const actor = createActor(walletModalMachine).start()
    actor.send({ type: 'OPEN', wallets: [] })
    actor.send({ type: 'SELECT_WALLET', walletId: 'injected' })
    actor.send({
      type: 'WALLET_CONNECTED',
      address,
      connector: { id: 'injected', name: 'Injected' } as any,
    })
    actor.send({ type: 'SIGN_MESSAGE' })
    actor.send({ type: 'SIGNATURE_RECEIVED', signature: '0xsig', message: 'msg' })

    expect(actor.getSnapshot().matches('authenticating')).toBe(true)
    expect(verifySignal).toBeDefined()
    expect(verifySignal!.aborted).toBe(false)

    return { actor, signal: verifySignal! }
  }

  it('aborts the verify request and re-checks the session when it times out', () => {
    vi.useFakeTimers()
    const onRefresh = vi.fn()
    window.addEventListener(SIWE_REFRESH_EVENT, onRefresh)

    const { actor, signal } = startVerifying()

    vi.advanceTimersByTime(VERIFY_TIMEOUT_MS - 1)
    expect(actor.getSnapshot().matches('authenticating')).toBe(true)
    expect(signal.aborted).toBe(false)

    vi.advanceTimersByTime(1)
    const snapshot = actor.getSnapshot()
    expect(snapshot.matches('awaitingSignature')).toBe(true)
    expect(snapshot.context.error).toMatchObject({ code: 'NETWORK_ERROR' })
    expect(signal.aborted).toBe(true)
    expect(onRefresh).toHaveBeenCalledTimes(1)

    window.removeEventListener(SIWE_REFRESH_EVENT, onRefresh)
  })

  it('shows the server explanation when verification is refused', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json(
          {
            ok: false,
            message: 'Could not reach the Safe service to confirm ownership.',
          },
          { status: 503 }
        )
      )
    )
    const actor = createActor(walletModalMachine).start()
    actor.send({ type: 'OPEN', wallets: [] })
    actor.send({ type: 'SELECT_WALLET', walletId: 'injected' })
    actor.send({
      type: 'WALLET_CONNECTED',
      address,
      connector: { id: 'injected', name: 'Injected' } as any,
    })
    actor.send({ type: 'SIGN_MESSAGE' })
    actor.send({ type: 'SIGNATURE_RECEIVED', signature: '0xsig', message: 'msg' })

    await vi.waitFor(() => {
      expect(actor.getSnapshot().matches('awaitingSignature')).toBe(true)
    })
    expect(actor.getSnapshot().context.error).toEqual({
      code: 'VERIFICATION_FAILED',
      message: 'Could not reach the Safe service to confirm ownership.',
    })
  })

  it('keeps the reason a Safe lookup failed instead of always saying not found', () => {
    const actor = createActor(walletModalMachine).start()
    actor.send({ type: 'OPEN', wallets: [] })
    actor.send({ type: 'SELECT_SAFE' })
    actor.send({ type: 'SUBMIT_SAFE_ADDRESS', address, chainId: 1 })
    actor.send({
      type: 'ERROR',
      error: { code: 'NETWORK_ERROR', message: 'Could not reach the Safe service.' },
    })

    const snapshot = actor.getSnapshot()
    expect(snapshot.matches('enteringSafeAddress')).toBe(true)
    expect(snapshot.context.error).toEqual({
      code: 'NETWORK_ERROR',
      message: 'Could not reach the Safe service.',
    })
  })

  it('aborts the verify request and re-checks the session when the modal closes', () => {
    const onRefresh = vi.fn()
    window.addEventListener(SIWE_REFRESH_EVENT, onRefresh)

    const { actor, signal } = startVerifying()
    actor.send({ type: 'CLOSE' })

    expect(actor.getSnapshot().matches('closed')).toBe(true)
    expect(signal.aborted).toBe(true)
    expect(onRefresh).toHaveBeenCalledTimes(1)

    window.removeEventListener(SIWE_REFRESH_EVENT, onRefresh)
  })
})

describe('walletModalMachine', () => {
  const safeAddress = '0x0000000000000000000000000000000000000001' as Address

  it('resets transient Safe state when the modal closes', () => {
    const actor = createActor(walletModalMachine)
    actor.start()

    actor.send({ type: 'OPEN', wallets: [] })
    actor.send({ type: 'SELECT_SAFE' })
    actor.send({
      type: 'SUBMIT_SAFE_ADDRESS',
      address: safeAddress,
      chainId: 1,
    })
    actor.send({
      type: 'SAFE_VALIDATED',
      safeInfo: {
        safeAddress,
        chainId: 1,
        owners: [safeAddress],
        threshold: 1,
        isReadOnly: false,
      },
    })
    actor.send({ type: 'CLOSE' })

    const snapshot = actor.getSnapshot()

    expect(snapshot.matches('closed')).toBe(true)
    expect(snapshot.context.pendingSafeInfo).toBeNull()
    expect(snapshot.context.pendingSafeAddress).toBeNull()
    expect(snapshot.context.pendingSafeChainId).toBeNull()
    expect(snapshot.context.safeInfo).toBeNull()
    expect(snapshot.context.isSafeMode).toBe(false)
    expect(snapshot.context.error).toBeNull()
  })

  it('resets context when reopening after a cancelled wallet flow', () => {
    const actor = createActor(walletModalMachine)
    actor.start()

    actor.send({ type: 'OPEN', wallets: [] })
    actor.send({ type: 'SELECT_WALLET', walletId: 'injected' })
    actor.send({ type: 'ERROR', error: { code: 'WALLET_NOT_CONNECTED' } })
    actor.send({ type: 'CLOSE' })
    actor.send({ type: 'OPEN', wallets: [] })

    const snapshot = actor.getSnapshot()

    expect(snapshot.matches('selectingWallet')).toBe(true)
    expect(snapshot.context.selectedWalletId).toBeNull()
    expect(snapshot.context.address).toBeNull()
    expect(snapshot.context.connector).toBeNull()
    expect(snapshot.context.error).toBeNull()
  })

  it('returns to wallet selection when signing is cancelled', () => {
    const actor = createActor(walletModalMachine)
    actor.start()

    actor.send({ type: 'OPEN', wallets: [] })
    actor.send({ type: 'SELECT_WALLET', walletId: 'injected' })
    actor.send({
      type: 'WALLET_CONNECTED',
      address: safeAddress,
      connector: { id: 'injected', name: 'Injected' } as any,
    })
    actor.send({ type: 'SIGN_MESSAGE' })
    actor.send({ type: 'CANCEL' })

    const snapshot = actor.getSnapshot()
    expect(snapshot.matches('selectingWallet')).toBe(true)
    expect(snapshot.context.address).toBeNull()
    expect(snapshot.context.connector).toBeNull()
    expect(snapshot.context.message).toBeNull()
    expect(snapshot.context.signature).toBeNull()
  })

  it('persists Safe info before switching to the Safe connector', async () => {
    clearSafeInfo()

    const actor = createActor(walletModalMachine)
    actor.start()

    actor.send({ type: 'OPEN', wallets: [] })
    actor.send({ type: 'SELECT_SAFE' })
    actor.send({ type: 'SUBMIT_SAFE_ADDRESS', address: safeAddress, chainId: 1 })
    actor.send({
      type: 'SAFE_VALIDATED',
      safeInfo: {
        safeAddress,
        chainId: 1,
        owners: [safeAddress],
        threshold: 1,
        isReadOnly: false,
      },
    })
    actor.send({ type: 'SELECT_WALLET', walletId: 'injected' })
    actor.send({
      type: 'WALLET_CONNECTED',
      address: safeAddress,
      connector: { id: 'injected', name: 'Injected' } as any,
    })

    await Promise.resolve()

    expect(getSavedSafeInfo()).toMatchObject({
      safeAddress,
      chainId: 1,
      ownerConnectorId: 'injected',
    })

    clearSafeInfo()
  })

  it('clears Safe attempt state if the modal closes during Safe handoff', async () => {
    const actor = createActor(walletModalMachine)
    actor.start()

    actor.send({ type: 'OPEN', wallets: [] })
    actor.send({ type: 'SELECT_SAFE' })
    actor.send({ type: 'SUBMIT_SAFE_ADDRESS', address: safeAddress, chainId: 1 })
    actor.send({
      type: 'SAFE_VALIDATED',
      safeInfo: {
        safeAddress,
        chainId: 1,
        owners: [safeAddress],
        threshold: 1,
        isReadOnly: false,
      },
    })
    actor.send({ type: 'SELECT_WALLET', walletId: 'injected' })
    actor.send({
      type: 'WALLET_CONNECTED',
      address: safeAddress,
      connector: { id: 'injected', name: 'Injected' } as any,
    })

    await Promise.resolve()

    actor.send({ type: 'CLOSE' })

    const snapshot = actor.getSnapshot()
    expect(snapshot.matches('closed')).toBe(true)
    expect(snapshot.context.selectedWalletId).toBeNull()
    expect(snapshot.context.address).toBeNull()
    expect(snapshot.context.connector).toBeNull()
    expect(snapshot.context.safeInfo).toBeNull()
    expect(snapshot.context.pendingSafeInfo).toBeNull()
    expect(snapshot.context.error).toBeNull()
    expect(snapshot.context.isSafeMode).toBe(false)
  })
})
