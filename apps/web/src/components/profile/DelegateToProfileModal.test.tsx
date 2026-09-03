import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { DelegateToProfileModal } from './DelegateToProfileModal'

const { daoMembershipRequest } = vi.hoisted(() => ({
  daoMembershipRequest: vi.fn(),
}))

vi.mock('@buildeross/hooks/useUserDaos', () => ({
  useUserDaos: () => ({
    daos: [
      {
        chainId: 1,
        collectionAddress: '0xDaa0000000000000000000000000000000000000',
        governorAddress: '0xGov0000000000000000000000000000000000000',
        contractImage: '',
        name: 'Available DAO',
      },
      {
        chainId: 8453,
        collectionAddress: '0xBad0000000000000000000000000000000000000',
        governorAddress: '0xGov0000000000000000000000000000000000001',
        contractImage: '',
        name: 'Unavailable DAO',
      },
    ],
    isLoading: false,
  }),
}))

vi.mock('@buildeross/sdk/subgraph', () => ({ daoMembershipRequest }))
vi.mock('@buildeross/ui/FallbackImage', () => ({ FallbackImage: () => <span /> }))
vi.mock('@buildeross/ui/Modal', () => ({
  AnimatedModal: ({ children, open }: React.PropsWithChildren<{ open: boolean }>) =>
    open ? <div>{children}</div> : null,
}))
vi.mock('@buildeross/ui/ContractButton', () => ({
  ContractButton: ({ children }: React.PropsWithChildren) => <button>{children}</button>,
}))
vi.mock('wagmi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('wagmi')>()),
  useAccount: () => ({ address: '0xUser000000000000000000000000000000000000' }),
  useConfig: () => ({}),
}))
vi.mock('wagmi/actions', () => ({
  simulateContract: vi.fn(),
  waitForTransactionReceipt: vi.fn(),
  writeContract: vi.fn(),
}))

describe('DelegateToProfileModal', () => {
  it('keeps fulfilled memberships when another DAO request fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    daoMembershipRequest
      .mockResolvedValueOnce({
        tokenCount: 1,
        voteCount: 2,
        delegate: '0xDelegate0000000000000000000000000000000000',
      })
      .mockRejectedValueOnce(new Error('Membership unavailable'))

    render(
      <DelegateToProfileModal
        open
        onClose={vi.fn()}
        profileAddress="0xProfile0000000000000000000000000000000000"
        profileName="Profile"
      />
    )

    const trigger = await screen.findByRole('button', { name: /Available DAO/ })
    expect(screen.queryByText('No delegatable DAO tokens were found')).toBeNull()
    expect(warn).toHaveBeenCalledWith('Failed to load DAO membership:', expect.any(Error))

    fireEvent.click(trigger)
    expect(screen.getAllByText('Available DAO')).toHaveLength(2)

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
    expect(trigger).toHaveFocus()

    warn.mockRestore()
  })
})
