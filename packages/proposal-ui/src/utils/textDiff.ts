export type DiffLine = {
  type: 'added' | 'removed' | 'unchanged'
  content: string
  lineNumber?: number
}

/**
 * Creates a git-style inline diff between two strings
 * Shows each line with +/- prefixes for additions/deletions
 */
export function createInlineDiff(oldText: string, newText: string): DiffLine[] {
  if (!oldText && !newText) return []

  const oldLines = oldText ? oldText.split('\n') : []
  const newLines = newText ? newText.split('\n') : []

  const result: DiffLine[] = []

  // Simple line-by-line comparison
  // For a more sophisticated diff, we'd use a library like diff or diff-match-patch

  if (oldText === newText) {
    // No changes - show as unchanged
    newLines.forEach((line, index) => {
      result.push({
        type: 'unchanged',
        content: line,
        lineNumber: index + 1,
      })
    })
    return result
  }

  // If completely different, show all removals then all additions
  if (oldLines.length > 0) {
    oldLines.forEach((line) => {
      result.push({
        type: 'removed',
        content: line,
      })
    })
  }

  if (newLines.length > 0) {
    newLines.forEach((line, index) => {
      result.push({
        type: 'added',
        content: line,
        lineNumber: index + 1,
      })
    })
  }

  return result
}

/**
 * Format a diff line with git-style prefix
 */
export function formatDiffLine(line: DiffLine): string {
  const prefix = line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  '
  return `${prefix}${line.content}`
}
