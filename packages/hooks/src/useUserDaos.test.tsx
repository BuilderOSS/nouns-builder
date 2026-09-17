import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { SWRConfig } from 'swr'

import { useUserDaos } from './useUserDaos'

const address = '0xdcf37d8aa17142f053aaa7dc56025ab00d897a19'

describe('useUserDaos', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('revalidates through the current origin instead of a configured external host', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      statusText: 'OK',
      text: async () => '[]',
    })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = ({ children }: React.PropsWithChildren) =>
      React.createElement(
        SWRConfig,
        { value: { provider: () => new Map(), dedupingInterval: 0 } },
        children
      )
    const { result } = renderHook(() => useUserDaos({ address }), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/daos/${address}`,
      expect.objectContaining({ headers: { Accept: 'application/json' } })
    )
  })
})
