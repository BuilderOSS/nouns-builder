/**
 * Parses a string input into an array of token IDs
 * Supports:
 * - Comma-separated values: "1,2,3" → [1,2,3]
 * - Ranges: "1-10" → [1,2,3,4,5,6,7,8,9,10]
 * - Mixed: "1-5,8,10-12" → [1,2,3,4,5,8,10,11,12]
 * - Spaces are ignored: "1 - 5, 8" → [1,2,3,4,5,8]
 */
export function parseTokenIds(input: string): number[] {
  if (!input || input.trim() === '') {
    return []
  }

  const tokenIds = new Set<number>()

  // Split by comma
  const parts = input.split(',')

  for (const part of parts) {
    const trimmed = part.trim()

    if (trimmed === '') continue

    // Check if it's a range (e.g., "1-10")
    if (trimmed.includes('-')) {
      const rangeParts = trimmed.split('-').map((s) => s.trim())

      if (rangeParts.length !== 2) {
        throw new Error(`Invalid range format: "${trimmed}"`)
      }

      const start = parseInt(rangeParts[0], 10)
      const end = parseInt(rangeParts[1], 10)

      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Invalid numbers in range: "${trimmed}"`)
      }

      if (start > end) {
        throw new Error(`Invalid range: start (${start}) is greater than end (${end})`)
      }

      // Protect against excessively large ranges
      const MAX_RANGE_SIZE = 1000
      if (end - start + 1 > MAX_RANGE_SIZE) {
        throw new Error(
          `Range too large: maximum ${MAX_RANGE_SIZE} tokens allowed per range`
        )
      }

      // Add all numbers in the range
      for (let i = start; i <= end; i++) {
        tokenIds.add(i)
      }
    } else {
      // Single number
      const num = parseInt(trimmed, 10)

      if (isNaN(num)) {
        throw new Error(`Invalid number: "${trimmed}"`)
      }

      tokenIds.add(num)
    }
  }

  // Convert to array and sort
  return Array.from(tokenIds).sort((a, b) => a - b)
}

/**
 * Validates a token ID input string without throwing
 * Returns an object with validation status and error message
 */
export function validateTokenIdInput(input: string): {
  isValid: boolean
  error?: string
  tokenIds: number[]
} {
  try {
    const tokenIds = parseTokenIds(input)

    if (tokenIds.length === 0) {
      return {
        isValid: false,
        tokenIds: [],
        error: 'Please enter at least one token ID',
      }
    }

    return {
      isValid: true,
      tokenIds,
    }
  } catch (error) {
    return {
      isValid: false,
      tokenIds: [],
      error: error instanceof Error ? error.message : 'Invalid input',
    }
  }
}
