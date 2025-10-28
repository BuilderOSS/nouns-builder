import { Box } from '@buildeross/zord'
import { FormikProps } from 'formik'
import React, { ChangeEventHandler, KeyboardEventHandler, ReactElement } from 'react'

import FieldError from './FieldError'
import {
  defaultFieldsetStyle,
  defaultInputLabelStyle,
  inputStyleVariants,
} from './styles.css'

type BoxProps = React.ComponentProps<typeof Box>
type MarginBottom = BoxProps['mb']

interface TextInputProps {
  id: string
  value: string | number
  inputLabel?: string | ReactElement
  onChange: ChangeEventHandler<HTMLInputElement>
  onKeyPress?: KeyboardEventHandler<HTMLInputElement>
  formik?: FormikProps<any>
  errorMessage?: any
  placeholder?: string
  disabled?: boolean
  style?: React.CSSProperties
  mb?: MarginBottom
}

const TextInput: React.FC<TextInputProps> = ({
  id,
  value,
  inputLabel,
  onChange,
  onKeyPress,
  errorMessage,
  placeholder,
  disabled = false,
  style,
  mb = 'x8',
}) => {
  return (
    <Box as="fieldset" mb={mb} p={'x0'} className={defaultFieldsetStyle}>
      {inputLabel && <label className={defaultInputLabelStyle}>{inputLabel}</label>}

      <input
        id={id}
        type="text"
        onChange={onChange}
        onKeyPress={onKeyPress}
        value={value}
        className={`${inputStyleVariants[!!errorMessage ? 'error' : 'default']}`}
        placeholder={placeholder || ''}
        disabled={disabled}
        style={style}
      />
      {!!errorMessage && <FieldError message={errorMessage} />}
    </Box>
  )
}

export default TextInput
