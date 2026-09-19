import debug from 'debug'

// Namespace-based loggers for different parts of the auth flow
export const debugAuth = debug('app:auth')
export const debugSafe = debug('app:safe')
export const debugSafeTx = debug('app:safe:tx')
export const debugSession = debug('app:session')
export const debugWallet = debug('app:wallet')
export const debugConnector = debug('app:connector')

// Helper for structured logging with state names
export function logState(namespace: debug.Debugger, state: string, data?: any) {
  namespace(`[${state}]`, data || '')
}

// Usage examples:
// debugAuth('User clicked sign message')
// logState(debugSafeTx, 'PROPOSING', { safeAddress, txHash })
//
// To enable in browser console:
// localStorage.setItem('debug', 'app:*')        // Enable all
// localStorage.setItem('debug', 'app:safe:*')   // Only Safe logs
// localStorage.removeItem('debug')              // Disable all
