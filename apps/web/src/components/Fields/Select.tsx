import { Flex } from '@buildeross/zord'
import { FormikProps } from 'formik'
import React, { ReactElement } from 'react'

import { defaultSelectStyle } from './styles.css'

//TODO:: this is very specific logic to selecting from contract.interface.fragments, this component could be abstracted
const Select: React.FC<{
  value: any
  options: any
  id: string
  inputLabel: string | ReactElement
  formik: FormikProps<any>
}> = ({ value, inputLabel, options, id, formik }) => {
  const optionsArray: any[] = options?.filter(
    (options: { name: string }) => options.name === id
  )[0]?.options

  const handleChange = (e: any) => {
    const method = optionsArray.filter((option) => option.name === e.target.value)[0]
    formik.setFieldValue(id, { name: method.name, inputs: method.inputs })
  }

  return (
    <Flex direction={'column'}>
      <label>{inputLabel}</label>
      <select className={defaultSelectStyle} onChange={(e) => handleChange(e)}>
        <option></option>
        {optionsArray?.map((option: any) => (
          <option selected={value?.name === option.name} key={option.name}>
            {option.name}
          </option>
        ))}
      </select>
    </Flex>
  )
}

export default Select
