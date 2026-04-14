import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DaoDescription } from './DaoDescription'

describe('DaoDescription', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not show read more for short content', () => {
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(200)

    render(<DaoDescription description="Short description" />)

    expect(screen.queryByRole('button', { name: 'Read More' })).not.toBeInTheDocument()
  })

  it('shows read more for long content and toggles expanded state', () => {
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(500)

    render(<DaoDescription description="Long description" />)

    const toggleButton = screen.getByRole('button', { name: 'Read More' })
    const container = document.querySelector('div[style*="max-height"]') as HTMLDivElement

    expect(container.style.maxHeight).toBe('300px')
    expect(container.style.overflow).toBe('hidden')

    fireEvent.click(toggleButton)

    expect(screen.getByRole('button', { name: 'Collapse' })).toBeInTheDocument()
    expect(container.style.maxHeight).toBe('none')
    expect(container.style.overflow).toBe('visible')
  })
})
