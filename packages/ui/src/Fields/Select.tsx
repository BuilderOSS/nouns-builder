import { Flex } from '@buildeross/zord'
import { FormikProps } from 'formik'
import React, { ReactElement } from 'react'

import { DropdownSelect } from '../DropdownSelect'

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

  const handleChange = (selectedName: string) => {
    if (!optionsArray.length) return
    const method = optionsArray.find((option) => option.name === selectedName)
    if (!method) return
    formik.setFieldValue(id, { name: method.name, inputs: method.inputs })
  }

  return (
    <Flex direction={'column'}>
      <label htmlFor={id}>{inputLabel}</label>
      <DropdownSelect
        value={value?.name ?? ''}
        onChange={handleChange}
        options={[
          { label: 'Select option', value: '' },
          ...optionsArray.map((option: any) => ({
            label: option.name,
            value: option.name,
          })),
        ]}
        customLabel={value?.name || 'Select option'}
        positioning="absolute"
      />
    </Flex>
  )
}

export default FormSelect
