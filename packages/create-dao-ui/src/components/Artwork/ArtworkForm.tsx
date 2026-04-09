import { FIELD_TYPES, SmartInput } from '@buildeross/ui/Fields'
import { MarkdownEditor } from '@buildeross/ui/MarkdownEditor'
import { Box, Flex, Icon, Text } from '@buildeross/zord'
import { Field, FieldArray, FieldProps, Form, Formik } from 'formik'
import isEmpty from 'lodash/isEmpty'
import React from 'react'

import { useFormStore } from '../../stores'
import { FormNavButtons } from '../FormNavButtons'
import { ArtworkFormValues, validationSchemaArtwork } from './ArtworkForm.schema'
import { ArtworkUpload } from './ArtworkUpload'

interface ArtworkProps {
  title: string
}

export const Artwork: React.FC<ArtworkProps> = ({ title }) => {
  const {
    setUpArtwork,
    setFulfilledSections,
    activeSection,
    setActiveSection,
    ipfsUpload,
    isUploadingToIPFS,
    setSetUpArtwork,
  } = useFormStore()

  const initialValues = {
    projectDescription: setUpArtwork?.projectDescription || '',
    links: setUpArtwork?.links || [],
    artwork: setUpArtwork?.artwork || [],
    filesLength: setUpArtwork?.filesLength || '',
    fileType: setUpArtwork?.fileType || '',
  }

  const getLinkIcon = (
    key: string
  ): 'twitter' | 'discord' | 'github' | 'globe' | 'question' => {
    const normalized = key.trim().toLowerCase()
    if (normalized === 'x' || normalized === 'twitter') return 'twitter'
    if (normalized === 'discord') return 'discord'
    if (normalized === 'github') return 'github'
    if (normalized === 'farcaster') return 'globe'
    if (normalized === 'docs' || normalized === 'notion') return 'globe'
    if (normalized === 'forum' || normalized === 'discourse') return 'globe'
    return 'question'
  }

  const handlePrevious = () => {
    setActiveSection(activeSection - 1)
  }

  const handleSubmit = (values: ArtworkFormValues) => {
    setFulfilledSections(title)
    setActiveSection(activeSection + 1)
    setSetUpArtwork({
      ...setUpArtwork,
      projectDescription: values.projectDescription,
      links: values.links,
    })
  }

  return (
    <Formik<ArtworkFormValues>
      initialValues={initialValues}
      enableReinitialize
      validateOnBlur={false}
      validateOnMount={true}
      validateOnChange={true}
      validationSchema={validationSchemaArtwork}
      onSubmit={handleSubmit}
    >
      {(formik) => (
        <Form>
          <Field name="projectDescription" id={'projectDescription'}>
            {({ field }: FieldProps) => {
              return (
                <MarkdownEditor
                  value={field.value}
                  onChange={(value: string) => formik.setFieldValue(field.name, value)}
                  inputLabel={'DAO Description'}
                  errorMessage={
                    formik.touched?.projectDescription &&
                    formik.errors?.projectDescription
                      ? formik.errors?.projectDescription
                      : undefined
                  }
                />
              )
            }}
          </Field>

          <FieldArray name="links">
            {({ push, remove }) => (
              <Box mt={'x6'} mb={'x4'}>
                <Flex justify={'space-between'} align={'center'} mb={'x2'}>
                  <Text variant={'label-md'}>DAO Links (optional)</Text>
                  <button
                    type="button"
                    onClick={() => push({ key: '', url: '' })}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: 'inherit',
                    }}
                  >
                    + Add link
                  </button>
                </Flex>

                <Text variant={'paragraph-sm'} color={'text3'} mb={'x3'}>
                  Add social or community links as key/value pairs (x, discord, farcaster,
                  github, docs, forum, etc).
                </Text>

                <Flex direction={'column'} gap={'x2'}>
                  {formik.values.links.map((link, index) => (
                    <Flex key={`${index}-${link.key}`} align={'center'} gap={'x2'}>
                      <Icon id={getLinkIcon(link.key)} />
                      <SmartInput
                        id={`links.${index}.key`}
                        type={FIELD_TYPES.TEXT}
                        formik={formik}
                        {...formik.getFieldProps(`links.${index}.key`)}
                        placeholder={'key'}
                        errorMessage={
                          (formik.touched.links as any)?.[index]?.key
                            ? (formik.errors.links as any)?.[index]?.key
                            : undefined
                        }
                      />
                      <SmartInput
                        id={`links.${index}.url`}
                        type={FIELD_TYPES.TEXT}
                        formik={formik}
                        {...formik.getFieldProps(`links.${index}.url`)}
                        placeholder={'https://...'}
                        errorMessage={
                          (formik.touched.links as any)?.[index]?.url
                            ? (formik.errors.links as any)?.[index]?.url
                            : undefined
                        }
                      />
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: 'inherit',
                        }}
                        aria-label={`Remove link ${index + 1}`}
                      >
                        <Icon id="cross" />
                      </button>
                    </Flex>
                  ))}
                </Flex>

                {typeof formik.errors.links === 'string' ? (
                  <Text variant={'label-xs'} color={'negative'} mt={'x2'}>
                    {formik.errors.links}
                  </Text>
                ) : null}
              </Box>
            )}
          </FieldArray>

          <ArtworkUpload
            inputLabel={'Artwork'}
            formik={formik}
            id={'artwork'}
            helperText={
              'Builder uses folder hierarchy to organize your assets. Upload a single folder containing a subfolder for each trait. Each subfolder should contain every variant for that trait.\nMaximum directory size: 200MB\nSupported image types: PNG and SVG'
            }
            errorMessage={
              formik.touched.artwork && formik.errors?.artwork
                ? formik.errors?.artwork
                : undefined
            }
          />

          <FormNavButtons
            hasPrev
            onPrev={handlePrevious}
            nextDisabled={
              !isEmpty(formik.errors) ||
              formik.isSubmitting ||
              isUploadingToIPFS ||
              ipfsUpload.length === 0
            }
          />
        </Form>
      )}
    </Formik>
  )
}
