/**
 * Runs an async function with a timeout.
 *
 * @param operation - A Promise or function returning a Promise to bound
 * @param timeoutMs - Timeout in milliseconds
 * @param label - Human-readable operation name for timeout errors
 * @returns A Promise that resolves with the function result or rejects on timeout
 */
export async function withTimeout<T>(
  operation: Promise<T> | (() => Promise<T>),
  timeoutMs: number,
  label = 'Operation',
  onTimeout?: () => void
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      try {
        onTimeout?.()
      } catch (error) {
        reject(error)
        return
      }
      reject(new Error(`${label} timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    const promise = Promise.resolve().then(() =>
      typeof operation === 'function' ? operation() : operation
    )

    promise
      .then((result) => {
        clearTimeout(timer)
        resolve(result)
      })
      .catch((err) => {
        clearTimeout(timer)
        reject(err)
      })
  })
}
