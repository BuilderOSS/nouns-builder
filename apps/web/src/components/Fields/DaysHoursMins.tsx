import { Flex, Grid } from '@buildeross/zord'
import { FormikProps } from 'formik'
import React, { ChangeEventHandler, ReactElement } from 'react'
import { useLayoutStore } from 'src/stores/useLayoutStore'

import { NumberInput } from './NumberInput'
import { defaultInputLabelStyle } from './styles.css'

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

const DaysHoursMins: React.FC<DaysHoursMinsProps> = ({
  inputLabel,
  formik,
  id,
  errorMessage,
  value,
}) => {
  const { isMobile } = useLayoutStore()
  const { days, hours, minutes } = value
  const handleChange = (e: any, type: string) => {
    if (!formik) return
    const value = e.target.value
    formik.setFieldValue(`${id}.${type}`, parseInt(value))
  }

  const daysHasError = React.useMemo(() => {
    return errorMessage?.days?.length > 0
  }, [errorMessage])

  const hoursHasError = React.useMemo(() => {
    return errorMessage?.hours?.length > 0
  }, [errorMessage])

  const minutesHasError = React.useMemo(() => {
    return errorMessage?.minutes?.length > 0
  }, [errorMessage])

  return (
    <Flex direction={'column'} mb={'x3'}>
      <label className={defaultInputLabelStyle}>{inputLabel}</label>
      <Grid columns={isMobile ? '1fr' : '1fr 1fr 1fr'} gap={'x5'} mb={'x8'}>
        <NumberInput
          label={'[Days]'}
          placeholder={'1'}
          hasError={daysHasError}
          errorMessage={errorMessage?.days}
          onChange={(e) => handleChange(e, 'days')}
          value={days}
          step={1}
          min={0}
        />

        <NumberInput
          label={'[Hours]'}
          placeholder={'0'}
          hasError={hoursHasError}
          errorMessage={errorMessage?.hours}
          onChange={(e) => handleChange(e, 'hours')}
          value={hours}
          step={1}
          min={0}
        />

        <NumberInput
          label={'[Minutes]'}
          placeholder={'0'}
          errorMessage={errorMessage?.minutes}
          hasError={minutesHasError}
          onChange={(e) => handleChange(e, 'minutes')}
          value={minutes}
          step={1}
          min={0}
        />
      </Grid>
    </Flex>
  )
}

export default DaysHoursMins
