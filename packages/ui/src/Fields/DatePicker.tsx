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
  const ref = React.useRef(null)

  React.useEffect(() => {
    if (!ref.current) return

    const fpInstance = flatpickr(ref.current, {
      enableTime,
      dateFormat,
      altInput: !!altFormat,
      altFormat,
      onChange: (_selectedDates, dateStr, _instance) => {
        formik.setFieldValue(id, dateStr)

        if (autoSubmit && formik) {
          setTimeout(() => {
            formik.submitForm()
          }, 100)
        }
      },
    })

    return () => {
      // Clean up flatpickr instance on unmount
      fpInstance.destroy()
    }
  }, [autoSubmit, formik, id, altFormat, dateFormat, enableTime])

  return (
    <Box as="fieldset" mb={'x8'} p={'x0'} className={defaultFieldsetStyle}>
      {inputLabel && <label className={defaultInputLabelStyle}>{inputLabel}</label>}
      <Box position="relative">
        <input
          className={!!errorMessage ? defaultInputErrorStyle : defaultInputStyle}
          ref={ref}
          type={'text'}
          data-input={true}
          value={value || ''}
          placeholder={placeholder}
          readOnly={true}
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
