import { CHAIN_ID } from '@buildeross/types'
import { act, render, screen } from '@testing-library/react'
import dayjs from 'dayjs'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { DaoCard } from './DaoCard'

describe('Dao card', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render a given dao with an ended auction', () => {
    render(
      <DaoCard
        chainId={CHAIN_ID.FOUNDRY}
        tokenName="Token name"
        tokenImage="https://fakeimg.pl/300/"
        collectionName="Collection name"
        bid={2}
        endTime={dayjs('1/1/21').unix()}
      />
    )

    expect(screen.queryByText(/Winning bid/)).toBeInTheDocument()
    expect(screen.queryByText(/2.00 ETH/)).toBeInTheDocument()
    expect(screen.queryByText(/Token name/)).toBeInTheDocument()
    expect(screen.queryByText(/Collection name/)).toBeInTheDocument()
  })

  it('should render a dao given undefined values', () => {
    render(
      <DaoCard
        chainId={CHAIN_ID.FOUNDRY}
        tokenName={undefined}
        tokenImage={undefined}
        collectionName={undefined}
        bid={undefined}
        endTime={undefined}
      />
    )

    expect(screen.queryByText(/Winning bid/)).toBeInTheDocument()
    expect(screen.queryByText('n/a')).toBeInTheDocument()
    expect(screen.queryByTestId('token-name')).not.toBeInTheDocument()
    expect(screen.queryByTestId('collection-name')).not.toBeInTheDocument()
  })

  it('should render a given dao with an active auction', () => {
    render(
      <DaoCard
        chainId={CHAIN_ID.FOUNDRY}
        tokenName="Token name"
        tokenImage="https://fakeimg.pl/300/"
        collectionName="Collection name"
        bid={2}
        endTime={dayjs().add(30, 'seconds').unix()}
      />
    )

    expect(screen.queryByText(/Highest bid/)).toBeInTheDocument()
    expect(screen.queryByText(/2.00 ETH/)).toBeInTheDocument()
    expect(screen.queryByText(/Ends in/)).toBeInTheDocument()
    expect(screen.queryByText(/0h 0m 29s/)).toBeInTheDocument()
    expect(screen.queryByText(/Token name/)).toBeInTheDocument()
    expect(screen.queryByText(/Collection name/)).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.queryByText(/Ends in/)).toBeInTheDocument()
    expect(screen.queryByText(/0h 0m 24/)).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(35000)
    })

    expect(screen.queryByText(/Winning bid/)).toBeInTheDocument()
    expect(screen.queryByText(/2.00 ETH/)).toBeInTheDocument()
    expect(screen.queryByText(/Ends in/)).not.toBeInTheDocument()
  })
})
