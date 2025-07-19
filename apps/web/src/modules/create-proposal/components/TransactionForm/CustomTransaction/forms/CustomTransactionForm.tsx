import { isEmpty } from '@buildeross/utils/helpers'
import { Button, Flex, Stack } from '@buildeross/zord'
import { Form, Formik, FormikValues } from 'formik'
import React, { ReactElement } from 'react'

import FieldSwitch from 'src/components/Fields/FieldSwitch'
import { useCustomTransactionStore } from 'src/modules/create-proposal'

import { backButton, transactionFormButtonWithPrev } from './CustomTransactionForm.css'

interface FormField {
  name: string
  type: string
  inputLabel: string | ReactElement
  helperText?: string
}

interface CustomTransactionFormProps<Values> {
  fields: FormField[]
  initialValues: Values
  validationSchema?: {}
  enableReinitialize?: boolean
  submitCallback: (updates: Values) => void
  options?: any[] | undefined
  validateOnBlur?: boolean
}

export function CustomTransactionForm<Values extends FormikValues>({
  fields,
  initialValues,
  validationSchema,
  submitCallback,
  options,
  validateOnBlur = false,
}: React.PropsWithChildren<CustomTransactionFormProps<Values>>) {
  const {
    active: activeCustomTransactionSection,
    next: nextCustomTransactionForm,
    previous: previousCustomTransactionForm,
  } = useCustomTransactionStore()

  const mouseDownEvent = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
  }

  const handleSubmit = (values: Values) => {
    submitCallback(values)
    nextCustomTransactionForm()
  }

  const handlePrev = () => {
    previousCustomTransactionForm()
  }

  return (
    <Formik<Values>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize={true}
      validateOnMount={true}
      validateOnBlur={validateOnBlur}
    >
      {(formik) => {
        return (
          <Form>
            <Stack>
              {fields.map((f, i) => (
                <FieldSwitch
                  key={i}
                  formik={formik}
                  field={f}
                  autoSubmit={false}
                  options={options}
                  submitCallback={submitCallback}
                />
              ))}
            </Stack>

            <Flex>
              {activeCustomTransactionSection > 0 ? (
                <>
                  <Flex
                    justify={'center'}
                    align={'center'}
                    px={'x4'}
                    py={'x2'}
                    onClick={() => handlePrev()}
                    className={backButton}
                  >
                    Back
                  </Flex>
                </>
              ) : null}{' '}
              <Button
                h={'x15'}
                className={transactionFormButtonWithPrev}
                type={'submit'}
                disabled={!isEmpty(formik.errors) || formik.isSubmitting}
                onMouseDown={mouseDownEvent}
              >
                Next
              </Button>
            </Flex>
          </Form>
        )
      }}
    </Formik>
  )
}
