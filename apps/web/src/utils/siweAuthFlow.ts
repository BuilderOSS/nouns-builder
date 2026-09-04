const RECENT_VERIFICATION_WINDOW_MS = 5000

let authFlowActive = false
let lastVerifiedAt = 0

export function beginSiweAuthFlow() {
  authFlowActive = true
}

export function cancelSiweAuthFlow() {
  authFlowActive = false
}

export function markSiweAuthVerified() {
  authFlowActive = false
  lastVerifiedAt = Date.now()
}

export function shouldSuppressSiweLogout() {
  return (
    authFlowActive ||
    (lastVerifiedAt > 0 && Date.now() - lastVerifiedAt < RECENT_VERIFICATION_WINDOW_MS)
  )
}

export function shouldSuppressSiwePrompt() {
  return shouldSuppressSiweLogout()
}
