import { assign, createMachine, fromPromise } from 'xstate'

import type { SessionData } from '../types/auth'
import { debugSession } from '../utils/debug'
import {
  endSiweLogout,
  SIWE_LOGOUT_PATH,
  SIWE_ME_PATH,
  SIWE_REFRESH_EVENT,
} from '../utils/siweAuthFlow'

// Runtime validation for SessionData
function isValidSessionData(data: unknown): data is SessionData {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>

  // Must have at least one address field
  const hasAddress =
    typeof obj.address === 'string' || typeof obj.safeAddress === 'string'

  // Validate optional fields if present
  const validEoa = !obj.eoaAddress || typeof obj.eoaAddress === 'string'
  const validChainId = !obj.safeChainId || typeof obj.safeChainId === 'number'

  return hasAddress && validEoa && validChainId
}

interface SessionContext {
  session: SessionData | null
  error: Error | null
}

type SessionEvent =
  | { type: 'CHECK_SESSION' }
  | { type: 'SESSION_FOUND'; data: SessionData }
  | { type: 'SESSION_NOT_FOUND' }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH' }
  | { type: 'ERROR'; error: Error }

export const sessionMachine = createMachine(
  {
    id: 'session',
    initial: 'checkingSession',
    types: {} as {
      context: SessionContext
      events: SessionEvent
    },
    context: {
      session: null,
      error: null,
    },
    states: {
      checkingSession: {
        entry: () => debugSession('Checking session...'),
        invoke: {
          src: 'fetchSession',
          onDone: {
            target: 'authenticated',
            actions: 'setSessionFromInvoke',
            guard: 'hasValidSession',
          },
          onError: {
            target: 'unauthenticated',
            actions: 'setError',
          },
        },
        on: {
          SESSION_FOUND: {
            target: 'authenticated',
            actions: ['cancelFetch', 'setSession'],
          },
        },
      },
      authenticated: {
        entry: () => debugSession('Session authenticated'),
        on: {
          LOGOUT: 'loggingOut',
          REFRESH: 'checkingSession',
          SESSION_NOT_FOUND: 'unauthenticated',
        },
      },
      unauthenticated: {
        entry: () => debugSession('No active session'),
        on: {
          SESSION_FOUND: {
            target: 'authenticated',
            actions: 'setSession',
          },
          CHECK_SESSION: 'checkingSession',
        },
      },
      loggingOut: {
        entry: () => debugSession('Logging out...'),
        invoke: {
          src: 'logoutApi',
          onDone: {
            target: 'unauthenticated',
            actions: ['clearLogoutGate', 'refreshSession'],
          },
          onError: {
            target: 'unauthenticated',
            actions: ['clearLogoutGate', 'refreshSession'],
          }, // Force logout even on error
        },
      },
    },
  },
  {
    guards: {
      hasValidSession: ({ event }) => {
        if (!('output' in event)) return false
        // Runtime validation before type assertion
        return isValidSessionData(event.output)
      },
    },
    actions: {
      clearLogoutGate: () => {
        endSiweLogout()
      },
      refreshSession: () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event(SIWE_REFRESH_EVENT))
        }
      },
      cancelFetch: () => {
        debugSession('Cancelling fetch (SESSION_FOUND event received)')
        // XState will automatically cancel the invoke when transitioning
      },
      setSessionFromInvoke: assign({
        session: ({ event }) => {
          if (!('output' in event)) return null
          if (!isValidSessionData(event.output)) {
            debugSession('Invalid session data from invoke: %O', event.output)
            return null
          }
          const data = event.output as SessionData
          debugSession('Session set from invoke: %O', data)
          return data
        },
        error: null,
      }),
      setSession: assign({
        session: ({ event }) => {
          if ('data' in event) {
            // Validate session data before setting
            if (!isValidSessionData(event.data)) {
              debugSession(
                'Invalid session data from SESSION_FOUND event: %O',
                event.data
              )
              return null
            }
            debugSession('Session set: %O', event.data)
            return event.data as SessionData
          }
          return null
        },
        error: null,
      }),
      setError: assign({
        error: ({ event }) => {
          if ('error' in event) {
            return event.error as Error
          }
          return new Error('Unknown error')
        },
      }),
    },
    actors: {
      fetchSession: fromPromise(async () => {
        const res = await fetch(SIWE_ME_PATH, { cache: 'no-store' })
        if (!res.ok) {
          // Throw error to distinguish from no session (allows proper error handling)
          throw new Error(`Session fetch failed: ${res.status}`)
        }
        return res.json() as Promise<SessionData>
      }),
      logoutApi: fromPromise(async () => {
        const response = await fetch(SIWE_LOGOUT_PATH, { method: 'POST' })
        if (!response.ok) {
          throw new Error(`Logout failed: ${response.status}`)
        }
      }),
    },
  }
)
