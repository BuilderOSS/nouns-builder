import { DaoLinkInput, DaoLinksField } from '@buildeross/ui'
import { SmartInput } from '@buildeross/ui/Fields'
import { MarkdownEditor } from '@buildeross/ui/MarkdownEditor'
import { SingleImageUpload } from '@buildeross/ui/SingleImageUpload'
import { isEmpty } from '@buildeross/utils/helpers'
import { Flex, Stack, Text } from '@buildeross/zord'
import { Form, Formik, getIn } from 'formik'
import React, { BaseSyntheticEvent } from 'react'

import { useFormStore } from '../../stores'
import { FormNavButtons } from '../FormNavButtons'
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
    projectDescription: general?.projectDescription || '',
    links: general?.links || [],
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

              <MarkdownEditor
                value={formik.values.projectDescription}
                onChange={(value: string) =>
                  formik.setFieldValue('projectDescription', value)
                }
                inputLabel={'DAO Description'}
                errorMessage={
                  formik.touched['projectDescription'] &&
                  formik.errors['projectDescription']
                    ? formik.errors['projectDescription']
                    : undefined
                }
              />

              <DaoLinksField
                value={formik.values.links}
                onChange={(links: DaoLinkInput[]) => formik.setFieldValue('links', links)}
                onBlur={(index, field) =>
                  formik.setFieldTouched(`links.${index}.${field}`, true, false)
                }
                inputLabel={'Additional links (optional)'}
                helperText={
                  'Add social or community links in addition to your primary DAO Website.'
                }
                getFieldError={(index: number, field: 'key' | 'url') => {
                  const error = getIn(formik.errors, `links.${index}.${field}`)
                  const touched = getIn(formik.touched, `links.${index}.${field}`)
                  return touched && typeof error === 'string' ? error : undefined
                }}
                errorMessage={
                  typeof formik.errors.links === 'string'
                    ? formik.errors.links
                    : undefined
                }
              />

              <Text variant={'label-xs'} color={'text3'}>
                Tip: use "DAO Website" above for your main site, then add socials/docs
                here.
              </Text>
            </Stack>
            <FormNavButtons
              nextDisabled={!isEmpty(formik.errors) || formik.isSubmitting}
              showReset={
                formik.values.daoAvatar !== '' ||
                formik.values.daoName !== '' ||
                formik.values.daoSymbol !== '' ||
                formik.values.daoWebsite !== '' ||
                formik.values.projectDescription !== '' ||
                formik.values.links.length > 0
              }
              onAfterReset={() =>
                formik.resetForm({
                  values: {
                    daoAvatar: '',
                    daoName: '',
                    daoSymbol: '',
                    daoWebsite: '',
                    projectDescription: '',
                    links: [],
                  },
                })
              }
            />
          </Flex>
        </Form>
      )}
    </Formik>
  )
}
