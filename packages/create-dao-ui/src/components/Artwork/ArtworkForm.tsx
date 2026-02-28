import { MarkdownEditor } from '@buildeross/ui/MarkdownEditor'
import { Field, FieldProps, Form, Formik } from 'formik'
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
    artwork: setUpArtwork?.artwork || [],
    filesLength: setUpArtwork?.filesLength || '',
    fileType: setUpArtwork?.fileType || '',
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
