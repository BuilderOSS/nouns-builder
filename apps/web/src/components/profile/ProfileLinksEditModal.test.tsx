import { PROFILE_LINK_SCHEMA_UID } from '@buildeross/constants'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { ProfileLinksEditModal } from './ProfileLinksEditModal'

const {
  readContractMock,
  simulateContractMock,
  waitForTransactionReceiptMock,
  writeContractMock,
} = vi.hoisted(() => ({
  readContractMock: vi.fn(),
  simulateContractMock: vi.fn(),
  waitForTransactionReceiptMock: vi.fn(),
  writeContractMock: vi.fn(),
}))

vi.mock('wagmi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('wagmi')>()),
  useAccount: () => ({ chainId: 8453 }),
  useConfig: () => ({}),
  useSwitchChain: () => ({ switchChainAsync: vi.fn() }),
}))

vi.mock('wagmi/actions', () => ({
  readContract: readContractMock,
  simulateContract: simulateContractMock,
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
    writeContractMock.mockResolvedValue(`0x${'1'.repeat(64)}`)
    simulateContractMock.mockImplementation((_config, request) => ({ request }))
    waitForTransactionReceiptMock.mockResolvedValue({ status: 'success' })
  })

  it('uses the pre-registered schema and batches changed links into one multi-attest', async () => {
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

    expect(readContractMock).not.toHaveBeenCalled()
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
