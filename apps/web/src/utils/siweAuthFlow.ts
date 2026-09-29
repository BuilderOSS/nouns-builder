// Reduced to 2s to minimize logout suppression race condition window
const RECENT_VERIFICATION_WINDOW_MS = 2000
const LOGOUT_IN_PROGRESS_WINDOW_MS = 60000
export const SIWE_AUTH_FLOW_KEY = 'siwe:authFlowActive'
export const SIWE_LAST_VERIFIED_KEY = 'siwe:lastVerifiedAt'
export const SIWE_LOGOUT_IN_PROGRESS_KEY = 'siwe:logoutInProgressAt'
export const SIWE_LOGOUT_EVENT = 'siwe:logout'
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
    localStorage.removeItem(SIWE_LOGOUT_IN_PROGRESS_KEY)
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

export function isSiweLogoutInProgress() {
  const startedAt = getLogoutStartedAt()
  if (!startedAt) return false

  const elapsed = Date.now() - startedAt
  if (elapsed > LOGOUT_IN_PROGRESS_WINDOW_MS) {
    endSiweLogout()
    return false
  }

  return true
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
