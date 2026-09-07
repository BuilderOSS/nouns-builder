import { clearSafeInfo, getSavedSafeInfo } from '@buildeross/utils'
import type { Address } from 'viem'
import { describe, expect, it } from 'vitest'
import { createActor } from 'xstate'

import { walletModalMachine } from './walletModalMachine'

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
      eoaConnectorId: 'injected',
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
