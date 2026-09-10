import { CHAIN_ID } from '@buildeross/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getProfileLinkOverrides } from './getProfileLinkOverrides'

const { profileLinkOverridesMock } = vi.hoisted(() => ({
  profileLinkOverridesMock: vi.fn(),
}))

vi.mock('../client', () => ({
  SDK: {
    connect: vi.fn(() => ({
      profileLinkOverrides: profileLinkOverridesMock,
    })),
  },
}))

const profileAddress = '0x00000000000000000000000000000000000000aa'

describe('getProfileLinkOverrides', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('queries the subgraph and treats the latest empty value as removal', async () => {
    profileLinkOverridesMock.mockResolvedValue({
      profileLinkOverrides: [
        {
          id: `0x${'1'.repeat(64)}`,
          key: 'x',
          value: '',
          timestamp: '3',
          creator: profileAddress,
          revoked: false,
        },
        {
          id: `0x${'2'.repeat(64)}`,
          key: 'x',
          value: 'stale_handle',
          timestamp: '2',
          creator: profileAddress,
          revoked: false,
        },
        {
          id: `0x${'3'.repeat(64)}`,
          key: 'website',
          value: 'https://example.com',
          timestamp: '1',
          creator: profileAddress,
          revoked: false,
        },
      ],
    })

    await expect(getProfileLinkOverrides(profileAddress, CHAIN_ID.BASE)).resolves.toEqual(
      [
        expect.objectContaining({
          key: 'website',
          value: 'https://example.com',
        }),
      ]
    )

    expect(profileLinkOverridesMock).toHaveBeenCalledWith({
      address: profileAddress,
    })
  })

  it('returns empty array for invalid address', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(getProfileLinkOverrides('invalid')).resolves.toEqual([])

    expect(consoleSpy).toHaveBeenCalledWith('Invalid profile address')
    expect(profileLinkOverridesMock).not.toHaveBeenCalled()
  })

  it('returns empty array for unsupported chain', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(
      getProfileLinkOverrides(profileAddress, CHAIN_ID.ETHEREUM)
    ).resolves.toEqual([])

    expect(consoleSpy).toHaveBeenCalledWith(
      'Profile links are only available on BASE or BASE_SEPOLIA'
    )
    expect(profileLinkOverridesMock).not.toHaveBeenCalled()
  })

  it('filters out non-standard keys', async () => {
    profileLinkOverridesMock.mockResolvedValue({
      profileLinkOverrides: [
        {
          id: `0x${'1'.repeat(64)}`,
          key: 'invalid_key',
          value: 'test',
          timestamp: '1',
          creator: profileAddress,
          revoked: false,
        },
        {
          id: `0x${'2'.repeat(64)}`,
          key: 'website',
          value: 'https://example.com',
          timestamp: '2',
          creator: profileAddress,
          revoked: false,
        },
      ],
    })

    await expect(getProfileLinkOverrides(profileAddress, CHAIN_ID.BASE)).resolves.toEqual(
      [
        expect.objectContaining({
          key: 'website',
          value: 'https://example.com',
        }),
      ]
    )
  })
})
