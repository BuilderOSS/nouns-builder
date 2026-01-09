import { useEnsData } from '@buildeross/hooks/useEnsData'
import { isEmpty } from '@buildeross/utils/helpers'
import { Box, Flex, Icon, Spinner } from '@buildeross/zord'
import { FormikProps } from 'formik'
import { motion } from 'framer-motion'
import React, { ChangeEventHandler, WheelEvent } from 'react'

import { Avatar } from '../Avatar'
import { Tooltip } from '../Tooltip'
import {
  defaultFieldsetStyle,
  defaultHelperTextStyle,
  defaultInputErrorMessageStyle,
  defaultInputLabelStyle,
  inputCheckIcon,
  inputStyleVariants,
  permaInputPlaceHolderStyle,
} from './styles.css'
import { FIELD_TYPES } from './types'

interface SmartInputProps {
  id: string
  value?: string | number
  type: typeof FIELD_TYPES.TEXT | typeof FIELD_TYPES.NUMBER | typeof FIELD_TYPES.TEXTAREA
  inputLabel?: string
  secondaryLabel?: string
  onChange: ChangeEventHandler
  onBlur?: ChangeEventHandler
  formik?: FormikProps<any>
  errorMessage?: any
  helperText?: string
  autoSubmit?: boolean
  max?: number
  min?: number
  perma?: string
  placeholder?: string
  step?: number
  submitCallback?: (values: any) => void
  disabled?: boolean
  disableWheelEvent?: boolean
  isAddress?: boolean
  tooltip?: string
}

const helperVariants = {
  init: {
    height: 0,
    overflow: 'hidden',
  },
  open: {
    height: 'auto',
  },
}

const SmartInput: React.FC<SmartInputProps> = ({
  id,
  value = '',
  type,
  inputLabel,
  secondaryLabel,
  onChange,
  onBlur,
  autoSubmit,
  formik,
  errorMessage,
  helperText,
  min,
  max,
  perma,
  placeholder,
  step = 0.0001,
  submitCallback,
  disabled = false,
  disableWheelEvent = type === 'number',
  isAddress,
  tooltip,
}) => {
  const addrOrName: string | undefined =
    isAddress && typeof value === 'string' && value.length > 0 ? value : undefined
  const { ensName, ensAvatar, ethAddress, isLoading } = useEnsData(addrOrName)

  /*
    toggle between address and ENS name display
  */
  const [showAddress, setShowAddress] = React.useState<boolean>(false)
  const shouldShowToggle = isAddress && ensName && ethAddress

  /*
    track previous value to detect external changes
  */
  const prevValueRef = React.useRef(value)
  React.useEffect(() => {
    // Only reset toggle if value actually changed from external source
    if (prevValueRef.current !== value) {
      setShowAddress(false)
      prevValueRef.current = value
    }
  }, [value])

  /*
    add autocomplete to refs (autocomplete not supported ref in types)
  */
  const input = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    if (input.current !== null) {
      input.current.setAttribute('autocomplete', 'off')
    }
  }, [input])

  /*
    handlers: blur, focus
  */
  const [isFocus, setIsFocus] = React.useState<boolean>(false)
  const handleBlur: ChangeEventHandler = (e) => {
    setIsFocus(false)
    if (autoSubmit && formik) {
      formik.submitForm()

      if (submitCallback && isEmpty(formik.errors)) {
        submitCallback(formik.values)
      }
    }
    onBlur?.(e)
  }

  const handleFocus = () => {
    setIsFocus(true)
  }

  return (
    <Box as="fieldset" mb={'x8'} p={'x0'} className={defaultFieldsetStyle}>
      {inputLabel && (
        <Flex align={'center'} justify="space-between" className={defaultInputLabelStyle}>
          <Flex align={'center'} gap={'x2'} justify="flex-start">
            <label>{inputLabel}</label>
            {tooltip && <Tooltip>{tooltip}</Tooltip>}
          </Flex>
          {secondaryLabel && (
            <Box color={'text3'} fontWeight="paragraph">
              {secondaryLabel}
            </Box>
          )}
        </Flex>
      )}
      <Box position="relative">
        <input
          id={id}
          data-testid={id}
          type={type}
          onChange={onChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          value={
            showAddress && ethAddress
              ? ethAddress
              : ensName
                ? ensName
                : typeof value === 'number' && isNaN(value)
                  ? ''
                  : value
          }
          className={inputStyleVariants[!!errorMessage ? 'error' : 'default']}
          style={{
            ...(shouldShowToggle && { paddingLeft: '42px' }),
            ...(isAddress && { paddingRight: '52px' }),
          }}
          min={type === 'number' && typeof min === 'number' ? min : undefined}
          max={type === 'number' && typeof max === 'number' ? max : undefined}
          step={step}
          placeholder={perma || placeholder || ''}
          ref={input}
          disabled={disabled}
          onWheel={
            disableWheelEvent
              ? (e: WheelEvent<HTMLInputElement>) => e.currentTarget.blur()
              : undefined
          }
        />
        {errorMessage && (
          <Box
            position={'absolute'}
            right={'x2'}
            top={'x1'}
            fontSize={12}
            className={defaultInputErrorMessageStyle}
          >
            {errorMessage}
          </Box>
        )}
        {shouldShowToggle && !errorMessage && (
          <Flex
            align={'center'}
            justify={'center'}
            position={'absolute'}
            style={{
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
            }}
            onClick={(e: any) => {
              e.stopPropagation()
              e.preventDefault()
              setShowAddress(!showAddress)
            }}
          >
            <Icon id="swap" style={{ width: 20, height: 20 }} />
          </Flex>
        )}
        {isAddress && !!value.toString().length && !errorMessage && (
          <Flex
            align={'center'}
            justify={'center'}
            position={'absolute'}
            className={inputCheckIcon['default']}
            style={isLoading ? { backgroundColor: 'transparent' } : undefined}
          >
            {isLoading ? (
              <Spinner size="sm" />
            ) : ensAvatar && ethAddress ? (
              <Avatar address={ethAddress} src={ensAvatar} size="32" />
            ) : (
              <Icon fill="background1" id="check" style={{ width: 24, height: 24 }} />
            )}
          </Flex>
        )}
        {(typeof value === 'number' || value) && perma ? (
          <Box position={'absolute'} className={permaInputPlaceHolderStyle}>
            {perma}
          </Box>
        ) : null}
      </Box>
      <motion.div
        variants={helperVariants}
        initial={'init'}
        animate={isFocus ? 'open' : 'init'}
      >
        {!!helperText && helperText?.length > 0 ? (
          <Box className={defaultHelperTextStyle}>{helperText}</Box>
        ) : null}
      </motion.div>
    </Box>
  )
}

export default SmartInput
