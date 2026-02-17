/**
 * Error codes for swap operations
 */
export enum SwapErrorCode {
  INSUFFICIENT_LIQUIDITY = 'INSUFFICIENT_LIQUIDITY',
  NO_ROUTE_FOUND = 'NO_ROUTE_FOUND',
  NETWORK_ERROR = 'NETWORK_ERROR',
  POOL_CONFIG_ERROR = 'POOL_CONFIG_ERROR',
  QUOTER_NOT_DEPLOYED = 'QUOTER_NOT_DEPLOYED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * User-friendly error messages for each error code
 */
export const SwapErrorMessages: Record<SwapErrorCode, string> = {
  [SwapErrorCode.INSUFFICIENT_LIQUIDITY]:
    'Not enough liquidity in the pool for this trade size. Try a smaller amount.',
  [SwapErrorCode.NO_ROUTE_FOUND]: 'No trading route found for this token pair',
  [SwapErrorCode.NETWORK_ERROR]:
    'Network error. Please check your connection and try again.',
  [SwapErrorCode.POOL_CONFIG_ERROR]:
    'Pool configuration error. This pair may not be available.',
  [SwapErrorCode.QUOTER_NOT_DEPLOYED]: 'Swap quoter not available on this network',
  [SwapErrorCode.VALIDATION_ERROR]: 'Swap validation failed. Please try again.',
  [SwapErrorCode.UNKNOWN_ERROR]: 'Swap failed. Please try again.',
}

/**
 * Custom error class for swap operations
 */
export class SwapError extends Error {
  constructor(
    public code: SwapErrorCode,
    message?: string,
    public details?: unknown
  ) {
    super(message || SwapErrorMessages[code])
    this.name = 'SwapError'
  }
}
