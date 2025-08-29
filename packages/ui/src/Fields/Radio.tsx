import { Atoms, Flex, Stack } from '@buildeross/zord'
import { FormikProps } from 'formik'
import React from 'react'

import { defaultInputLabelStyle, radioStyles } from './styles.css'

interface RadioProps<T> {
  formik: FormikProps<any>
  id: string
  options: { value: T; label: string }[]
  value?: T
  inputLabel?: string
  flexDirection?: Atoms['flexDirection']
}

export function Radio<T extends React.Key | boolean>({
  formik,
  id,
  options,
  value,
  inputLabel,
  flexDirection = 'column',
}: React.PropsWithChildren<RadioProps<T>>) {
  const handleSelection = (val: T) => {
    formik.setFieldValue(id, val)
  }

  return (
    <Stack mb={'x8'}>
      {inputLabel && <label className={defaultInputLabelStyle}>{inputLabel}</label>}
      <Flex direction={flexDirection}>
        {options.map((option) => (
          <Flex
            key={option.value.toString()}
            align={'center'}
            justify={'center'}
            borderColor={'secondary'}
            borderRadius={'curved'}
            borderStyle={'solid'}
            width={'100%'}
            height={'x16'}
            m={'x2'}
            className={
              radioStyles[
                value !== undefined && option.value === value ? 'active' : 'default'
              ]
            }
            onClick={() => handleSelection(option.value)}
          >
            {option.label}
          </Flex>
        ))}
      </Flex>
    </Stack>
  )
}

export default Radio
