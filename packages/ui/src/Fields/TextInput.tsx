import { Box } from '@buildeross/zord'
import { FormikProps } from 'formik'
import React, { ChangeEventHandler, ReactElement } from 'react'

import { FieldError } from './FieldError'
import {
  defaultFieldsetStyle,
  defaultInputLabelStyle,
  inputStyleVariants,
} from './styles.css'

interface TextInputProps {
  id: string
  value: string | number
  type: string
  inputLabel?: string | ReactElement
  onChange: ChangeEventHandler
  formik?: FormikProps<any>
  errorMessage?: any
  placeholder?: string
  disabled?: boolean
}

const TextInput: React.FC<TextInputProps> = ({
  id,
  value,
  inputLabel,
  onChange,
  errorMessage,
  placeholder,
  disabled = false,
}) => {
  return (
    <Box as="fieldset" mb={'x8'} p={'x0'} className={defaultFieldsetStyle}>
      {inputLabel && <label className={defaultInputLabelStyle}>{inputLabel}</label>}

      <input
        id={id}
        type="text"
        onChange={onChange}
        value={value}
        className={`${inputStyleVariants[!!errorMessage ? 'error' : 'default']}`}
        placeholder={placeholder || ''}
        disabled={disabled}
      />
      {!!errorMessage && <FieldError message={errorMessage} />}
    </Box>
  )
}

export default TextInput
