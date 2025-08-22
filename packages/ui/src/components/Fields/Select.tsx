import { Flex } from '@buildeross/zord'
import { FormikProps } from 'formik'
import React, { ReactElement } from 'react'

import { defaultSelectStyle } from './styles.css'

//TODO:: this is very specific logic to selecting from contract.interface.fragments, this component could be abstracted
const FormSelect: React.FC<{
  value: any
  options: any
  id: string
  inputLabel: string | ReactElement
  formik: FormikProps<any>
}> = ({ value, inputLabel, options, id, formik }) => {
  const optionsArray: any[] =
    options?.find((opt: { name: string }) => opt.name === id)?.options ?? []

  const handleChange = (e: any) => {
    if (!optionsArray.length) return
    const method = optionsArray.find((option) => option.name === e.target.value)
    if (!method) return
    formik.setFieldValue(id, { name: method.name, inputs: method.inputs })
  }

  return (
    <Flex direction={'column'}>
      <label htmlFor={id}>{inputLabel}</label>
      <select
        id={id}
        className={defaultSelectStyle}
        value={value?.name ?? ''}
        onChange={handleChange}
      >
        <option></option>
        {optionsArray?.map((option: any) => (
          <option value={option.name} key={option.name}>
            {option.name}
          </option>
        ))}
      </select>
    </Flex>
  )
}

export default FormSelect
