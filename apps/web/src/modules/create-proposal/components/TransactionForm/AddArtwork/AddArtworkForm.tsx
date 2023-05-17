import { atoms, Box, Button, Flex, Text } from '@buildeross/zord'
import { Form, Formik } from 'formik'
import isEmpty from 'lodash/isEmpty'
import React, { useState } from 'react'
import { Icon } from 'src/components/Icon'
import { NetworkController } from 'src/components/NetworkController'
import { Uploading } from 'src/components/Uploading'
import { useArtworkStore } from 'src/modules/create-proposal/stores/useArtworkStore'

import { ArtworkUpload } from '../../ArtworkUpload'
import { checkboxHelperText, checkboxStyleVariants } from './AddArtworkForm.css'
import { ArtworkFormValues, validationSchemaArtwork } from './AddArtworkForm.schema'

export interface InvalidProperty {
  currentVariantCount: number
  currentLayerName: string
  nextName: string
}
export interface AddArtworkFormProps {
  disabled: boolean
  isPropertyCountValid: boolean
  propertiesCount: number
  invalidProperty?: InvalidProperty
  handleSubmit: (values: ArtworkFormValues) => void
}

export const AddArtworkForm: React.FC<AddArtworkFormProps> = ({
  disabled,
  isPropertyCountValid,
  propertiesCount,
  handleSubmit,
}) => {
  const { isUploadingToIPFS, ipfsUploadProgress, ipfsUpload, setUpArtwork } =
    useArtworkStore()
  const [hasConfirmed, setHasConfirmed] = useState(
    process.env.NEXT_PUBLIC_CHAIN_ID === '5' ? true : false
  )

  const initialValues = {
    artwork: setUpArtwork?.artwork || [],
    filesLength: setUpArtwork?.filesLength || '',
  }

  const showPropertyErrors = ipfsUpload.length > 0

  return (
    <Box w={'100%'}>
      <Text fontWeight={'display'}>Requirements for Add Artwork proposal:</Text>
      <Box as="ul" color="text3" mt="x6">
        <Box as="li" mb="x3">
          The total number of new traits must be equal to or greater than the number of
          old traits.
        </Box>
        <Box as="li" mb="x3">
          All trait folders should be included in the same order as the original upload
          even if they contain no new artwork.
        </Box>
        <Box as="li" mb="x3">
          Previously uploaded variants should be removed to avoid dulicates.
        </Box>
        <Box as="li">New traits must be added to the end of the folder hierarchy.</Box>
      </Box>
      <Uploading
        isUploadingToIPFS={isUploadingToIPFS}
        ipfsUploadProgress={ipfsUploadProgress}
      />
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
          <Flex as={Form} direction={'column'} mt="x8">
            <ArtworkUpload
              {...formik.getFieldProps('artwork')}
              inputLabel={'Artwork'}
              formik={formik}
              id={'artwork'}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              helperText={
                'Builder uses folder hierarchy to organize your assets. Upload a single folder containing a subfolder for each trait. Each subfolder should contain every variant for that trait.'
              }
              errorMessage={
                formik.touched.artwork && formik.errors?.artwork
                  ? formik.errors?.artwork
                  : undefined
              }
            />

            {showPropertyErrors && !isPropertyCountValid && (
              <Text
                w="100%"
                textAlign={'center'}
                color={'negative'}
              >{`Current total number of traits is ${propertiesCount}. The new folder of traits must have a minimum total of ${propertiesCount}`}</Text>
            )}

            <NetworkController.Mainnet>
              <Flex align={'center'} justify={'center'} gap={'x4'} mt="x4">
                <Flex
                  align={'center'}
                  justify={'center'}
                  className={
                    checkboxStyleVariants[hasConfirmed ? 'confirmed' : 'default']
                  }
                  onClick={() => setHasConfirmed((bool) => !bool)}
                >
                  {hasConfirmed && <Icon fill="background1" id="check" />}
                </Flex>

                <Flex className={checkboxHelperText}>
                  I confirm I have tested an artwork replacement proposal on{' '}
                  <a
                    href={'https://testnet.nouns.build'}
                    target="_blank"
                    className={atoms({ color: 'accent' })}
                    rel="noreferrer"
                  >
                    testnet
                  </a>
                </Flex>
              </Flex>
            </NetworkController.Mainnet>

            <Button
              mt={'x9'}
              variant={'outline'}
              borderRadius={'curved'}
              type="submit"
              disabled={
                disabled ||
                !hasConfirmed ||
                !isEmpty(formik.errors) ||
                formik.isSubmitting
              }
            >
              Add Transaction to Queue
            </Button>
          </Flex>
        )}
      </Formik>
    </Box>
  )
}
