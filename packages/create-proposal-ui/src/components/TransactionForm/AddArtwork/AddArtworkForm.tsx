import { PUBLIC_IS_TESTNET } from '@buildeross/constants'
import { useChainStore } from '@buildeross/stores'
import { type Property } from '@buildeross/types'
import { Uploading } from '@buildeross/ui/Uploading'
import { isTestnetChain } from '@buildeross/utils/chains'
import { atoms, Box, Button, Flex, Icon, Text } from '@buildeross/zord'
import { Form, Formik } from 'formik'
import isEmpty from 'lodash/isEmpty'
import React, { useMemo, useState } from 'react'

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
  fileExtensionMismatch?: string | null
  dimensionMismatch?: string | null
  handleSubmit: (values: ArtworkFormValues) => void
}

export const AddArtworkForm: React.FC<AddArtworkFormProps> = ({
  properties,
  disabled,
  isPropertyCountValid,
  invalidProperty,
  invalidPropertyOrder,
  fileExtensionMismatch,
  dimensionMismatch,
  propertiesCount,
  handleSubmit,
}) => {
  const { isUploadingToIPFS, ipfsUploadProgress, ipfsUpload, setUpArtwork } =
    useArtworkStore()
  const { id: chainId } = useChainStore((state) => state.chain)
  const isTestnetDAO = React.useMemo(() => isTestnetChain(chainId), [chainId])
  const [hasConfirmed, setHasConfirmed] = useState(isTestnetDAO ? true : false)

  const values = useMemo(
    () => ({
      artwork: setUpArtwork?.artwork || [],
      filesLength: setUpArtwork?.filesLength || '',
    }),
    [setUpArtwork?.artwork, setUpArtwork?.filesLength]
  )

  const showPropertyErrors = ipfsUpload.length > 0

  return (
    <Box w={'100%'}>
      <Text fontWeight={'display'}>Requirements for Add Artwork proposal:</Text>
      <Box color="text3" mt="x6">
        <Box mb="x3">
          <Text fontWeight={'label'}>Adding new traits:</Text> New traits must be added as
          a new top-level layer in your folder structure.
        </Box>
        <Box mb="x3">
          <Text fontWeight={'label'}>Adding variants to existing traits:</Text> When
          adding new variants to an existing trait, the folder name must match the
          original exactly (including spelling and casing).
        </Box>
        <Box mb="x3">
          <Text fontWeight={'label'}>File consistency:</Text> All uploaded artwork must
          use the same file type (PNG, SVG, or GIF) and dimensions as existing artwork in
          the collection.
        </Box>
        <Box mb="x3">
          <Text fontWeight={'label'}>Avoid duplicates:</Text> Do not re-upload previously
          added variants to avoid duplicates.
        </Box>
        <Box mb="x3">
          <Text fontWeight={'label'}>Minimum requirements:</Text> The total number of
          traits should be equal to or greater than the number of existing traits.
        </Box>
        <Box>
          <Text fontWeight={'label'}>Selective uploads:</Text> You can add both new traits
          AND new variants to existing traits in the same proposal. Only include folders
          for traits that have new content.
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
                  'Builder uses folder hierarchy to organize your assets. Upload a single folder containing a subfolder for each trait. Each subfolder should contain every variant for that trait.\n\nYou can mix new traits with new variants for existing traits in the same upload.\n\nMaximum directory size: 200MB\nSupported image types: PNG, SVG, and GIF'
                }
              />

              {showPropertyErrors && !isPropertyCountValid && (
                <Text
                  w="100%"
                  textAlign={'left'}
                  color={'negative'}
                  mt="x4"
                  mb="x2"
                >{`Current total number of traits is ${propertiesCount}. The new folder of traits must have a minimum total of ${propertiesCount}`}</Text>
              )}
              {showPropertyErrors && invalidProperty && (
                <Text
                  w="100%"
                  textAlign={'left'}
                  color={'negative'}
                  mt="x2"
                  mb="x2"
                >{`${invalidProperty.currentLayerName} currently has ${invalidProperty.currentVariantCount} trait variants. New trait for ${invalidProperty.currentLayerName} "${invalidProperty.nextName}" should also have minimum ${invalidProperty.currentVariantCount} trait variants.`}</Text>
              )}
              {showPropertyErrors && invalidPropertyOrder && (
                <Text
                  w="100%"
                  textAlign={'left'}
                  color={'negative'}
                  mt="x2"
                  mb="x2"
                >{`The trait "${invalidPropertyOrder.trait}" in ${invalidPropertyOrder.invalidLayerName} is not in the correct position. It should be in ${invalidPropertyOrder.layerName}.`}</Text>
              )}
              {showPropertyErrors && fileExtensionMismatch && (
                <Text w="100%" textAlign={'left'} color={'negative'} mt="x4" mb="x2">
                  {fileExtensionMismatch}
                </Text>
              )}
              {showPropertyErrors && dimensionMismatch && (
                <Text w="100%" textAlign={'left'} color={'negative'} mt="x2" mb="x4">
                  {dimensionMismatch}
                </Text>
              )}

              {!isTestnetDAO && (
                <Flex align={'center'} justify={'center'} gap={'x4'} mt="x4">
                  <Flex
                    as={'button'}
                    type="button"
                    align={'center'}
                    justify={'center'}
                    className={
                      checkboxStyleVariants[hasConfirmed ? 'confirmed' : 'default']
                    }
                    onClick={() => setHasConfirmed((bool) => !bool)}
                    aria-pressed={hasConfirmed}
                    aria-label="Confirm testnet artwork addition"
                    style={{ borderWidth: 0, padding: 0 }}
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
