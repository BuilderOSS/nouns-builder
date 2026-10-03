export const WALLET_CONNECTION_ERROR_MESSAGE =
  'Wallet connection error. Please disconnect and reconnect your wallet.'

function sanitizeErrorMessage(message: string): string {
  if (message.includes('connector.getChainId is not a function')) {
    return WALLET_CONNECTION_ERROR_MESSAGE
  }

  return message
}

export const getErrorMessage = (error: unknown): string => {
  if (!error) return 'An unknown error occurred.'
  if (typeof error === 'string') return sanitizeErrorMessage(error)
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>
    if ('shortMessage' in errorObj && typeof errorObj.shortMessage === 'string') {
      return sanitizeErrorMessage(errorObj.shortMessage)
    }
    if ('message' in errorObj && typeof errorObj.message === 'string') {
      return sanitizeErrorMessage(errorObj.message)
    }
  }
  return 'An unknown error occurred.'
}
