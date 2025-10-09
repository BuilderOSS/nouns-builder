import { FormikProps } from 'formik'
import React, { BaseSyntheticEvent, ReactNode } from 'react'

import Date from './DatePicker'
import DaysHoursMins from './DaysHoursMins'
import DaysHoursMinsSecs from './DaysHoursMinsSecs'
import MinsSecs from './MinsSecs'
import Select from './Select'
import SmartInput from './SmartInput'
import TextArea from './TextArea'
import { FIELD_TYPES, FieldType } from './types'

interface FieldSwitchProps {
  field: {
    type: FieldType
    name: string
    inputLabel: string
    helperText?: string
    max?: number
    min?: number
    perma?: string
    step?: number
    placeholder?: any
    disabled?: boolean
    minHeight?: number
    isAddress?: boolean
  }
  formik: FormikProps<any>
  autoSubmit?: boolean
  children?: ReactNode
  options?: any[] | { label: string; value: string }[]
  submitCallback?: (values: any) => void
  parentValues?: any
}

const FieldSwitch: React.FC<FieldSwitchProps> = ({
  field,
  formik,
  autoSubmit,
  submitCallback,
  options,
  parentValues,
}) => {
  /*

        handle smartInput onChange

   */
  const handleChange = (e: BaseSyntheticEvent) => {
    const { value } = e.target
    if (!formik) return

    const next =
      field.type === FIELD_TYPES.NUMBER ? (value === '' ? '' : Number(value)) : value

    // Avoid writing NaN into form state
    if (field.type === FIELD_TYPES.NUMBER && Number.isNaN(next)) return

    formik.setFieldValue(field.name, next)
  }

  switch (field.type) {
    case FIELD_TYPES.DATE:
      return (
        <Date
          {...formik.getFieldProps(field.name)}
          inputLabel={field.inputLabel}
          formik={formik}
          id={field.name}
          errorMessage={
            formik.touched[field.name] && formik.errors[field.name]
              ? formik.errors[field.name]
              : undefined
          }
          placeholder={field.placeholder}
          autoSubmit={autoSubmit}
          parentValues={parentValues}
          disabled={field.disabled}
        />
      )
    case FIELD_TYPES.DAYS_HOURS_MINS:
      return (
        <DaysHoursMins
          {...formik.getFieldProps(field.name)}
          inputLabel={field.inputLabel}
          formik={formik}
          id={field.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          errorMessage={
            formik.touched[field.name] && formik.errors[field.name]
              ? formik.errors[field.name]
              : undefined
          }
          placeholder={field.placeholder}
        />
      )
    case FIELD_TYPES.DAYS_HOURS_MINS_SECS:
      return (
        <DaysHoursMinsSecs
          {...formik.getFieldProps(field.name)}
          inputLabel={field.inputLabel}
          formik={formik}
          id={field.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          errorMessage={
            formik.touched[field.name] && formik.errors[field.name]
              ? formik.errors[field.name]
              : undefined
          }
          placeholder={field.placeholder}
        />
      )
    case FIELD_TYPES.SELECT:
      return (
        <Select
          options={options}
          {...formik.getFieldProps(field.name)}
          inputLabel={field.inputLabel}
          formik={formik}
          id={field.name}
        />
      )
    case FIELD_TYPES.TEXT:
    case FIELD_TYPES.NUMBER:
      return (
        <SmartInput
          {...formik.getFieldProps(field.name)}
          inputLabel={field.inputLabel}
          type={field.type}
          formik={formik}
          id={field.name}
          onChange={(e: BaseSyntheticEvent) => {
            handleChange(e)
          }}
          onBlur={formik.handleBlur}
          helperText={field.helperText}
          errorMessage={
            formik.values[field.name] && formik.errors[field.name]
              ? formik.errors[field.name]
              : undefined
          }
          autoSubmit={autoSubmit}
          submitCallback={submitCallback}
          max={field.max}
          perma={field.perma}
          placeholder={field.placeholder}
          step={field.step}
          disabled={field.disabled}
          isAddress={field.isAddress}
        />
      )

    case FIELD_TYPES.TEXTAREA:
      return (
        <TextArea
          {...formik.getFieldProps(field.name)}
          inputLabel={field.inputLabel}
          formik={formik}
          id={field.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={field.helperText}
          errorMessage={
            formik.values[field.name] && formik.errors[field.name]
              ? formik.errors[field.name]
              : undefined
          }
          autoSubmit={autoSubmit}
          placeholder={field.placeholder}
          minHeight={field.minHeight}
        />
      )
    case FIELD_TYPES.MINS_SECS:
      return (
        <MinsSecs
          {...formik.getFieldProps(field.name)}
          inputLabel={field.inputLabel}
          formik={formik}
          id={field.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          errorMessage={
            formik.touched[field.name] && formik.errors[field.name]
              ? formik.errors[field.name]
              : undefined
          }
        />
      )
    default:
      return null
  }
}

export default FieldSwitch
