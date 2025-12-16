/**
 * Execute promises with controlled concurrency
 */
export async function executeConcurrently<T>(
  tasks: (() => Promise<T>)[],
  maxConcurrent: number = 2
): Promise<T[]> {
  const maxConcurrency = Math.max(
    1,
    Math.floor(Number.isFinite(maxConcurrent) ? maxConcurrent : 1)
  )
  const results: T[] = []
  for (let i = 0; i < tasks.length; i += maxConcurrency) {
    const batch = tasks.slice(i, i + maxConcurrency)
    const batchResults = await Promise.all(batch.map((t) => t()))
    results.push(...batchResults)
  }
  return results
}
