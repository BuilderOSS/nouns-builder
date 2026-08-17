import { PROFILE_LINK_SCHEMA_UID } from '@buildeross/constants'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { ProfileLinksEditModal } from './ProfileLinksEditModal'

const { readContractMock, waitForTransactionReceiptMock, writeContractMock } = vi.hoisted(
  () => ({
    readContractMock: vi.fn(),
    waitForTransactionReceiptMock: vi.fn(),
    writeContractMock: vi.fn(),
  })
)

vi.mock('wagmi', () => ({
  useAccount: () => ({ chainId: 8453 }),
  useConfig: () => ({}),
  useSwitchChain: () => ({ switchChainAsync: vi.fn() }),
}))

vi.mock('wagmi/actions', () => ({
  readContract: readContractMock,
  waitForTransactionReceipt: waitForTransactionReceiptMock,
  writeContract: writeContractMock,
}))

vi.mock('@buildeross/ui/Modal', () => ({
  AnimatedModal: ({ children, open }: React.PropsWithChildren<{ open: boolean }>) =>
    open ? <div>{children}</div> : null,
}))

describe('ProfileLinksEditModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    readContractMock.mockResolvedValue({ uid: PROFILE_LINK_SCHEMA_UID })
    writeContractMock.mockResolvedValue(`0x${'1'.repeat(64)}`)
    waitForTransactionReceiptMock.mockResolvedValue({ status: 'success' })
  })

  it('checks the schema onchain and batches changed links into one multi-attest', async () => {
    render(
      <ProfileLinksEditModal
        identity={{
          website: { href: 'https://old.example/', label: 'old.example' },
          x: {
            handle: 'old_handle',
            label: '@old_handle',
            url: 'https://x.com/old_handle',
          },
        }}
        profileAddress="0x00000000000000000000000000000000000000aa"
        open
        onClose={vi.fn()}
      />
    )

    fireEvent.change(screen.getByLabelText('Website'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('X'), {
      target: { value: '@new_handle' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save links' }))

    await waitFor(() => expect(writeContractMock).toHaveBeenCalledTimes(1))

    expect(readContractMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        functionName: 'getSchema',
        args: [PROFILE_LINK_SCHEMA_UID],
      })
    )
    expect(writeContractMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        functionName: 'multiAttest',
        args: [
          [
            expect.objectContaining({
              schema: PROFILE_LINK_SCHEMA_UID,
              data: [
                expect.objectContaining({ recipient: expect.any(String) }),
                expect.objectContaining({ recipient: expect.any(String) }),
              ],
            }),
          ],
        ],
      })
    )
  })
})
