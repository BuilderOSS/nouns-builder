/**
 * Format a timestamp or date string to a relative time string (e.g., "2 hours ago")
 * or an absolute date for older timestamps
 *
 * @param input - Unix timestamp in seconds OR ISO date string
 * @returns Formatted time string
 */
export function formatTimeAgo(input: number | string): string {
  // Convert input to Date object
  const date = typeof input === 'number' ? new Date(input * 1000) : new Date(input)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  // Handle recent times with relative format
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

  // For older times, return formatted date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
