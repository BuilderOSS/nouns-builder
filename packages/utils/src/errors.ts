export const getErrorMessage = (error: unknown): string => {
  if (!error) return 'An unknown error occurred.'
  if (typeof error === 'string') return error
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>
    if ('shortMessage' in errorObj && typeof errorObj.shortMessage === 'string') {
      return errorObj.shortMessage
    }
    if ('message' in errorObj && typeof errorObj.message === 'string') {
      return errorObj.message
    }
  }
  return 'An unknown error occurred.'
}
