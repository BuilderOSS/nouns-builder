import { Box, Flex, Grid } from '@buildeross/zord'
import { FormikProps } from 'formik'
import { motion } from 'framer-motion'
import React, { ChangeEventHandler } from 'react'

import { Tooltip } from '../Tooltip'
import NumberInput from './NumberInput'
import {
  defaultHelperTextStyle,
  defaultInputLabelStyle,
  mobileTwoColumnGrid,
} from './styles.css'

interface DaysHoursMinsProps {
  id: string
  value: any
  inputLabel: string
  onChange: ChangeEventHandler
  onBlur?: ChangeEventHandler
  formik?: FormikProps<any>
  errorMessage?: any
  placeholder?: string[]
  helperText?: string
  tooltip?: string
  disabled?: boolean
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

const DaysHoursMinsSecs: React.FC<DaysHoursMinsProps> = ({
  inputLabel,
  formik,
  id,
  errorMessage,
  placeholder,
  value,
  tooltip,
  helperText,
  onBlur,
  disabled = false,
}) => {
  const { days, hours, minutes, seconds } = value
  const handleChange = (e: any, type: string) => {
    if (!formik) return
    const value = e.target.value
    formik.setFieldValue(`${id}.${type}`, parseInt(value))
  }

  const valueHasError = typeof errorMessage === 'string'

  const daysHasError = React.useMemo(() => {
    return errorMessage?.days?.length > 0
  }, [errorMessage])

  const hoursHasError = React.useMemo(() => {
    return errorMessage?.hours?.length > 0
  }, [errorMessage])

  const minutesHasError = React.useMemo(() => {
    return errorMessage?.minutes?.length > 0
  }, [errorMessage])

  const secondsHasError = React.useMemo(() => {
    return errorMessage?.seconds?.length > 0
  }, [errorMessage])

  const [isFocus, setIsFocus] = React.useState<boolean>(false)
  const handleBlur: ChangeEventHandler = (e) => {
    setIsFocus(false)
    onBlur?.(e)
  }

  const handleFocus = () => {
    setIsFocus(true)
  }

  return (
    <Flex direction={'column'} mb={'x8'} style={disabled ? { opacity: 0.5 } : undefined}>
      <Flex
        align={'center'}
        justify={'flex-start'}
        gap={'x2'}
        className={defaultInputLabelStyle}
      >
        <label>{inputLabel}</label>
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </Flex>
      <Grid gap={'x5'} mb={'x3'} className={mobileTwoColumnGrid}>
        <NumberInput
          label={'[Days]'}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder?.[0] || '3'}
          hasError={valueHasError || daysHasError}
          errorMessage={errorMessage?.days}
          onChange={(e) => handleChange(e, 'days')}
          value={days}
          step={1}
          min={0}
          disabled={disabled}
        />

        <NumberInput
          label={'[Hours]'}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder?.[1] || '0'}
          hasError={valueHasError || hoursHasError}
          errorMessage={errorMessage?.hours}
          onChange={(e) => handleChange(e, 'hours')}
          value={hours}
          step={1}
          min={0}
          disabled={disabled}
        />

        <NumberInput
          label={'[Minutes]'}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder?.[2] || '0'}
          errorMessage={errorMessage?.minutes}
          hasError={valueHasError || minutesHasError}
          onChange={(e) => handleChange(e, 'minutes')}
          value={minutes}
          step={1}
          min={0}
          disabled={disabled}
        />

        <NumberInput
          label={'[Seconds]'}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder?.[3] || '0'}
          errorMessage={errorMessage?.seconds}
          hasError={valueHasError || secondsHasError}
          onChange={(e) => handleChange(e, 'seconds')}
          value={seconds}
          step={1}
          min={0}
          disabled={disabled}
        />
      </Grid>
      <motion.div
        variants={helperVariants}
        initial={'init'}
        animate={isFocus ? 'open' : 'init'}
      >
        {!!helperText && helperText?.length > 0 ? (
          <Box className={defaultHelperTextStyle}>{helperText}</Box>
        ) : null}
      </motion.div>

      {valueHasError && <Flex color="negative">{errorMessage}</Flex>}
    </Flex>
  )
}

export default DaysHoursMinsSecs
