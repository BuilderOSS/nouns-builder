import { isEmpty } from '@buildeross/utils/helpers'
import { Button, Flex, Stack } from '@buildeross/zord'
import { Form, Formik } from 'formik'
import React, { BaseSyntheticEvent } from 'react'
import SmartInput from 'src/components/Fields/SmartInput'
import { defaultFormButton } from 'src/components/Fields/styles.css'
import SingleImageUpload from 'src/components/SingleImageUpload/SingleImageUpload'

import { useFormStore } from '../../stores'
import { GeneralFormValues, generalValidationSchema } from './GeneralForm.schema'

interface GeneralFormProps {
  title: string
}

export const GeneralForm: React.FC<GeneralFormProps> = ({ title }) => {
  const { setGeneral, general, setFulfilledSections, setActiveSection, activeSection } =
    useFormStore()

  const initialValues: GeneralFormValues = {
    daoAvatar: general?.daoAvatar || '',
    daoName: general?.daoName || '',
    daoSymbol: general?.daoSymbol || '',
    daoWebsite: general?.daoWebsite || '',
  }
  const handleSubmit = (values: GeneralFormValues) => {
    setGeneral(values)
    setFulfilledSections(title)
    setActiveSection(activeSection + 1)
  }

  return (
    <Formik<GeneralFormValues>
      initialValues={initialValues}
      validationSchema={generalValidationSchema}
      onSubmit={handleSubmit}
      enableReinitialize={true}
      validateOnMount={true}
      validateOnBlur={false}
    >
      {(formik) => (
        <Form>
          <Flex direction={'column'} w={'100%'}>
            <Stack>
              <SingleImageUpload
                {...formik.getFieldProps('daoAvatar')}
                formik={formik}
                id={'daoAvatar'}
                inputLabel={'Dao avatar'}
                helperText={'Upload'}
              />
              <SmartInput
                {...formik.getFieldProps('daoName')}
                type={'text'}
                inputLabel={'Dao Name'}
                formik={formik}
                id={'daoName'}
                onChange={({ target }: BaseSyntheticEvent) => {
                  formik.setFieldValue('daoName', target.value)
                  formik.setFieldValue(
                    'daoSymbol',
                    `$${target.value
                      .toUpperCase()
                      .replace(/[AEIOU\s]/g, '')
                      .slice(0, 4)}`
                  )
                }}
                onBlur={formik.handleBlur}
                helperText={'This is the full name of your DAO (ex: "Nouns")'}
                errorMessage={
                  formik.touched['daoName'] && formik.errors['daoName']
                    ? formik.errors['daoName']
                    : undefined
                }
                placeholder={'Nouns'}
                disabled={false}
              />
              <SmartInput
                {...formik.getFieldProps('daoSymbol')}
                type={'text'}
                inputLabel={'Dao Symbol'}
                formik={formik}
                id={'daoSymbol'}
                onChange={({ target }: BaseSyntheticEvent) => {
                  formik.setFieldValue('daoSymbol', target.value)
                }}
                onBlur={formik.handleBlur}
                helperText={
                  'This will show up on-chain as the name of the project and as the name of each NFT , (ex:  "NOUNS #60")'
                }
                errorMessage={
                  formik.touched['daoSymbol'] && formik.errors['daoSymbol']
                    ? formik.errors['daoSymbol']
                    : undefined
                }
                placeholder={'$NOUNS'}
                disabled={false}
              />
              <SmartInput
                {...formik.getFieldProps('daoWebsite')}
                type={'text'}
                inputLabel={'Dao Website'}
                formik={formik}
                id={'daoWebsite'}
                onChange={({ target }: BaseSyntheticEvent) => {
                  formik.setFieldValue('daoWebsite', target.value)
                }}
                onBlur={formik.handleBlur}
                helperText={'Add an optional website link for your DAO'}
                errorMessage={
                  formik.touched['daoWebsite'] && formik.errors['daoWebsite']
                    ? formik.errors['daoWebsite']
                    : undefined
                }
                placeholder={'https://www.nouns.wtf'}
                disabled={false}
              />
              <Button
                h={'x15'}
                className={defaultFormButton}
                type={'submit'}
                disabled={!isEmpty(formik.errors) || formik.isSubmitting}
                onMouseDown={(e: React.MouseEvent<HTMLElement>) => e.preventDefault()}
              >
                Continue
              </Button>
            </Stack>
          </Flex>
        </Form>
      )}
    </Formik>
  )
}
