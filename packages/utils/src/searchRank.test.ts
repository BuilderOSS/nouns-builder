import { describe, expect, it } from 'vitest'

import { classifyQuery } from './search'
import { rankDao, rankText } from './searchRank'

describe('classifyQuery', () => {
  it('detects addresses and tx hashes', () => {
    expect(classifyQuery('0x' + 'a'.repeat(40))).toBe('address')
    expect(classifyQuery(' 0x' + 'A'.repeat(40) + ' ')).toBe('address')
    expect(classifyQuery('0x' + 'b'.repeat(64))).toBe('txHash')
    expect(classifyQuery('0x' + 'a'.repeat(39))).toBe('addressPrefix')
    expect(classifyQuery('0xab12')).toBe('addressPrefix')
    expect(classifyQuery('0xab')).toBe('text')
  })

  it('detects ENS names and basenames', () => {
    expect(classifyQuery('vitalik.eth')).toBe('name')
    expect(classifyQuery('jesse.base.eth')).toBe('name')
    expect(classifyQuery('vitalik')).toBe('text')
    expect(classifyQuery('fund the skate.eth park')).toBe('text')
  })
})

describe('rankDao', () => {
  it('ranks exact name matches above description matches', () => {
    const exact = { dao: { name: 'Gnars', symbol: 'GNAR', description: '' } }
    const desc = { dao: { name: 'Other', symbol: 'OTH', description: 'gnars fan club' } }
    expect(rankDao(exact, 'gnars', 5)).toBeGreaterThan(rankDao(desc, 'gnars', 0))
  })
})

describe('rankText', () => {
  const now = 1_000_000_000

  it('ranks title matches above body matches', () => {
    const titleHit = rankText({ title: 'Skate park', body: '' }, 'skate', 3, now)
    const bodyHit = rankText({ title: 'Other', body: 'a skate park' }, 'skate', 0, now)
    expect(titleHit).toBeGreaterThan(bodyHit)
  })

  it('rewards exact titles and recency', () => {
    const exact = rankText({ title: 'skate park' }, 'skate park', 0, now)
    const prefix = rankText({ title: 'skate park fund' }, 'skate park', 0, now)
    expect(exact).toBeGreaterThan(prefix)

    const fresh = rankText({ body: 'gm', timestamp: now - 60 }, 'gm', 0, now)
    const stale = rankText({ body: 'gm', timestamp: now - 10 ** 9 }, 'gm', 0, now)
    expect(fresh).toBeGreaterThan(stale)
  })
})
