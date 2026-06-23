import { type Change, diffLines } from 'diff'

export type DiffLine = {
  type: 'added' | 'removed' | 'unchanged'
  content: string
  lineNumber?: number
}

/**
 * Creates a git-style inline diff between two strings
 * Shows each line with +/- prefixes for additions/deletions
 * Uses the 'diff' library for intelligent line-by-line comparison
 */
export function createInlineDiff(oldText: string, newText: string): DiffLine[] {
  if (!oldText && !newText) return []

  // Use the diff library for proper line-by-line comparison
  const changes: Change[] = diffLines(oldText || '', newText || '')

  const result: DiffLine[] = []
  let currentLineNumber = 1

  changes.forEach((change) => {
    const lines = change.value.split('\n')
    // Remove the last empty line if the change ends with a newline
    if (lines[lines.length - 1] === '') {
      lines.pop()
    }

    lines.forEach((line) => {
      if (change.added) {
        result.push({
          type: 'added',
          content: line,
          lineNumber: currentLineNumber++,
        })
      } else if (change.removed) {
        result.push({
          type: 'removed',
          content: line,
        })
      } else {
        result.push({
          type: 'unchanged',
          content: line,
          lineNumber: currentLineNumber++,
        })
      }
    })
  })

  return result
}

/**
 * Format a diff line with git-style prefix
 */
export function formatDiffLine(line: DiffLine): string {
  const prefix = line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  '
  return `${prefix}${line.content}`
}
