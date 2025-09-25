/**
 * Runs an async function with a timeout.
 *
 * @param fn - A function returning a Promise<T>
 * @param timeoutMs - Timeout in milliseconds
 * @returns A Promise that resolves with the function result or rejects on timeout
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs} ms`))
    }, timeoutMs)

    fn()
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
