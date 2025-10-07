import { render, screen, within } from '@testing-library/react'
import { Formik } from 'formik'
import { vi } from 'vitest'

import { TransactionType } from '../../constants/transactionType'
import { Transactions } from './Transactions'

vi.mock('next/router', () => ({
  useRouter: vi.fn(() => ({
    back: vi.fn(),
    push: vi.fn(),
    query: {},
    pathname: '/test',
    asPath: '/test',
  })),
}))

describe('List of transactions', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render a given list of transactions', () => {
    render(
      <Formik initialValues={{ daoAvatar: undefined }} onSubmit={vi.fn()}>
        <Transactions
          transactions={[
            {
              type: TransactionType.UPGRADE,
              transactions: [
                {
                  functionSignature: 'fnc',
                  calldata: '0x0000123',
                  value: '',
                  target: '0x123',
                },
              ],
            },
            {
              type: TransactionType.CUSTOM,
              transactions: [
                {
                  functionSignature: 'fnc',
                  calldata: '0x0000123',
                  value: '',
                  target: '0x123',
                },
              ],
            },
          ]}
          simulations={[]}
        />
      </Formik>
    )

    expect(screen.getByText(/Transactions/)).toBeInTheDocument()
    expect(screen.queryAllByTestId('review-card')).toHaveLength(2)
  })

  it('should render a given list of failed transactions', () => {
    render(
      <Formik initialValues={{ daoAvatar: undefined }} onSubmit={vi.fn()}>
        <Transactions
          transactions={[
            {
              type: TransactionType.UPGRADE,
              transactions: [
                {
                  functionSignature: 'fnc',
                  calldata: '0x0000123',
                  value: '',
                  target: '0x123',
                },
                {
                  functionSignature: 'fnc',
                  calldata: '0x0000123',
                  value: '',
                  target: '0x123',
                },
              ],
            },
          ]}
          simulations={[
            {
              index: 0,
              status: false,
              id: 'id-1',
              url: 'url-1',
              gas_used: 10000,
              from: '0x123',
              to: '0x123',
              value: '0',
              input: '0x123',
              block_number: 1,
            },
          ]}
        />
      </Formik>
    )

    expect(screen.getByText(/Transactions/)).toBeInTheDocument()

    const reviewCards = screen.queryAllByTestId('review-card')
    expect(reviewCards).toHaveLength(1)

    // has one simulation error
    const firstReviewCard = reviewCards[0]
    expect(within(firstReviewCard).queryAllByText(/View details/)).toHaveLength(1)
  })

  it('should render multiple failed simulations across transaction groups', () => {
    render(
      <Formik initialValues={{ daoAvatar: undefined }} onSubmit={vi.fn()}>
        <Transactions
          transactions={[
            {
              type: TransactionType.UPGRADE,
              transactions: [
                {
                  functionSignature: 'fnc',
                  calldata: '0x0000123',
                  value: '',
                  target: '0x123',
                },
                {
                  functionSignature: 'fnc',
                  calldata: '0x0000123',
                  value: '',
                  target: '0x123',
                },
              ],
            },
            {
              type: TransactionType.CUSTOM,
              transactions: [
                {
                  functionSignature: 'fnc',
                  calldata: '0x0000123',
                  value: '',
                  target: '0x123',
                },
              ],
            },
          ]}
          simulations={[
            {
              index: 0,
              status: false,
              id: 'id-0',
              url: 'url-0',
              gas_used: 10000,
              from: '0x123',
              to: '0x123',
              value: '0',
              input: '0x123',
              block_number: 1,
            },
            {
              index: 1,
              status: false,
              id: 'id-1',
              url: 'url-1',
              gas_used: 10000,
              from: '0x123',
              to: '0x123',
              value: '0',
              input: '0x123',
              block_number: 1,
            },
            {
              index: 2,
              status: false,
              id: 'id-2',
              url: 'url-2',
              gas_used: 10000,
              from: '0x123',
              to: '0x123',
              value: '0',
              input: '0x123',
              block_number: 1,
            },
          ]}
        />
      </Formik>
    )

    expect(screen.getByText(/Transactions/)).toBeInTheDocument()
    const reviewCards = screen.queryAllByTestId('review-card')
    expect(reviewCards).toHaveLength(2)

    const firstReviewCard = reviewCards[0]
    expect(within(firstReviewCard).queryAllByText(/View details/)).toHaveLength(1)

    const secondReviewCard = reviewCards[1]
    expect(within(secondReviewCard).queryAllByText(/View details/)).toHaveLength(1)
  })
})
