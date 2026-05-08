export const normalizeTextForCompare = (value?: string) =>
  (value || '')
    .toLowerCase()
    .replace(/[\s\-_.:;,!?\'"`~()\[\]{}]+/g, ' ')
    .trim()
