/**
 * Error codes for Safe transaction operations
 */
export enum SafeTransactionErrorCode {
  /** User rejected the transaction signature */
  USER_REJECTED = 'USER_REJECTED',
  /** User cancelled the transaction in the modal */
  USER_CANCELLED = 'USER_CANCELLED',
  /** Chain not configured in wallet */
  CHAIN_NOT_CONFIGURED = 'CHAIN_NOT_CONFIGURED',
  /** Chain switch rejected by user */
  CHAIN_SWITCH_REJECTED = 'CHAIN_SWITCH_REJECTED',
  /** EOA wallet not connected */
  EOA_NOT_CONNECTED = 'EOA_NOT_CONNECTED',
  /** Connected EOA is not an owner of the Safe */
  NOT_SAFE_OWNER = 'NOT_SAFE_OWNER',
  /** Safe Service API error */
  API_ERROR = 'API_ERROR',
  /** Transaction handler not initialized */
  HANDLER_NOT_INITIALIZED = 'HANDLER_NOT_INITIALIZED',
  /** Another transaction is already in progress */
  TRANSACTION_IN_PROGRESS = 'TRANSACTION_IN_PROGRESS',
  /** Failed to initialize Safe Protocol Kit */
  SAFE_INIT_FAILED = 'SAFE_INIT_FAILED',
  /** Transaction execution failed */
  EXECUTION_FAILED = 'EXECUTION_FAILED',
  /** Generic error */
  UNKNOWN = 'UNKNOWN',
}

/**
 * Custom error class for Safe transaction operations
 */
export class SafeTransactionError extends Error {
  constructor(
    message: string,
    public readonly code: SafeTransactionErrorCode
  ) {
    super(message)
    this.name = 'SafeTransactionError'
  }
}

/**
 * Detect if an error represents a user cancellation/rejection
 */
export function isUserCancellation(error: unknown): boolean {
  if (error instanceof SafeTransactionError) {
    return (
      error.code === SafeTransactionErrorCode.USER_REJECTED ||
      error.code === SafeTransactionErrorCode.USER_CANCELLED
    )
  }

  // Fallback: check common error patterns from wallet providers
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()
  return /cancel|reject|denied|user denied/i.test(message)
}

/**
 * Get a user-friendly error message for display
 */
export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof SafeTransactionError) {
    switch (error.code) {
      case SafeTransactionErrorCode.USER_REJECTED:
      case SafeTransactionErrorCode.USER_CANCELLED:
        return 'Transaction proposal was cancelled.'
      case SafeTransactionErrorCode.CHAIN_NOT_CONFIGURED:
        return 'The required network is not configured in your wallet.'
      case SafeTransactionErrorCode.CHAIN_SWITCH_REJECTED:
        return 'Network switch was rejected.'
      case SafeTransactionErrorCode.EOA_NOT_CONNECTED:
        return 'Please connect your wallet to continue.'
      case SafeTransactionErrorCode.NOT_SAFE_OWNER:
        return 'Your connected wallet is not an owner of this Safe.'
      case SafeTransactionErrorCode.API_ERROR:
        return 'Unable to connect to Safe Service. Please try again.'
      case SafeTransactionErrorCode.HANDLER_NOT_INITIALIZED:
        return 'Safe transaction handler not initialized. Please refresh the page.'
      case SafeTransactionErrorCode.TRANSACTION_IN_PROGRESS:
        return 'Another Safe transaction is already in progress. Please complete or cancel it first.'
      case SafeTransactionErrorCode.SAFE_INIT_FAILED:
        return 'Failed to initialize Safe. Please try again.'
      case SafeTransactionErrorCode.EXECUTION_FAILED:
        return 'Transaction execution failed. Please try again.'
      default:
        return error.message || 'An unexpected error occurred.'
    }
  }

  // Fallback for non-SafeTransactionError
  if (isUserCancellation(error)) {
    return 'Transaction proposal was cancelled.'
  }

  return error instanceof Error
    ? error.message
    : 'Unable to propose transaction. Please try again.'
}
