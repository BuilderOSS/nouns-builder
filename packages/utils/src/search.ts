import stem from 'wink-porter2-stemmer'

const stemToken = (t: string): string => stem(t)

/**
 * Options to control how search text is built for Graph fulltext queries.
 */
export type BuildOptions = {
  /** Combine tokens with AND or OR when the user didn’t give explicit operators */
  defaultLogic?: 'AND' | 'OR'
  /** Enable the :* prefix operator for partial word matching */
  usePrefix?: boolean
  /** Minimum token length to apply :* prefix (The Graph requires ≥ 2 characters) */
  minPrefixLength?: number
  /** Operator handling mode:
   *  - "none" (default): ignore user operators, auto-insert default logic
   *  - "partial": allow operators but still normalize terms
   *  - "raw": trust user input fully (expert mode)
   */
  operatorMode?: 'none' | 'partial' | 'raw'
  /** Maximum tokens to include (prevents overly long queries) */
  maxTokens?: number
  /** Stopword set to exclude common words */
  stopwords?: Set<string>
  /** Apply prefix to all words in phrase (default: false, only applies to last word) */
  phrasePrefixAll?: boolean
}

/** Postgres-compatible stopword set */
export const DEFAULT_STOPWORDS = new Set([
  'i',
  'me',
  'my',
  'myself',
  'we',
  'our',
  'ours',
  'ourselves',
  'you',
  'your',
  'yours',
  'yourself',
  'yourselves',
  'he',
  'him',
  'his',
  'himself',
  'she',
  'her',
  'hers',
  'herself',
  'it',
  'its',
  'itself',
  'they',
  'them',
  'their',
  'theirs',
  'themselves',
  'what',
  'which',
  'who',
  'whom',
  'this',
  'that',
  'these',
  'those',
  'am',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'having',
  'do',
  'does',
  'did',
  'doing',
  'a',
  'an',
  'the',
  'and',
  'but',
  'if',
  'or',
  'because',
  'as',
  'until',
  'while',
  'of',
  'at',
  'by',
  'for',
  'with',
  'about',
  'against',
  'between',
  'into',
  'through',
  'during',
  'before',
  'after',
  'above',
  'below',
  'to',
  'from',
  'up',
  'down',
  'in',
  'out',
  'on',
  'off',
  'over',
  'under',
  'again',
  'further',
  'then',
  'once',
  'here',
  'there',
  'when',
  'where',
  'why',
  'how',
  'all',
  'any',
  'both',
  'each',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'no',
  'nor',
  'not',
  'only',
  'own',
  'same',
  'so',
  'than',
  'too',
  'very',
  's',
  't',
  'can',
  'will',
  'just',
  'don',
  'should',
  'now',
])

/**
 * Build a safe, expressive search text string compatible with The Graph fulltext queries.
 */
