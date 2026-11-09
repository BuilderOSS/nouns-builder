import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  beginSiweLogout,
  endSiweLogout,
  isSiweLogoutGateActive,
  isSiweLogoutInProgress,
  SIWE_LOGOUT_IN_PROGRESS_KEY,
  subscribeSiweLogoutGate,
} from './siweAuthFlow'

const LOGOUT_WINDOW_MS = 60000

describe('SIWE logout gate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it('notifies subscribers in this tab when the gate is set and cleared', () => {
    const onChange = vi.fn()
    const unsubscribe = subscribeSiweLogoutGate(onChange)

    beginSiweLogout()
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(isSiweLogoutGateActive()).toBe(true)

    endSiweLogout()
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(isSiweLogoutGateActive()).toBe(false)

    // Clearing an already-clear gate is not a change
    endSiweLogout()
    expect(onChange).toHaveBeenCalledTimes(2)

    unsubscribe()
  })

  it('notifies subscribers and clears storage when the gate expires', () => {
    const onChange = vi.fn()
    const unsubscribe = subscribeSiweLogoutGate(onChange)

    beginSiweLogout()
    onChange.mockClear()

    vi.advanceTimersByTime(LOGOUT_WINDOW_MS - 1)
    expect(onChange).not.toHaveBeenCalled()
    expect(isSiweLogoutGateActive()).toBe(true)

    vi.advanceTimersByTime(10)
    expect(onChange).toHaveBeenCalled()
    expect(isSiweLogoutGateActive()).toBe(false)
    expect(localStorage.getItem(SIWE_LOGOUT_IN_PROGRESS_KEY)).toBeNull()

    unsubscribe()
  })

  it('schedules expiry for a gate that was already set before subscribing', () => {
    beginSiweLogout()
    const onChange = vi.fn()
    const unsubscribe = subscribeSiweLogoutGate(onChange)

    vi.advanceTimersByTime(LOGOUT_WINDOW_MS + 10)
    expect(onChange).toHaveBeenCalled()
    expect(isSiweLogoutGateActive()).toBe(false)

    unsubscribe()
  })

  it('reacts to gate changes from other tabs', () => {
    const onChange = vi.fn()
    const unsubscribe = subscribeSiweLogoutGate(onChange)

    window.dispatchEvent(
      new StorageEvent('storage', { key: SIWE_LOGOUT_IN_PROGRESS_KEY, newValue: null })
    )
    window.dispatchEvent(new StorageEvent('storage', { key: 'unrelated' }))
    expect(onChange).toHaveBeenCalledTimes(1)

    unsubscribe()
  })

  it('does not spin when the gate timestamp is far in the future', () => {
    const fortyDaysMs = 40 * 24 * 60 * 60 * 1000
    localStorage.setItem(SIWE_LOGOUT_IN_PROGRESS_KEY, String(Date.now() + fortyDaysMs))
    const onChange = vi.fn()
    const unsubscribe = subscribeSiweLogoutGate(onChange)

    vi.advanceTimersByTime(1000)
    expect(onChange).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(1)

    unsubscribe()
  })

  it('stops notifying after unsubscribe', () => {
    const onChange = vi.fn()
    const unsubscribe = subscribeSiweLogoutGate(onChange)
    unsubscribe()

    beginSiweLogout()
    vi.advanceTimersByTime(LOGOUT_WINDOW_MS + 10)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('isSiweLogoutGateActive has no side effects, isSiweLogoutInProgress clears an expired gate', () => {
    beginSiweLogout()
    vi.advanceTimersByTime(LOGOUT_WINDOW_MS + 10)

    expect(isSiweLogoutGateActive()).toBe(false)
    expect(localStorage.getItem(SIWE_LOGOUT_IN_PROGRESS_KEY)).not.toBeNull()

    expect(isSiweLogoutInProgress()).toBe(false)
    expect(localStorage.getItem(SIWE_LOGOUT_IN_PROGRESS_KEY)).toBeNull()
  })
})
