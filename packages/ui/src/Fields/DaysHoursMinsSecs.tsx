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
  marginBottom?: string
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

const clampValue = (
  value: number | string | undefined,
  type: 'days' | 'hours' | 'minutes' | 'seconds'
): number => {
  // Handle empty/invalid values
  if (value === '' || value === null || value === undefined) {
    return 0
  }

  const parsed = typeof value === 'string' ? parseInt(value, 10) : value

  // Handle NaN
  if (isNaN(parsed)) {
    return 0
  }

  // Clamp to valid ranges
  const min = 0
  let max: number

  switch (type) {
    case 'hours':
      max = 23
      break
    case 'minutes':
    case 'seconds':
      max = 59
      break
    case 'days':
      max = Number.MAX_SAFE_INTEGER
      break
    default:
      max = Number.MAX_SAFE_INTEGER
  }

  return Math.max(min, Math.min(max, parsed))
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
  marginBottom = 'x8',
}) => {
  const { days, hours, minutes, seconds } = value
  const handleChange = (e: any, type: string) => {
    if (!formik) return
    const value = e.target.value

    // Allow empty string for better UX (user can clear and retype)
    if (value === '' || value === null || value === undefined) {
      formik.setFieldValue(`${id}.${type}`, '')
      return
    }

    // Parse as integer, preventing decimals
    const parsed = parseInt(value, 10)

    // Only set value if it's a valid number
    if (!isNaN(parsed)) {
      formik.setFieldValue(`${id}.${type}`, parsed)
    }
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
    if (formik) {
      const target = e.target as HTMLInputElement
      const inputName = target.name

      // Extract type from field name (e.g., "auctionDuration.days" -> "days")
      const type = inputName.split('.').pop() as 'days' | 'hours' | 'minutes' | 'seconds'

      if (type && ['days', 'hours', 'minutes', 'seconds'].includes(type)) {
        const currentValue = value[type]
        const clampedValue = clampValue(currentValue, type)

        // Only update if value changed (avoid unnecessary re-renders)
        if (currentValue !== clampedValue) {
          formik.setFieldValue(`${id}.${type}`, clampedValue)
        }
      }
    }

    setIsFocus(false)
    onBlur?.(e)
  }

  const handleFocus = (type: 'days' | 'hours' | 'minutes' | 'seconds') => {
    if (!formik) return
    const currentValue = value[type]
    if (currentValue === 0 || currentValue === '0') {
      formik.setFieldValue(`${id}.${type}`, '')
    }
    setIsFocus(true)
  }

  return (
    <Flex
      direction={'column'}
      mb={marginBottom}
      style={disabled ? { opacity: 0.5 } : undefined}
    >
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
          onFocus={() => handleFocus('days')}
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
          onFocus={() => handleFocus('hours')}
          placeholder={placeholder?.[1] || '0'}
          hasError={valueHasError || hoursHasError}
          errorMessage={errorMessage?.hours}
          onChange={(e) => handleChange(e, 'hours')}
          value={hours}
          step={1}
          min={0}
          max={23}
          disabled={disabled}
        />

        <NumberInput
          label={'[Minutes]'}
          onBlur={handleBlur}
          onFocus={() => handleFocus('minutes')}
          placeholder={placeholder?.[2] || '0'}
          errorMessage={errorMessage?.minutes}
          hasError={valueHasError || minutesHasError}
          onChange={(e) => handleChange(e, 'minutes')}
          value={minutes}
          step={1}
          min={0}
          max={59}
          disabled={disabled}
        />

        <NumberInput
          label={'[Seconds]'}
          onBlur={handleBlur}
          onFocus={() => handleFocus('seconds')}
          placeholder={placeholder?.[3] || '0'}
          errorMessage={errorMessage?.seconds}
          hasError={valueHasError || secondsHasError}
          onChange={(e) => handleChange(e, 'seconds')}
          value={seconds}
          step={1}
          min={0}
          max={59}
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
