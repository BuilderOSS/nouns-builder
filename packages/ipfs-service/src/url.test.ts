import { describe, expect, it } from 'vitest'

import { isCID, isNormalizeableIPFSUrl, normalizeIPFSUrl } from './url'

const VALID_CID = 'bafkreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq'

describe('isCID', () => {
  describe('CID v0', () => {
    it('handles valid v0 CIDs', () => {
      const v0CID = 'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR'
      expect(isCID(v0CID)).toBe(true)
    })

    it('handles v0 CIDs with different content', () => {
      const v0CIDs = [
        'QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o',
        'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o',
        'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u',
      ]
      v0CIDs.forEach((cid) => {
        expect(isCID(cid)).toBe(true)
      })
    })

    it('tests v0 CID length boundaries', () => {
      // v0 CIDs must be exactly 46 characters (Qm + 44 chars)
      const base = 'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsM'

      // 43 chars after Qm (45 total) - should fail
      const tooShort43 = base.slice(0, 45)
      expect(isCID(tooShort43)).toBe(false)

      // 44 chars after Qm (46 total) - should pass
      const correct44 = base + 'nR'
      expect(isCID(correct44)).toBe(true)
      expect(correct44.length).toBe(46)

      // 45 chars after Qm (47 total) - should fail
      const tooLong45 = base + 'nRX'
      expect(isCID(tooLong45)).toBe(false)
    })

    it('rejects invalid v0 CIDs', () => {
      const invalidV0CIDs = [
        'Qm',
        'QmT',
        'QmTooShort',
        'QmTooLongButNotValidBase58CheckThisOutItIsWayTooLongForAValidCIDv0Hash',
        'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMn0', // invalid base58 char '0'
        'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnO', // invalid base58 char 'O'
        'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnI', // invalid base58 char 'I'
        'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnl', // invalid base58 char 'l'
      ]
      invalidV0CIDs.forEach((cid) => {
        expect(isCID(cid)).toBe(false)
      })
    })

    it('tests v0 CID invalid characters', () => {
      // Base58 excludes: 0, O, I, l
      const invalidChars = ['0', 'O', 'I', 'l']
      const baseValid = 'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMn'

      invalidChars.forEach((char) => {
        const invalidCID = baseValid + char
        expect(isCID(invalidCID)).toBe(false)
      })
    })
  })

  describe('CID v1', () => {
    it('handles base32 encoded CIDs (baf...)', () => {
      const base32CIDs = [
        'bafkreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq',
        'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
        'bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku',
      ]
      base32CIDs.forEach((cid) => {
        expect(isCID(cid)).toBe(true)
      })
    })

    it('handles different CID v1 prefix variations', () => {
      const prefixVariations = [
        'bafkreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq', // bafk
        'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi', // bafy
        'bafzbeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi', // bafz
        'baekreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq', // baek
        'bahkreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq', // bahk
        'baikreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq', // baik
        'bajkreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq', // bajk
        'bamkreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq', // bamk
        'bankreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq', // bank
        'baokreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq', // baok
        'bapkreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq', // bapk
        'baqkreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq', // baqk
        'barkreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq', // bark
        'baskreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq', // bask
        'batkreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq', // batk
        'baukreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq', // bauk
        'bavkreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq', // bavk
        'bawkreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq', // bawk
        'baxkreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq', // baxk
        'baykreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq', // bayk
        'bazkreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq', // bazk
      ]
      prefixVariations.forEach((cid) => {
        expect(isCID(cid)).toBe(true)
      })
    })

    it('handles base36 encoded CIDs (ba...)', () => {
      const base36CIDs = [
        'bagaaierasords4njcts6vs7qvdjfcvgnume4hqohf65zsfguprqphs3icwea',
        'baguqeerasords4njcts6vs7qvdjfcvgnume4hqohf65zsfguprqphs3icwea',
      ]
      base36CIDs.forEach((cid) => {
        expect(isCID(cid)).toBe(true)
      })
    })

    it('handles base58btc encoded CIDs (ba...)', () => {
      const base58btcCIDs = [
        'bafkreidgvpkjawlxz6sffxzwgooowe5yt7i6wsyg236mfoks77nywkptdq',
        'bagaaierasords4njcts6vs7qvdjfcvgnume4hqohf65zsfguprqphs3icwea',
      ]
      base58btcCIDs.forEach((cid) => {
        expect(isCID(cid)).toBe(true)
      })
    })

    it('handles base64 encoded CIDs (ba...)', () => {
      const base64CIDs = [
        'baeaaierasords4njcts6vs7qvdjfcvgnume4hqohf65zsfguprqphs3icwea',
        'bauaaierasords4njcts6vs7qvdjfcvgnume4hqohf65zsfguprqphs3icwea',
      ]
      base64CIDs.forEach((cid) => {
        expect(isCID(cid)).toBe(true)
      })
    })

    it('handles minimum length CID v1', () => {
      const minLengthCID = 'ba' + 'a'.repeat(50)
      expect(isCID(minLengthCID)).toBe(true)
    })

    it('handles longer CID v1', () => {
      const longCID = 'ba' + 'a'.repeat(100)
      expect(isCID(longCID)).toBe(true)
    })

    it('tests v1 CID length boundaries', () => {
      // v1 CIDs must have at least 50 chars after 'ba' prefix (52 total minimum)
      const prefix = 'ba'

      // 49 chars after ba (51 total) - should fail
      const tooShort49 = prefix + 'a'.repeat(49)
      expect(isCID(tooShort49)).toBe(false)
      expect(tooShort49.length).toBe(51)

      // 50 chars after ba (52 total) - should pass
      const correct50 = prefix + 'a'.repeat(50)
      expect(isCID(correct50)).toBe(true)
      expect(correct50.length).toBe(52)

      // 51 chars after ba (53 total) - should pass
      const correct51 = prefix + 'a'.repeat(51)
      expect(isCID(correct51)).toBe(true)
      expect(correct51.length).toBe(53)
    })

    it('rejects CID v1 that are too short', () => {
      const tooShortCIDs = [
        'ba',
        'baa',
        'ba' + 'a'.repeat(49), // 51 chars total, need at least 52
      ]
      tooShortCIDs.forEach((cid) => {
        expect(isCID(cid)).toBe(false)
      })
    })

    it('tests v1 CID invalid characters', () => {
      // Test characters outside allowed alphanumeric range
      const invalidChars = [
        '@',
        '#',
        '$',
        '%',
        '^',
        '&',
        '*',
        '(',
        ')',
        '-',
        '+',
        '=',
        '[',
        ']',
        '{',
        '}',
        '|',
        '\\',
        ':',
        ';',
        '"',
        "'",
        '<',
        '>',
        ',',
        '.',
        '?',
        '/',
        '~',
        '`',
      ]
      const baseValid = 'ba' + 'a'.repeat(50)

      invalidChars.forEach((char) => {
        const invalidCID = 'ba' + char + 'a'.repeat(49)
        expect(isCID(invalidCID)).toBe(false)
      })

      // Test with invalid characters at the end
      invalidChars.forEach((char) => {
        const invalidCID = baseValid.slice(0, -1) + char
        expect(isCID(invalidCID)).toBe(false)
      })
    })
  })

  describe('Invalid CIDs', () => {
    it('handles null and undefined', () => {
      expect(isCID(null)).toBe(false)
      expect(isCID(undefined)).toBe(false)
    })

    it('handles empty string', () => {
      expect(isCID('')).toBe(false)
    })

    it('handles non-string types', () => {
      expect(isCID(123 as any)).toBe(false)
      expect(isCID({} as any)).toBe(false)
      expect(isCID([] as any)).toBe(false)
    })

    it('handles strings that do not match CID format', () => {
      const invalidCIDs = [
        'not a cid',
        'http://example.com',
        'Zm123abc', // wrong prefix
        'bz123abc', // wrong prefix
        'Qm123', // too short for v0
        'ba123', // too short for v1
      ]
      invalidCIDs.forEach((cid) => {
        expect(isCID(cid)).toBe(false)
      })
    })
  })
})

