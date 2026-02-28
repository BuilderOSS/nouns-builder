import { Box, Flex } from '@buildeross/zord'
import { FormikProps } from 'formik'
import React, { ChangeEventHandler, ReactElement } from 'react'

import {
  defaultHelperTextStyle,
  defaultInputErrorMessageStyle,
  defaultInputLabelStyle,
  defaultTextAreaErrorStyle,
  defaultTextAreaStyle,
} from './styles.css'

interface TextAreaProps {
  id: string
  value: string
  inputLabel?: string | ReactElement
  onChange: ChangeEventHandler
  onBlur?: ChangeEventHandler
  formik?: FormikProps<any>
  errorMessage?: any
  helperText?: string
  autoSubmit?: boolean
  placeholder?: string
  minHeight?: number
  rows?: number
  disabled?: boolean
  maxLength?: number
}

const TextArea: React.FC<TextAreaProps> = ({
  id,
  value,
  inputLabel,
  onChange,
  onBlur,
  errorMessage,
  helperText,
  autoSubmit,
  formik,
  placeholder,
  minHeight,
  disabled,
  rows = 2,
  maxLength,
}) => {
  const handleBlur = (e: any) => {
    onBlur?.(e)
    if (autoSubmit && formik) {
      formik.submitForm()
    }
  }

  return (
    <Flex direction={'column'} pb={'x5'}>
      {errorMessage && (
        <Box
          position={'absolute'}
          right={'x2'}
          top={'x8'}
          fontSize={12}
          className={defaultInputErrorMessageStyle}
        >
          {errorMessage}
        </Box>
      )}
      {inputLabel && <label className={defaultInputLabelStyle}>{inputLabel}</label>}
      <textarea
        id={id}
        onChange={onChange}
        onBlur={handleBlur}
        value={value}
        className={!!errorMessage ? defaultTextAreaErrorStyle : defaultTextAreaStyle}
        placeholder={placeholder}
        style={{ minHeight: minHeight || 'none' }}
        rows={rows}
        disabled={disabled}
        maxLength={maxLength}
      />
      {!!helperText && helperText?.length > 0 ? (
        <Box className={defaultHelperTextStyle}>{helperText}</Box>
      ) : null}
    </Flex>
  )
}

export default TextArea
