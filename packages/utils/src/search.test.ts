import { assert, describe, it } from 'vitest'

import { buildSearchText, DEFAULT_STOPWORDS } from './search'

describe('buildSearchText — comprehensive', () => {
  // ---------------------------------------------------------------------------
  // Basics
  // ---------------------------------------------------------------------------
  it('returns empty for empty/whitespace', () => {
    assert.equal(buildSearchText(''), '')
    assert.equal(buildSearchText('   '), '')
    assert.equal(buildSearchText('\n\t'), '')
  })

  it('handles simple multi-word input (prefix + stemming + sort)', () => {
    const out = buildSearchText('deep techno detroit')
    assert.equal(out, 'deep:* & techno:* & detroit:*')
  })

  it('lowercases, strips diacritics, and stems', () => {
    const out = buildSearchText('CafÉ MUSIC')
    // 'cafe' (diacritics stripped), 'music' stem unchanged
    assert.equal(out, 'cafe:* & music:*')
  })

  it('dedupes repeated and equivalent stems', () => {
    const out = buildSearchText('techno technos techno')
    // Porter2: 'technos' -> 'techno'
    assert.equal(out, 'techno:*')
  })

  it('handles CamelCase and digits splitting', () => {
    const out = buildSearchText('deepTechno v2Release')
    // split -> deep, techno, v2, release
    assert.equal(out, 'deep:* & techno:* & v2:* & releas:*')
  })

  it('keeps allowed punctuation (/, -, _)', () => {
    const out = buildSearchText('api/v2 endpoint-name user_id')
    assert.equal(out, 'api/v2:* & endpoint-nam:* & user_id:*')
  })

  // ---------------------------------------------------------------------------
  // Phrases
  // ---------------------------------------------------------------------------
  it('extracts quoted phrases and builds <-> chain (prefix only on last by default)', () => {
    const out = buildSearchText('"new york" detroit')
    // 'new' is not a PG stopword, default phrasePrefixAll=false -> last token prefixed
    assert.equal(out, 'new <-> york:* & detroit:*')
  })

  it('applies prefix to all words in phrase when phrasePrefixAll=true', () => {
    const out = buildSearchText('"deep techno house"', { phrasePrefixAll: true })
    assert.equal(out, 'deep:* <-> techno:* <-> hous:*')
  })

  it('drops stopwords inside phrases and still builds a valid chain', () => {
    const out = buildSearchText('"the detroit techno"')
    // 'the' removed; last term gets prefix by default
    assert.equal(out, 'detroit <-> techno:*')
  })

  // ---------------------------------------------------------------------------
  // Stopwords
  // ---------------------------------------------------------------------------
  it('uses provided (PG) stopwords', () => {
    const out = buildSearchText('the gas stations and the city')
    // 'the' and 'and' dropped
    assert.equal(out, 'gas:* & station:* & citi:*')
  })

  it('allows custom stopword set override', () => {
    const custom = new Set<string>([...DEFAULT_STOPWORDS, 'music'])
    const out = buildSearchText('detroit music', { stopwords: custom })
    assert.equal(out, 'detroit:*')
  })

  // ---------------------------------------------------------------------------
  // Prefix handling
  // ---------------------------------------------------------------------------
  it('disables prefix when usePrefix=false', () => {
    const out = buildSearchText('detroit techno', { usePrefix: false })
    assert.equal(out, 'detroit & techno')
  })

  it('respects minPrefixLength threshold', () => {
    const out = buildSearchText('ai ml music', { minPrefixLength: 3 })
    // 'ai' and 'ml' too short for :*, but still included
    assert.equal(out, 'ai & ml & music:*')
  })

  // ---------------------------------------------------------------------------
  // Operator modes — none (default)
  // ---------------------------------------------------------------------------
  it('default operatorMode=none ignores user operators', () => {
    const out = buildSearchText('breaks & electro | detroit')
    // user ops removed; tokens stemmed, prefixed AND-joined
    assert.equal(out, 'break:* & electro:* & detroit:*')
  })

  // ---------------------------------------------------------------------------
  // Operator modes — partial (preserve &, |, <->, !, ( ))
  // ---------------------------------------------------------------------------
  it('partial: preserves & and | and interleaves with normalized tokens', () => {
    const out = buildSearchText('breaks & electro | detroit', { operatorMode: 'partial' })
    // order preserved, stems applied, prefixes applied
    assert.equal(out, 'break:* & electro:* | detroit:*')
  })

  it('partial: preserves <-> operator between terms', () => {
    const out = buildSearchText('new <-> york', { operatorMode: 'partial' })
    assert.equal(out, 'new:* <-> york:*')
  })

  it('partial: preserves ! (NOT) and parentheses', () => {
    const out = buildSearchText('( deep | minimal ) & techno ! detroit', {
      operatorMode: 'partial',
    })
    assert.equal(out, '( deep:* | minim:* ) & techno:* ! detroit:*')
  })

  it('partial: properly splits multi-piece tokens and AND-joins them', () => {
    const out = buildSearchText('deepTechno & api/v2', { operatorMode: 'partial' })
    // deepTechno -> deep & techno (glued with &), then we keep the user '&' between big tokens
    // mapped sequence: '(deep:* & techno:*) & api/v2:*' — our implementation glues pieces with '&'
    assert.equal(out, 'deep:* & techno:* & api/v2:*')
  })

  // ---------------------------------------------------------------------------
  // Operator modes — raw
  // ---------------------------------------------------------------------------
  it('raw: returns input as-is (trusted expert mode)', () => {
    const input = 'Deep & (Techno | Electro) ! "Detroit"'
    const out = buildSearchText(input, { operatorMode: 'raw' })
    // Raw returns input.trim() per implementation
    assert.equal(out, input.trim())
  })

  // ---------------------------------------------------------------------------
  // Default logic control (AND/OR)
  // ---------------------------------------------------------------------------
  it('joins tokens with OR when defaultLogic="OR"', () => {
    const out = buildSearchText('detroit techno', { defaultLogic: 'OR' })
    assert.equal(out, 'detroit:* | techno:*')
  })

  // ---------------------------------------------------------------------------
  // Token limits
  // ---------------------------------------------------------------------------
  it('enforces maxTokens (post-normalization)', () => {
    const input = 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu'
    const out = buildSearchText(input, { maxTokens: 5 })
    // first 5  all with :*
    assert.equal(out, 'alpha:* & beta:* & gamma:* & delta:* & epsilon:*')
  })

  it('returns empty if everything becomes stopwords or empties', () => {
    const out = buildSearchText('the and or the')
    assert.equal(out, '')
  })

  // ---------------------------------------------------------------------------
  // Quoting & edge cases
  // ---------------------------------------------------------------------------
  it('handles multiple phrases combined with tokens', () => {
    const out = buildSearchText('"new york" "deep techno" detroit')
    // phrase1 -> new <-> york:*
    // phrase2 -> deep <-> techno:* (last-only prefix)
    // plus detroit:*
    assert.equal(out, 'new <-> york:* & deep <-> techno:* & detroit:*')
  })

  it('ignores empty quotes and redundant whitespace', () => {
    const out = buildSearchText('deep  ""   techno   ')
    assert.equal(out, 'deep:* & techno:*')
  })

  it('sanitizes weird punctuation but keeps allowed ones', () => {
    const out = buildSearchText(`deep\u0000\u0007techno*** detroit—music`)
    // control chars and asterisks removed; em-dash becomes space and then cleaned
    assert.equal(out, 'deep:* & techno:* & detroit:* & music:*')
  })

  it('handles very short tokens with prefix threshold boundary', () => {
    const out = buildSearchText('a i an x y z', { minPrefixLength: 2 })
    // a, an, i, are PG stopwords (dropped); i, x, y, z remain; 1-char tokens <2 -> no :*
    assert.equal(out, 'x & y & z')
  })

  // ---------------------------------------------------------------------------
  // Additional edge and coverage tests
  // ---------------------------------------------------------------------------

  it('handles phrase-only input', () => {
    const out = buildSearchText('"new york"')
    // Single phrase input -> phrase only
    assert.equal(out, 'new <-> york:*')
  })

  it('returns empty when all words are stopwords', () => {
    const out = buildSearchText('the and of in on')
    // Everything dropped -> empty string
    assert.equal(out, '')
  })

  it('respects prefix threshold edge (token just below threshold still included)', () => {
    const out = buildSearchText('alpha', { minPrefixLength: 6 })
    // 'alpha' length = 5 < 6, so included but no :*
    assert.equal(out, 'alpha')
  })

  it('handles partial operator mode combined with phrases', () => {
    const out = buildSearchText('"new york" & detroit', { operatorMode: 'partial' })
    // preserves &, stems and prefixes applied correctly
    assert.equal(out, 'new <-> york:* & detroit:*')
  })

  it('raw mode preserves emojis and unusual characters', () => {
    const input = 'alpha & beta 🚀 gamma'
    const out = buildSearchText(input, { operatorMode: 'raw' })
    // raw mode returns trimmed input exactly
    assert.equal(out, input.trim())
  })

  it('enforces maxTokens but preserves phrases', () => {
    const input = '"new york" alpha beta gamma delta epsilon zeta'
    const out = buildSearchText(input, { maxTokens: 3 })
    // phrase preserved first, then truncated single tokens (alphabetically)
    assert.ok(out.includes('new <-> york:*'))
    const parts = out.split('&').map((s) => s.trim())
    // 3 or fewer total expressions including phrase
    assert.ok(parts.length <= 3)
  })

  it('handles emoji and symbols gracefully in normal mode', () => {
    const out = buildSearchText('deep 💥 techno 🎧 detroit')
    // emojis stripped, remaining tokens stemmed/prefixed
    assert.equal(out, 'deep:* & techno:* & detroit:*')
  })

  it('handles mixed quotes and operators correctly in partial mode', () => {
    const out = buildSearchText('"deep techno" | electro', { operatorMode: 'partial' })
    // phrase preserved, operator maintained
    assert.equal(out, 'deep <-> techno:* | electro:*')
  })
})
