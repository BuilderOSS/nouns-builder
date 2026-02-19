import { PUBLIC_IS_TESTNET } from '@buildeross/constants'
import { useChainStore } from '@buildeross/stores'
import { type Property } from '@buildeross/types'
import { Uploading } from '@buildeross/ui/Uploading'
import { isTestnetChain } from '@buildeross/utils/helpers'
import { atoms, Box, Button, Flex, Icon, Text } from '@buildeross/zord'
import { Form, Formik } from 'formik'
import isEmpty from 'lodash/isEmpty'
import React, { useState } from 'react'

import { useArtworkStore } from '../../../stores/useArtworkStore'
import { ArtworkUpload } from '../../ArtworkUpload'
import { checkboxHelperText, checkboxStyleVariants } from './AddArtworkForm.css'
import { type ArtworkFormValues, validationSchemaArtwork } from './AddArtworkForm.schema'

export interface InvalidProperty {
  currentVariantCount: number
  currentLayerName: string
  nextName: string
}

export interface InvalidPropertyOrder {
  trait: string
  layerName: string
  invalidLayerName: string
}

export interface AddArtworkFormProps {
  disabled: boolean
  isPropertyCountValid: boolean
  properties: Property[]
  propertiesCount: number
  invalidProperty?: InvalidProperty
  invalidPropertyOrder?: InvalidPropertyOrder
  handleSubmit: (values: ArtworkFormValues) => void
}

export const AddArtworkForm: React.FC<AddArtworkFormProps> = ({
  properties,
  disabled,
  isPropertyCountValid,
  invalidProperty,
  invalidPropertyOrder,
  propertiesCount,
  handleSubmit,
}) => {
  const { isUploadingToIPFS, ipfsUploadProgress, ipfsUpload, setUpArtwork } =
    useArtworkStore()
  const { id: chainId } = useChainStore((state) => state.chain)
  const isTestnetDAO = React.useMemo(() => isTestnetChain(chainId), [chainId])
  const [hasConfirmed, setHasConfirmed] = useState(isTestnetDAO ? true : false)

  const values = {
    artwork: setUpArtwork?.artwork || [],
    filesLength: setUpArtwork?.filesLength || '',
  }

  const showPropertyErrors = ipfsUpload.length > 0

  return (
    <Box w={'100%'}>
      <Text fontWeight={'display'}>Requirements for Add Artwork proposal:</Text>
      <Box as="ul" color="text3" mt="x6">
        <Box as="li" mb="x3">
          New traits must be added as a new top-level layer.
        </Box>
        <Box as="li" mb="x3">
          Do not re-upload previously added variants to avoid duplicates.
        </Box>
        <Box as="li" mb="x3">
          When adding new variants to an existing trait, the folder name must match the
          original exactly (including spelling and casing).
        </Box>
        <Box as="li" mb="x3">
          The total number of new traits should be equal to or greater than the number of
          old traits.
        </Box>
        <Box as="li">
          You only need to include folders for traits that have new variants.
        </Box>
      </Box>
      <Uploading
        isUploadingToIPFS={isUploadingToIPFS}
        ipfsUploadProgress={ipfsUploadProgress}
      />
      <Formik<ArtworkFormValues>
        // We are using formik only for validation, and values are set via initialValues & enableReinitialize
        initialValues={values}
        enableReinitialize
        validateOnBlur={false}
        validateOnMount={true}
        validateOnChange={true}
        validationSchema={validationSchemaArtwork}
        onSubmit={handleSubmit}
      >
        {(formik) => {
          return (
            <Flex as={Form} direction={'column'} mt="x8">
              <ArtworkUpload
                inputLabel={'Artwork'}
                existingProperties={properties}
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

              {showPropertyErrors && !isPropertyCountValid && (
                <Text
                  w="100%"
                  textAlign={'center'}
                  color={'negative'}
                >{`Current total number of traits is ${propertiesCount}. The new folder of traits must have a minimum total of ${propertiesCount}`}</Text>
              )}
              {showPropertyErrors && invalidProperty && (
                <Text
                  w="100%"
                  textAlign={'center'}
                  color={'negative'}
                >{`${invalidProperty.currentLayerName} currently has ${invalidProperty.currentVariantCount} trait variants. New trait for ${invalidProperty.currentLayerName} "${invalidProperty.nextName}" should also have minimum ${invalidProperty.currentVariantCount} trait variants.`}</Text>
              )}
              {showPropertyErrors && invalidPropertyOrder && (
                <Text
                  w="100%"
                  textAlign={'center'}
                  color={'negative'}
                >{`The trait "${invalidPropertyOrder.trait}" in ${invalidPropertyOrder.invalidLayerName} is not in the correct position. It should be in ${invalidPropertyOrder.layerName}.`}</Text>
              )}

              {!isTestnetDAO && (
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
                    I confirm I have tested an artwork addition proposal on a{' '}
                    <strong>testnet DAO</strong>
                    {!PUBLIC_IS_TESTNET && (
                      <>
                        {' '}
                        (via{' '}
                        <a
                          href="https://testnet.nouns.build"
                          target="_blank"
                          className={atoms({ color: 'accent' })}
                          rel="noreferrer"
                        >
                          testnet.nouns.build
                        </a>
                        ).
                      </>
                    )}
                    {PUBLIC_IS_TESTNET && '.'}
                  </Flex>
                </Flex>
              )}

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
          )
        }}
      </Formik>
    </Box>
  )
}
