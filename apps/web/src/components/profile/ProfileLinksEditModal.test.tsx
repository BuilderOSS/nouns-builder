import { PROFILE_LINK_SCHEMA_UID } from '@buildeross/constants'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { act } from 'react'

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
  useConfig: () => ({ state: { current: null, connections: new Map() } }),
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
    simulateContractMock.mockImplementation((_config, request) => ({ request }))
    writeContractMock.mockResolvedValue(`0x${'1'.repeat(64)}`)
    waitForTransactionReceiptMock.mockResolvedValue({
      status: 'success',
      blockNumber: 12345n,
    })
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

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Website'), { target: { value: '' } })
      fireEvent.change(screen.getByLabelText('X'), {
        target: { value: '@new_handle' },
      })
    })

    fireEvent.click(screen.getByRole('button', { name: 'Save links' }))

    await waitFor(() => expect(simulateContractMock).toHaveBeenCalledTimes(1))

    expect(readContractMock).not.toHaveBeenCalled()
    expect(simulateContractMock).toHaveBeenCalledWith(
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
    expect(writeContractMock).toHaveBeenCalledTimes(1)
  })

  it('validates form inputs and shows errors', async () => {
    render(
      <ProfileLinksEditModal
        identity={{}}
        profileAddress="0x00000000000000000000000000000000000000aa"
        open
        onClose={vi.fn()}
      />
    )

    // Enter invalid website URL
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Website'), {
        target: { value: 'not-a-url' },
      })
      fireEvent.blur(screen.getByLabelText('Website'))
    })

    // Check that error message appears
    await waitFor(() => {
      expect(screen.getByText('Enter a valid website URL.')).toBeInTheDocument()
    })

    // Save button should be disabled when form is invalid
    expect(screen.getByRole('button', { name: 'Save links' })).toBeDisabled()
  })

  it('disables save button when no changes are made', () => {
    render(
      <ProfileLinksEditModal
        identity={{
          website: { href: 'https://example.com/', label: 'example.com' },
        }}
        profileAddress="0x00000000000000000000000000000000000000aa"
        open
        onClose={vi.fn()}
      />
    )

    // Save button should be disabled (no changes)
    expect(screen.getByRole('button', { name: 'Save links' })).toBeDisabled()
  })
})
