import { Box } from '@buildeross/zord'
import { InputHTMLAttributes, WheelEvent } from 'react'

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
  useTextInput?: boolean // Use text input with inputMode for better decimal support
}

const NumberInput = ({
  label,
  // className,
  errorMessage,
  hasError,
  value,
  disableWheelEvent = true,
  useTextInput = false,
  ...rest
}: NumberInputProps) => {
  // For text-based numeric input, ensure value is always a string
  const displayValue = useTextInput
    ? value === null || value === undefined
      ? ''
      : String(value)
    : Number.isNaN(value)
      ? ''
      : value

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
        type={useTextInput ? 'text' : 'number'}
        inputMode={useTextInput ? 'decimal' : undefined}
        value={displayValue}
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

export default NumberInput