describe('isNormalizeableIPFSUrl', () => {
  it('handles already normalized urls', () => {
    const normalizedUrl = `ipfs://${VALID_CID}`
    expect(isNormalizeableIPFSUrl(normalizedUrl)).toBe(true)
  })
  it('handles raw CIDs', () => {
    const rawCID = VALID_CID
    expect(isNormalizeableIPFSUrl(rawCID)).toBe(true)
  })
  it('handles gateway urls', () => {
    const gatewayUrl = `https://my.gateway.com/ipfs/${VALID_CID}`
    expect(isNormalizeableIPFSUrl(gatewayUrl)).toBe(true)
  })
  it('handles urls wrapped in quotes', () => {
    const gatewayUrl = `"https://my.gateway.com/ipfs/${VALID_CID}"`
    expect(isNormalizeableIPFSUrl(gatewayUrl)).toBe(true)
  })
  it('handles directory gateway urls', () => {
    const directoryCIDWithPath = `https://my.gateway.com/ipfs/${VALID_CID}/filename.txt`
    expect(isNormalizeableIPFSUrl(directoryCIDWithPath)).toBe(true)
  })
  it('supports query strings and fragments', () => {
    const complexUrl = `https://my.gateway.com/ipfs/${VALID_CID}?query=value#hash`
    expect(isNormalizeableIPFSUrl(complexUrl)).toBe(true)
  })
  it('handles non-ipfs urls', () => {
    const nonIPFSUrl = 'https://galverse.art/api/metadata/metadata.json'
    expect(isNormalizeableIPFSUrl(nonIPFSUrl)).toBe(false)
  })
  it('handles invalid urls', () => {
    const invalidUrl = 'not a cid or url'
    expect(isNormalizeableIPFSUrl(invalidUrl)).toBe(false)
  })
})

