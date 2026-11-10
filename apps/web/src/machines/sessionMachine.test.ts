import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createActor, waitFor } from 'xstate'

import {
  beginSiweLogout,
  isSiweLogoutGateActive,
  SIWE_LOGOUT_PATH,
  SIWE_ME_PATH,
} from '../utils/siweAuthFlow'
import { sessionMachine } from './sessionMachine'

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

describe('sessionMachine', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    localStorage.clear()
    fetchMock = vi.fn(async (url: string) => {
      if (url === SIWE_ME_PATH) return jsonResponse({})
      if (url === SIWE_LOGOUT_PATH) return jsonResponse({ ok: true })
      throw new Error(`Unexpected fetch: ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('settles in unauthenticated when /me returns no session', async () => {
    const actor = createActor(sessionMachine).start()

    const snapshot = await waitFor(actor, (s) => s.matches('unauthenticated'))
    expect(snapshot.context.session).toBeNull()
  })

  it('accepts LOGOUT while unauthenticated and clears the logout gate', async () => {
    const actor = createActor(sessionMachine).start()
    await waitFor(actor, (s) => s.matches('unauthenticated'))

    beginSiweLogout()
    expect(isSiweLogoutGateActive()).toBe(true)

    actor.send({ type: 'LOGOUT' })
    expect(actor.getSnapshot().matches('loggingOut')).toBe(true)

    await waitFor(actor, (s) => s.matches('unauthenticated'))
    expect(fetchMock).toHaveBeenCalledWith(
      SIWE_LOGOUT_PATH,
      expect.objectContaining({ method: 'POST' })
    )
    expect(isSiweLogoutGateActive()).toBe(false)
  })

  it('accepts LOGOUT while the initial session check is in flight', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (url === SIWE_ME_PATH) return new Promise<Response>(() => {})
      return jsonResponse({ ok: true })
    })
    const actor = createActor(sessionMachine).start()
    expect(actor.getSnapshot().matches('checkingSession')).toBe(true)

    beginSiweLogout()
    actor.send({ type: 'LOGOUT' })

    await waitFor(actor, (s) => s.matches('unauthenticated'))
    expect(isSiweLogoutGateActive()).toBe(false)
  })

  it('clears the logout gate even when the logout request fails', async () => {
    const actor = createActor(sessionMachine).start()
    await waitFor(actor, (s) => s.matches('unauthenticated'))
    fetchMock.mockImplementation(async () => jsonResponse({}, 500))

    beginSiweLogout()
    actor.send({ type: 'LOGOUT' })

    await waitFor(actor, (s) => s.matches('unauthenticated'))
    expect(isSiweLogoutGateActive()).toBe(false)
  })
})
