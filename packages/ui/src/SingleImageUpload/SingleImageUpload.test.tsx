import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from 'formik'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import SingleImageUpload from './SingleImageUpload'

const mockUploadFn = vi.fn()

vi.mock('@buildeross/ipfs-service', async () => {
  const mod = await vi.importActual<typeof import('@buildeross/ipfs-service')>(
    '@buildeross/ipfs-service'
  )
  return {
    ...mod,
    uploadFile: () => mockUploadFn(),
  }
})

describe('Single image upload', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should upload a file successfully', async () => {
    const user = userEvent.setup()
    mockUploadFn.mockResolvedValueOnce({ cid: '1234' })

    const file = new File(['hello'], 'hello.png', { type: 'image/png' })

    const ImageUpload = () => {
      return (
        <Formik initialValues={{ daoAvatar: undefined }} onSubmit={vi.fn()}>
          {(formik) => (
            <SingleImageUpload
              {...formik.getFieldProps('daoAvatar')}
              formik={formik}
              id="daoAvatar"
              inputLabel={'Dao avatar'}
              helperText={'Upload'}
            />
          )}
        </Formik>
      )
    }

    render(<ImageUpload />)

    expect(screen.queryByText(/Dao avatar/)).toBeInTheDocument()
    expect(screen.queryByText(/Upload/)).toBeInTheDocument()

    const input = screen.getByTestId('file-upload') as HTMLInputElement
    await user.upload(input, file)

    await waitFor(() => {
      expect(input.files).toHaveLength(1)
    })

    expect(mockUploadFn).toHaveBeenCalled()
    expect(screen.queryByTestId('error-msg')).not.toBeInTheDocument()
  })

  it('should render an error message given a rejected file upload', async () => {
    const user = userEvent.setup()
    mockUploadFn.mockRejectedValueOnce(new Error('Error'))

    const file = new File(['hello'], 'hello.png', { type: 'image/png' })

    const ImageUpload = () => {
      return (
        <Formik initialValues={{ daoAvatar: undefined }} onSubmit={vi.fn()}>
          {(formik) => (
            <SingleImageUpload
              {...formik.getFieldProps('daoAvatar')}
              formik={formik}
              id="daoAvatar"
              inputLabel={'Dao avatar'}
              helperText={'Upload'}
            />
          )}
        </Formik>
      )
    }

    render(<ImageUpload />)

    expect(screen.queryByText(/Dao avatar/)).toBeInTheDocument()
    expect(screen.queryByText(/Upload/)).toBeInTheDocument()

    const input = screen.getByTestId('file-upload') as HTMLInputElement
    await user.upload(input, file)

    await waitFor(() => {
      expect(input.files).toHaveLength(1)
    })

    expect(mockUploadFn).toHaveBeenCalled()
    expect(await screen.findByTestId('error-msg')).toBeInTheDocument()
  })

  it('should reject an unsupported file type', async () => {
    const user = userEvent.setup({ applyAccept: false })
    const mockSubmitFn = vi.fn()
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })

    const ImageUpload = () => {
      return (
        <Formik initialValues={{ daoAvatar: undefined }} onSubmit={mockSubmitFn}>
          {(formik) => (
            <SingleImageUpload
              {...formik.getFieldProps('daoAvatar')}
              formik={formik}
              id="daoAvatar"
              inputLabel={'Dao avatar'}
              helperText={'Upload'}
            />
          )}
        </Formik>
      )
    }

    render(<ImageUpload />)

    expect(screen.queryByText(/Dao avatar/)).toBeInTheDocument()
    expect(screen.queryByText(/Upload/)).toBeInTheDocument()

    const input = screen.getByTestId('file-upload') as HTMLInputElement
    await user.upload(input, file)

    await waitFor(() => {
      expect(input.files).toHaveLength(1)
    })

    expect(
      screen.queryByText('Sorry, text/plain is an unsupported file type')
    ).toBeInTheDocument()
    expect(mockUploadFn).not.toHaveBeenCalled()
  })
})
