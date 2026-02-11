import { Box } from '@buildeross/zord'
import flatpickr from 'flatpickr'
import { FormikErrors, FormikProps } from 'formik'
import React, { ReactElement } from 'react'

import {
  defaultFieldsetStyle,
  defaultHelperTextStyle,
  defaultInputErrorMessageStyle,
  defaultInputErrorStyle,
  defaultInputLabelStyle,
  defaultInputStyle,
} from './styles.css'

export interface DatePickerProps {
  inputLabel: string | ReactElement
  formik: FormikProps<any>
  id: string
  errorMessage: string | FormikErrors<any> | string[] | undefined | FormikErrors<any>[]
  helperText?: string
  value: any
  altFormat?: string
  dateFormat?: string
  placeholder?: string
  autoSubmit?: boolean
  enableTime?: boolean
  parentValues?: any
  disabled?: boolean
}

const DatePicker: React.FC<DatePickerProps> = ({
  inputLabel,
  formik,
  id,
  errorMessage,
  helperText,
  autoSubmit,
  value,
  placeholder,
  altFormat,
  enableTime = false,
  dateFormat = 'Y-m-d',
  disabled = false,
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const fpRef = React.useRef<flatpickr.Instance | null>(null)

  // Keep latest formik without forcing flatpickr re-init
  const formikRef = React.useRef<FormikProps<any>>(formik)
  React.useEffect(() => {
    formikRef.current = formik
  }, [formik])

  // Timer for autoSubmit to avoid submitting after unmount
  const submitTimerRef = React.useRef<number | null>(null)
  React.useEffect(() => {
    return () => {
      if (submitTimerRef.current != null) {
        window.clearTimeout(submitTimerRef.current)
        submitTimerRef.current = null
      }
    }
  }, [])

  // Init flatpickr once (or when config truly changes)
  React.useEffect(() => {
    if (!inputRef.current) return

    fpRef.current = flatpickr(inputRef.current, {
      enableTime,
      dateFormat,
      altInput: !!altFormat,
      altFormat,
      allowInput: false,
      disableMobile: true,
      clickOpens: !disabled,

      onChange: (_selectedDates, dateStr) => {
        formikRef.current.setFieldValue(id, dateStr)
        window.setTimeout(() => {
          formikRef.current.setFieldTouched(id, true, true)
        }, 100)

        if (autoSubmit) {
          // clear any pending submit
          if (submitTimerRef.current != null) {
            window.clearTimeout(submitTimerRef.current)
          }
          submitTimerRef.current = window.setTimeout(() => {
            formikRef.current.submitForm()
          }, 100)
        }
      },
    })

    return () => {
      fpRef.current?.destroy()
      fpRef.current = null
    }
  }, [autoSubmit, id, altFormat, dateFormat, enableTime, disabled])

  // Sync external value -> flatpickr without firing change callbacks
  React.useEffect(() => {
    const fp = fpRef.current
    if (!fp) return

    if (value) fp.setDate(value, false)
    else fp.clear(false) // IMPORTANT: suppress onChange
  }, [value])

  return (
    <Box as="fieldset" mb={'x8'} p={'x0'} className={defaultFieldsetStyle}>
      {inputLabel && <label className={defaultInputLabelStyle}>{inputLabel}</label>}
      <Box position="relative">
        <input
          className={!!errorMessage ? defaultInputErrorStyle : defaultInputStyle}
          ref={inputRef}
          type="text"
          data-input
          placeholder={placeholder}
          disabled={disabled}
        />
        {errorMessage && (
          <Box
            right={'x2'}
            top={'x1'}
            position={'absolute'}
            fontSize={12}
            className={defaultInputErrorMessageStyle}
          >
            {errorMessage as string}
          </Box>
        )}
      </Box>
      {helperText && (
        <Box
          right={'x2'}
          top={'x15'}
          pt={'x4'}
          fontSize={14}
          className={defaultHelperTextStyle}
        >
          {helperText}
        </Box>
      )}
    </Box>
  )
}

export default DatePicker
