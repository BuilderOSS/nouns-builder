import { Box } from '@zoralabs/zord'
import React, { InputHTMLAttributes, WheelEvent } from 'react'

import {
  defaultFieldsetStyle,
  errorMessageStyle,
  numberInputErrorStyle,
  numberInputStyle,
  placeholderStyle,
} from './styles.css'

interface NumberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  className?: string
  errorMessage?: string
  hasError?: boolean
  disableWheelEvent?: boolean
}

const NumberInput = ({
  label,
  // className,
  errorMessage,
  hasError,
  value,
  disableWheelEvent = true,
  ...rest
}: NumberInputProps) => {
  return (
    <Box as="fieldset" className={defaultFieldsetStyle}>
      {errorMessage && (
        <Box
          position={'absolute'}
          right={'x2'}
          bottom={'x6'}
          className={errorMessageStyle}
        >
          {errorMessage}
        </Box>
      )}
      <input
        {...rest}
        type="number"
        value={Number.isNaN(value) ? '' : value}
        className={hasError ? numberInputErrorStyle : numberInputStyle}
        onWheel={
          disableWheelEvent
            ? (e: WheelEvent<HTMLInputElement>) => e.currentTarget.blur()
            : undefined
        }
      />

      {label && (
        <Box position={'absolute'} className={placeholderStyle}>
          {label}
        </Box>
      )}
    </Box>
  )
}

export { NumberInput }
