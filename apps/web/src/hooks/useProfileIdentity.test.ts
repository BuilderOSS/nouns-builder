import { getProfileLinkOverrides } from '@buildeross/sdk/subgraph'

const { getEnsText } = vi.hoisted(() => ({ getEnsText: vi.fn() }))

vi.mock('@buildeross/utils/provider', () => ({
  getProvider: () => ({ getEnsText }),
}))

vi.mock('@buildeross/sdk/subgraph', () => ({
  getProfileLinkOverrides: vi.fn(),
}))

import { fetchEnsIdentityRecords } from './useProfileIdentity'

describe('fetchEnsIdentityRecords', () => {
  beforeEach(() => {
    vi.mocked(getProfileLinkOverrides).mockReset()
    getEnsText.mockReset()
  })

  it('preserves fulfilled ENS records when another text lookup fails', async () => {
    getEnsText
      .mockResolvedValueOnce('Profile description')
      .mockRejectedValueOnce(new Error('URL lookup unavailable'))
      .mockResolvedValueOnce('@profile')

    await expect(fetchEnsIdentityRecords('profile.eth')).resolves.toEqual({
      description: 'Profile description',
      url: undefined,
      twitter: '@profile',
    })
  })
})