export function buildSearchText(input: string, opts: BuildOptions = {}): string {
  const {
    defaultLogic = 'AND',
    usePrefix = true,
    minPrefixLength = 2,
    operatorMode = 'none',
    maxTokens = 12,
    stopwords = DEFAULT_STOPWORDS,
    phrasePrefixAll = false,
  } = opts

  if (!input?.trim()) return ''

  // ========================= 1) NORMALIZATION =========================
  const normalizeForSplit = (text: string) =>
    text
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics

  // Allow expert operators/Grouping in sanitized text: ! ( )
  const sanitize = (s: string) => s.replace(/[^\p{L}\p{N}\s"'<>\-|:&/!()_]/gu, ' ') // Unicode-safe sanitize

  // If expert mode, trust user input fully and return as-is.
  if (operatorMode === 'raw') {
    return input.trim()
  }

  let text = sanitize(normalizeForSplit(input)).trim()

  // ========================= 2) EXTRACT QUOTED PHRASES =========================
  const phrases: string[] = []
  text = text.replace(/"([^"]+)"/g, (_, inner) => {
    const cleaned = inner.trim().replace(/\s+/g, ' ')
    if (cleaned) phrases.push(cleaned)
    return ' '
  })

  // ========================= 3) HELPERS =========================
  const splitSmart = (t: string): string[] =>
    t
      // Split camelCase transitions only if there's at least one lower→upper *after* first char
      .replace(/([a-z])([A-Z][a-z])/g, '$1 $2')
      // Split digit→letter so v2Release => v2 Release
      .replace(/([0-9])([a-zA-Z])/g, '$1 $2')
      .split(/\s+/)
      .filter(Boolean)

  const cleanToken = (t: string): string => t.replace(/[^a-z0-9/_-]/g, '').trim()

  const dedupe = <T>(arr: T[]): T[] => Array.from(new Set(arr))

  const isStopword = (t: string) => stopwords.has(t)

  // Operators we may preserve in 'partial' mode
  const OP_TOKENS = new Set(['&', '|', '<->', '!', '(', ')'])
  const tokenizeWithOps = (s: string): string[] =>
    s
      .replace(/<->/g, ' <-> ')
      .replace(/([&|!()])/g, ' $1 ')
      .trim()
      .split(/\s+/)
      .filter(Boolean)

  // ========================= 4) TOKEN EXTRACTION =========================
  const userHasOps = /[&|]|<->|!|\(|\)/.test(text)

  let rawTerms: string[]
  if (operatorMode === 'none') {
    rawTerms = text.split(/\s+/).filter(Boolean)
  } else {
    // 'partial' -> keep operators in the stream
    rawTerms = tokenizeWithOps(text)
  }

  // In 'none' we strip ops; in 'partial' we keep them for later reassembly
  const operatorSafe =
    operatorMode === 'none' || (operatorMode === 'partial' && !userHasOps)
  if (operatorSafe) {
    rawTerms = rawTerms.filter((t) => !OP_TOKENS.has(t))
  }

  const terms = rawTerms.flatMap(splitSmart).map((s) => s.toLowerCase())

  const filteredTerms = dedupe(
    terms
      .map(cleanToken)
      .filter(Boolean)
      .filter((t) => !isStopword(t))
      .map(stemToken)
  ).slice(0, maxTokens * 2) // pre-cap before building expressions

  // ========================= 5) EXPRESSION BUILDERS =========================
  const asPrefix = (t: string): string =>
    usePrefix && t.length >= minPrefixLength ? `${t}:*` : ''

  const buildTokenExpr = (t: string): string => asPrefix(t) || t

  const buildPhraseExpr = (phrase: string): string => {
    const parts = splitSmart(phrase)
      .map((w) => w.toLowerCase())
      .map(cleanToken)
      .filter(Boolean)
      .filter((p) => !isStopword(p))
      .map(stemToken)

    if (parts.length === 0) return ''

    const exprParts = parts.map((p, i) => {
      if (phrasePrefixAll || i === parts.length - 1) return asPrefix(p) || p
      return p
    })

    return exprParts.join(' <-> ')
  }

  // ========================= 6) BUILD FINAL QUERY =========================
  const phraseTokens = phrases.map(buildPhraseExpr).filter(Boolean)

  // If 'partial' and user supplied operators: interleave preserved ops with normalized tokens
  if (operatorMode === 'partial' && userHasOps) {
    const seq = tokenizeWithOps(text)
    const mapped: string[] = []
    let tokenCount = 0

    for (const tok of seq) {
      if (OP_TOKENS.has(tok)) {
        mapped.push(tok) // keep &, |, <->, !, (, )
        continue
      }

      // Normalize this non-operator token like the standard pipeline
      const pieces = splitSmart(tok)
        .map((w) => w.toLowerCase())
        .map(cleanToken)
        .filter(Boolean)
        .filter((t) => !isStopword(t))
        .map(stemToken)
        .map(buildTokenExpr)

      if (pieces.length) {
        // If a token split into multiple pieces (e.g., camelCase), AND them
        const glued = pieces.join(' & ')
        mapped.push(glued)
        tokenCount += pieces.length
        if (tokenCount >= maxTokens) break
      }
    }

    const joiner = defaultLogic === 'OR' ? ' | ' : ' & '

    const head = phraseTokens.length ? phraseTokens.join(joiner).trim() : ''
    const body = mapped.join(' ').trim()

    if (!head) return body || ''

    // Avoid double operators: if body starts with an operator, don't add our joiner
    const startsWithOp = mapped.length > 0 && OP_TOKENS.has(mapped[0])
    const out = startsWithOp ? `${head} ${body}` : `${head}${joiner}${body}`
    return out.trim()
  }

  // No user ops to preserve -> default combine
  const singleTokens = filteredTerms.map(buildTokenExpr)
  let tokens = dedupe([...phraseTokens, ...singleTokens])
  if (tokens.length > maxTokens) tokens = tokens.slice(0, maxTokens)
  if (!tokens.length) return ''

  const joiner = defaultLogic === 'OR' ? ' | ' : ' & '

  return tokens.join(joiner)
}
