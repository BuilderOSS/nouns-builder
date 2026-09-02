import { act, render, screen } from '@testing-library/react'
import { Form, Formik } from 'formik'
import React from 'react'
import { describe, expect, it } from 'vitest'
import * as yup from 'yup'

import { SingleMediaUpload } from './SingleMediaUpload'

const schema = yup.object({ mediaUrl: yup.string().required('*') })

const nestedSchema = yup.object({
  milestones: yup.array().of(
    yup.object({
      mediaUrl: yup.string().required('*'),
    })
  ),
})

const Harness: React.FC = () => (
  <Formik
    initialValues={{ mediaUrl: '' }}
    validationSchema={schema}
    onSubmit={() => undefined}
  >
    {(formik) => (
      <Form>
        <SingleMediaUpload
          formik={formik}
          id="mediaUrl"
          inputLabel="Media"
          value={formik.values.mediaUrl}
          helperText="Upload a file"
        />
        <button type="submit">Add Transaction to Queue</button>
      </Form>
    )}
  </Formik>
)

const NestedHarness: React.FC = () => (
  <Formik
    initialValues={{ milestones: [{ mediaUrl: '' }] }}
    validationSchema={nestedSchema}
    onSubmit={() => undefined}
  >
    {(formik) => (
      <Form>
        <SingleMediaUpload
          formik={formik}
          id="milestones.0.mediaUrl"
          inputLabel="Milestone media"
          value={formik.values.milestones[0].mediaUrl}
          helperText="Upload a file"
        />
        <button type="submit">Add Transaction to Queue</button>
      </Form>
    )}
  </Formik>
)

describe('SingleMediaUpload', () => {
  it('says nothing before the form is submitted', () => {
    render(<Harness />)
    expect(screen.queryByTestId('error-msg')).toBeNull()
    expect(screen.getByText('Upload a file')).toBeTruthy()
  })

  it('explains the missing file once submit is attempted', async () => {
    render(<Harness />)
    await act(async () => {
      screen.getByRole('button', { name: 'Add Transaction to Queue' }).click()
    })

    const error = await screen.findByTestId('error-msg')
    // The schema's bare '*' would be meaningless on its own here.
    expect(error.textContent).toContain('Media is required')
    expect(screen.queryByText('Upload a file')).toBeNull()
  })

  it('shows nested field errors from formik paths', async () => {
    render(<NestedHarness />)
    await act(async () => {
      screen.getByRole('button', { name: 'Add Transaction to Queue' }).click()
    })

    const error = await screen.findByTestId('error-msg')
    expect(error.textContent).toContain('Milestone media is required')
    expect(screen.queryByText('Upload a file')).toBeNull()
  })
})
