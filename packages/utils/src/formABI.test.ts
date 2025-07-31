import { describe, expect, vi } from 'vitest'

import {
  FIELD_SEPERATOR_CHAR,
  matchInputFromName,
  matchTypeParameters,
  normalizePathName,
} from './formABI'

beforeEach(() => {
  vi.resetModules()
})

describe('formABI utilities', () => {
  describe('matchInputFromName', () => {
    test.each([
      [
        'testing',
        [{ name: 'testing', type: 'uint256' }],
        { name: 'testing', type: 'uint256' },
      ],
      ['nottesting', [{ name: 'testing', type: 'uint256' }], undefined],
      [
        `a${FIELD_SEPERATOR_CHAR}b`,
        [{ name: 'a', type: 'tuple', components: [{ name: 'b', type: 'uint256' }] }],
        { name: 'b', type: 'uint256' },
      ],
      [
        `root${FIELD_SEPERATOR_CHAR}last${FIELD_SEPERATOR_CHAR}this`,
        [
          {
            name: 'root',
            type: 'tuple',
            components: [
              { name: 'b' },
              { name: 'last', components: [{ name: 'this', type: 'bytes32' }] },
            ],
          },
          { name: 'leaf' },
        ],
        { name: 'this', type: 'bytes32' },
      ],
    ])(
      'matchInputFromName(%s, %o) -> %o',
      (name: string, inputs: any[], expected: any) => {
        expect(matchInputFromName(name, inputs)).toEqual(expected)
      },
    )
  })

  describe('normalizePathName', () => {
    test.each([
      ['testingasdf', [], 'testingasdf'],
      ['main', ['path'], `path${FIELD_SEPERATOR_CHAR}main`],
      [
        'root',
        ['path', 'test'],
        `path${FIELD_SEPERATOR_CHAR}test${FIELD_SEPERATOR_CHAR}root`,
      ],
      ['', [], ''],
      ['', undefined, ''],
    ])(
      'normalizePathName(%s, %o) -> %s',
      (name: string, path: string[] | undefined, expected: string) => {
        expect(normalizePathName(name, path)).toEqual(expected)
      },
    )
  })

  describe('matchTypeParameters', () => {
    test.each([
      [
        'uint256',
        { type: 'uint256', argumentTypePrefix: 'uint', size: '256', isArray: false },
      ],
      [
        'bytes',
        { type: 'bytes', argumentTypePrefix: 'bytes', size: undefined, isArray: false },
      ],
      [
        'tuple',
        { type: 'tuple', argumentTypePrefix: 'tuple', size: undefined, isArray: false },
      ],
      [
        'tuple[]',
        { type: 'tuple[]', argumentTypePrefix: 'tuple', size: undefined, isArray: true },
      ],
      [
        'uint256[]',
        { type: 'uint256[]', argumentTypePrefix: 'uint', size: '256', isArray: true },
      ],
      [
        'uint16',
        { type: 'uint16', argumentTypePrefix: 'uint', size: '16', isArray: false },
      ],
      ['', { type: '', argumentTypePrefix: undefined, size: undefined, isArray: false }],
    ])('matchTypeParameters(%s) -> %o', (type: string, result: any) => {
      expect(matchTypeParameters(type)).toEqual(result)
    })
  })
})