describe('normalizeIPFSUrl', () => {
  it('handles already normalized urls', () => {
    const normalizedUrl = `ipfs://${VALID_CID}`
    expect(normalizeIPFSUrl(normalizedUrl)).toBe(`ipfs://${VALID_CID}`)
  })
  it('handles raw CIDs', () => {
    const rawCID = VALID_CID
    expect(normalizeIPFSUrl(rawCID)).toBe(`ipfs://${VALID_CID}`)
  })
  it('handles gateway urls', () => {
    const gatewayUrl = `https://my.gateway.com/ipfs/${VALID_CID}`
    expect(normalizeIPFSUrl(gatewayUrl)).toBe(`ipfs://${VALID_CID}`)
  })
  it('handles urls wrapped in quotes', () => {
    const gatewayUrl = `"https://my.gateway.com/ipfs/${VALID_CID}"`
    expect(normalizeIPFSUrl(gatewayUrl)).toBe(`ipfs://${VALID_CID}`)
  })
  it('handles directory gateway urls', () => {
    const directoryCIDWithPath = `https://my.gateway.com/ipfs/${VALID_CID}/filename.txt`
    expect(normalizeIPFSUrl(directoryCIDWithPath)).toBe(
      `ipfs://${VALID_CID}/filename.txt`
    )
  })
  it('supports query strings and fragments', () => {
    const complexUrl = `https://my.gateway.com/ipfs/${VALID_CID}?query=value#hash`
    expect(normalizeIPFSUrl(complexUrl)).toBe(`ipfs://${VALID_CID}?query=value#hash`)
  })
  it('handles non-ipfs urls', () => {
    const nonIPFSUrl = 'https://galverse.art/api/metadata/metadata.json'
    expect(normalizeIPFSUrl(nonIPFSUrl)).toBe(null)
  })
  it('handles invalid urls', () => {
    const invalidUrl = 'not a cid or url'
    expect(normalizeIPFSUrl(invalidUrl)).toBe(null)
  })
})
