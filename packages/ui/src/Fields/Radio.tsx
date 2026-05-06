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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = options.findIndex((opt) => opt.value === value)
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIndex = (currentIndex + 1) % options.length
      handleSelection(options[nextIndex].value)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prevIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1
      handleSelection(options[prevIndex].value)
    }
  }

  return (
    <Stack mb={'x8'}>
      {inputLabel && <label className={defaultInputLabelStyle}>{inputLabel}</label>}
      <Flex direction={flexDirection} role="radiogroup" onKeyDown={handleKeyDown}>
        {options.map((option) => (
          <Flex
            as={'button'}
            type="button"
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
            role="radio"
            aria-checked={value !== undefined && option.value === value}
            tabIndex={value !== undefined && option.value === value ? 0 : -1}
          >
            {option.label}
          </Flex>
        ))}
      </Flex>
    </Stack>
  )
}

export default Radio
