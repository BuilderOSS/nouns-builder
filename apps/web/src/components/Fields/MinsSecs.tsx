import { Box, Grid } from '@buildeross/zord'
import { FormikProps } from 'formik'
import React, { ChangeEventHandler, ReactElement } from 'react'

import { useLayoutStore } from 'src/stores/useLayoutStore'

import { NumberInput } from './NumberInput'
import { defaultInputLabelStyle } from './styles.css'

interface TimeBufferProps {
  id: string
  value: any
  inputLabel: string | ReactElement
  onChange: ChangeEventHandler
  onBlur: ChangeEventHandler
  formik?: FormikProps<any>
  errorMessage?: any
}

const MinsSecs: React.FC<TimeBufferProps> = ({
  inputLabel,
  formik,
  id,
  errorMessage,
  value,
}) => {
  const { isMobile } = useLayoutStore()

  const handleChange = (e: any, type: string) => {
    if (!formik) return
    const value = e.target.value
    formik.setFieldValue(`${id}.${type}`, parseInt(value))
  }

  const minutesHasError = React.useMemo(() => {
    return errorMessage?.minutes?.length > 0
  }, [errorMessage])

  const secondsHasError = React.useMemo(() => {
    return errorMessage?.seconds?.length > 0
  }, [errorMessage])

  return (
    <Box mb={'x3'}>
      <label className={defaultInputLabelStyle}>{inputLabel}</label>
      <Grid columns={isMobile ? '1fr' : '1fr 1fr'} gap={'x5'} mb={'x8'}>
        <NumberInput
          errorMessage={errorMessage?.minutes}
          hasError={minutesHasError}
          label="[Minutes]"
          placeholder={'1'}
          onChange={(e) => handleChange(e, 'minutes')}
          value={value?.minutes}
          min={0}
        />

        <NumberInput
          hasError={secondsHasError}
          errorMessage={errorMessage?.seconds}
          placeholder={'0'}
          min={0}
          onChange={(e) => handleChange(e, 'seconds')}
          value={value?.seconds}
          label={'[Seconds]'}
        />
      </Grid>
    </Box>
  )
}

export default MinsSecs
