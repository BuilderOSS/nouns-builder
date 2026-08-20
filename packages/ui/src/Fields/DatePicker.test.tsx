import { render } from '@testing-library/react'
import { FormikProps } from 'formik'
import React from 'react'
import { describe, expect, it } from 'vitest'

import DatePicker from './DatePicker'

/* DatePicker only reads setFieldValue/setFieldTouched/submitForm off formik. */
const formikStub = {
  setFieldValue: () => {},
  setFieldTouched: () => {},
  submitForm: () => {},
} as unknown as FormikProps<any>

const renderPicker = (props: Partial<React.ComponentProps<typeof DatePicker>> = {}) =>
  render(
    <DatePicker
      inputLabel={'Start time'}
      formik={formikStub}
      id={'publicSaleStart'}
      errorMessage={undefined}
      value={''}
      placeholder={'yyyy-mm-dd'}
      enableTime
      dateFormat="Z"
      altFormat="Y-m-d H:i"
      {...props}
    />
  )

const visibleInputs = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('input')).filter(
    (input) => input.style.display !== 'none' && input.type !== 'hidden'
  )

describe('DatePicker', () => {
  it('shows only the formatted input when an altFormat is set', () => {
    const { container } = renderPicker()

    // flatpickr renders its alt input alongside the one we own.
    expect(container.querySelectorAll('input')).toHaveLength(2)
    expect(visibleInputs(container)).toHaveLength(1)
  })

  it('keeps the raw input hidden across re-renders, and moves the error styling onto it', () => {
    const { container, rerender } = renderPicker()

    const [before] = visibleInputs(container)
    const classBefore = before.className

    // flatpickr hides the raw input by setting type="hidden", but React
    // re-applies `type` on every update to an <input> — which used to make the
    // raw input reappear next to the formatted one.
    rerender(
      <DatePicker
        inputLabel={'Start time'}
        formik={formikStub}
        id={'publicSaleStart'}
        errorMessage={'Must be in future'}
        value={''}
        placeholder={'yyyy-mm-dd'}
        enableTime
        dateFormat="Z"
        altFormat="Y-m-d H:i"
      />
    )

    const visible = visibleInputs(container)
    expect(visible).toHaveLength(1)

    // flatpickr snapshots className onto the alt input at init, so the error
    // style has to be pushed onto the element the user actually sees.
    expect(visible[0]).toBe(before)
    expect(visible[0].className).not.toBe(classBefore)
  })

  it('renders a single input when no altFormat is set', () => {
    const { container } = renderPicker({ altFormat: undefined })

    expect(container.querySelectorAll('input')).toHaveLength(1)
    expect(visibleInputs(container)).toHaveLength(1)
  })
})
