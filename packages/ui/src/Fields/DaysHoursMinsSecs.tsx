import { Flex, Grid } from '@buildeross/zord'
import { FormikProps } from 'formik'
import React, { ChangeEventHandler, ReactElement } from 'react'

import NumberInput from './NumberInput'
import { defaultInputLabelStyle, mobileTwoColumnGrid } from './styles.css'

interface DaysHoursMinsProps {
  id: string
  value: any
  inputLabel: string | ReactElement
  onChange: ChangeEventHandler
  onBlur: ChangeEventHandler
  formik?: FormikProps<any>
  errorMessage?: any
  placeholder?: string[]
}

const DaysHoursMinsSecs: React.FC<DaysHoursMinsProps> = ({
  inputLabel,
  formik,
  id,
  errorMessage,
  placeholder,
  value,
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

  return (
    <Flex direction={'column'} mb={'x8'}>
      <label className={defaultInputLabelStyle}>{inputLabel}</label>
      <Grid gap={'x5'} mb={'x3'} className={mobileTwoColumnGrid}>
        <NumberInput
          label={'[Days]'}
          placeholder={placeholder?.[0] || '3'}
          hasError={valueHasError || daysHasError}
          errorMessage={errorMessage?.days}
          onChange={(e) => handleChange(e, 'days')}
          value={days}
          step={1}
          min={0}
        />

        <NumberInput
          label={'[Hours]'}
          placeholder={placeholder?.[1] || '0'}
          hasError={valueHasError || hoursHasError}
          errorMessage={errorMessage?.hours}
          onChange={(e) => handleChange(e, 'hours')}
          value={hours}
          step={1}
          min={0}
        />

        <NumberInput
          label={'[Minutes]'}
          placeholder={placeholder?.[2] || '0'}
          errorMessage={errorMessage?.minutes}
          hasError={valueHasError || minutesHasError}
          onChange={(e) => handleChange(e, 'minutes')}
          value={minutes}
          step={1}
          min={0}
        />

        <NumberInput
          label={'[Seconds]'}
          placeholder={placeholder?.[3] || '0'}
          errorMessage={errorMessage?.seconds}
          hasError={valueHasError || secondsHasError}
          onChange={(e) => handleChange(e, 'seconds')}
          value={seconds}
          step={1}
          min={0}
        />
      </Grid>

      {valueHasError && <Flex color="negative">{errorMessage}</Flex>}
    </Flex>
  )
}

export default DaysHoursMinsSecs
