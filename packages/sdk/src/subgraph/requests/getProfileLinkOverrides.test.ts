import { CHAIN_ID } from '@buildeross/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getProfileLinkOverrides } from './getProfileLinkOverrides'

const { clientConfigMock, requestMock } = vi.hoisted(() => ({
  clientConfigMock: vi.fn(),
  requestMock: vi.fn(),
}))

vi.mock('graphql-request', () => ({
  gql: (strings: TemplateStringsArray) => strings.join(''),
  GraphQLClient: class {
    request = requestMock

    constructor(_url: string, config: RequestInit) {
      clientConfigMock(config)
    }
  },
}))

const profileAddress = '0x00000000000000000000000000000000000000aa'

const decodedLink = (key: string, value: string) =>
  JSON.stringify([
    { name: 'key', value: { value: key } },
    { name: 'value', value: { value } },
  ])

describe('getProfileLinkOverrides', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses a ten-second timeout and treats the latest empty value as removal', async () => {
    const timeoutSignal = new AbortController().signal
    const timeoutSpy = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutSignal)
    requestMock.mockResolvedValue({
      attestations: [
        {
          id: `0x${'1'.repeat(64)}`,
          attester: profileAddress,
          recipient: profileAddress,
          time: 3,
          decodedDataJson: decodedLink('x', ''),
          revoked: false,
        },
        {
          id: `0x${'2'.repeat(64)}`,
          attester: profileAddress,
          recipient: profileAddress,
          time: 2,
          decodedDataJson: decodedLink('x', 'stale_handle'),
          revoked: false,
        },
        {
          id: `0x${'3'.repeat(64)}`,
          attester: profileAddress,
          recipient: profileAddress,
          time: 1,
          decodedDataJson: decodedLink('website', 'https://example.com'),
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

    expect(timeoutSpy).toHaveBeenCalledWith(10_000)
    expect(clientConfigMock).toHaveBeenCalledWith(
      expect.objectContaining({ signal: timeoutSignal })
    )
  })
})
