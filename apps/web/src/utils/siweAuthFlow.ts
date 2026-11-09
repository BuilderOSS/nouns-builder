// Reduced to 2s to minimize logout suppression race condition window
const RECENT_VERIFICATION_WINDOW_MS = 2000
const LOGOUT_IN_PROGRESS_WINDOW_MS = 60000
export const SIWE_AUTH_FLOW_KEY = 'siwe:authFlowActive'
export const SIWE_LAST_VERIFIED_KEY = 'siwe:lastVerifiedAt'
export const SIWE_LOGOUT_IN_PROGRESS_KEY = 'siwe:logoutInProgressAt'
export const SIWE_LOGOUT_EVENT = 'siwe:logout'
export const SIWE_LOGOUT_GATE_CHANGE_EVENT = 'siwe:logoutGateChange'
export const SIWE_REFRESH_EVENT = 'siwe:refresh'
export const SIWE_NONCE_PATH = '/api/siwe/nonce'
export const SIWE_VERIFY_PATH = '/api/siwe/verify'
export const SIWE_LOGOUT_PATH = '/api/siwe/logout'
export const SIWE_ME_PATH = '/api/siwe/me'
export const SIWE_NONCE_RATE_LIMIT_KEY_PREFIX = 'siwe:nonce'
export const SIWE_VERIFY_RATE_LIMIT_KEY_PREFIX = 'siwe:verify'
export const SIWE_LOGOUT_RATE_LIMIT_KEY_PREFIX = 'siwe:logout'
export const SIWE_ME_RATE_LIMIT_KEY_PREFIX = 'siwe:me'

// Use sessionStorage instead of module-level variables to avoid cross-tab issues
function isAuthFlowActive(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(SIWE_AUTH_FLOW_KEY) === 'true'
}

function setAuthFlowActive(active: boolean): void {
  if (typeof window === 'undefined') return
  if (active) {
    sessionStorage.setItem(SIWE_AUTH_FLOW_KEY, 'true')
  } else {
    sessionStorage.removeItem(SIWE_AUTH_FLOW_KEY)
  }
}

function getLastVerifiedAt(): number {
  if (typeof window === 'undefined') return 0
  const value = sessionStorage.getItem(SIWE_LAST_VERIFIED_KEY)
  return value ? parseInt(value, 10) : 0
}

function setLastVerifiedAt(timestamp: number): void {
  if (typeof window === 'undefined') return
  if (timestamp > 0) {
    sessionStorage.setItem(SIWE_LAST_VERIFIED_KEY, timestamp.toString())
  } else {
    sessionStorage.removeItem(SIWE_LAST_VERIFIED_KEY)
  }
}

function getLogoutStartedAt(): number {
  if (typeof window === 'undefined') return 0

  const value = localStorage.getItem(SIWE_LOGOUT_IN_PROGRESS_KEY)
  if (!value) return 0

  const timestamp = Number(value)
  return Number.isFinite(timestamp) ? timestamp : 0
}

function setLogoutStartedAt(timestamp: number): void {
  if (typeof window === 'undefined') return

  if (timestamp > 0) {
    localStorage.setItem(SIWE_LOGOUT_IN_PROGRESS_KEY, String(timestamp))
  } else {
    if (localStorage.getItem(SIWE_LOGOUT_IN_PROGRESS_KEY) === null) return
    localStorage.removeItem(SIWE_LOGOUT_IN_PROGRESS_KEY)
  }

  // `storage` events only reach other tabs, so notify this tab explicitly.
  window.dispatchEvent(new Event(SIWE_LOGOUT_GATE_CHANGE_EVENT))
}

/**
 * Pure read of the logout gate (no side effects), safe to call during render.
 */
export function isSiweLogoutGateActive(): boolean {
  const startedAt = getLogoutStartedAt()
  if (!startedAt) return false
  return Date.now() - startedAt <= LOGOUT_IN_PROGRESS_WINDOW_MS
}

/**
 * Subscribe to logout gate changes in this tab, in other tabs, and to the gate
 * expiring on its own. Shaped for React's useSyncExternalStore.
 */
export function subscribeSiweLogoutGate(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {}

  let expiryTimer: ReturnType<typeof setTimeout> | null = null

  const scheduleExpiry = () => {
    if (expiryTimer) clearTimeout(expiryTimer)
    expiryTimer = null

    const startedAt = getLogoutStartedAt()
    if (!startedAt) return

    const remainingMs = startedAt + LOGOUT_IN_PROGRESS_WINDOW_MS - Date.now()
    expiryTimer = setTimeout(
      () => {
        expiryTimer = null
        // Clearing the expired gate dispatches the change event, which
        // reschedules and notifies; fall back to notifying directly.
        if (isSiweLogoutGateActive()) {
          scheduleExpiry()
        } else if (getLogoutStartedAt()) {
          endSiweLogout()
        } else {
          onChange()
        }
      },
      // Clamp so a timestamp far in the future (clock moved back) can't exceed
      // setTimeout's 2^31-1 ms limit, which would fire immediately and spin.
      Math.min(Math.max(0, remainingMs), LOGOUT_IN_PROGRESS_WINDOW_MS) + 1
    )
  }

  const handleChange = () => {
    scheduleExpiry()
    onChange()
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === SIWE_LOGOUT_IN_PROGRESS_KEY || event.key === null) {
      handleChange()
    }
  }

  window.addEventListener(SIWE_LOGOUT_GATE_CHANGE_EVENT, handleChange)
  window.addEventListener('storage', handleStorage)
  scheduleExpiry()

  return () => {
    if (expiryTimer) clearTimeout(expiryTimer)
    window.removeEventListener(SIWE_LOGOUT_GATE_CHANGE_EVENT, handleChange)
    window.removeEventListener('storage', handleStorage)
  }
}

export function beginSiweAuthFlow() {
  setAuthFlowActive(true)
}

export function cancelSiweAuthFlow() {
  setAuthFlowActive(false)
}

export function markSiweAuthVerified() {
  setAuthFlowActive(false)
  setLastVerifiedAt(Date.now())
}

export function beginSiweLogout() {
  setLogoutStartedAt(Date.now())
}

export function endSiweLogout() {
  setLogoutStartedAt(0)
}

/**
 * Like isSiweLogoutGateActive, but also clears an expired gate. Not for use
 * during render (clearing notifies subscribers); use useSiweLogoutInProgress.
 */
export function isSiweLogoutInProgress() {
  if (isSiweLogoutGateActive()) return true
  if (getLogoutStartedAt()) endSiweLogout()
  return false
}

export function shouldSuppressSiweLogout() {
  const authActive = isAuthFlowActive()
  const lastVerified = getLastVerifiedAt()
  return (
    authActive ||
    isSiweLogoutInProgress() ||
    (lastVerified > 0 && Date.now() - lastVerified < RECENT_VERIFICATION_WINDOW_MS)
  )
}

export function shouldSuppressSiwePrompt() {
  return shouldSuppressSiweLogout()
}
