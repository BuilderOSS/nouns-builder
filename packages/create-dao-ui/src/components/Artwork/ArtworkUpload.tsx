import { PUBLIC_IS_TESTNET } from '@buildeross/constants/chains'
import { useDaoArtworkData, useUserDaos } from '@buildeross/hooks'
import { useArtworkImages, useArtworkPreview } from '@buildeross/hooks/useArtworkPreview'
import { useArtworkUpload } from '@buildeross/hooks/useArtworkUpload'
import { type AddressType, IPFSUpload, type Property } from '@buildeross/types'
import { type DaoListItem, SingleDaoSelector } from '@buildeross/ui'
import {
  ArtworkPreview,
  ArtworkUpload as UploadComponent,
  LayerOrdering,
} from '@buildeross/ui/Artwork'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import { type FormikProps } from 'formik'
import { motion } from 'framer-motion'
import React, {
  BaseSyntheticEvent,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import { useAccount } from 'wagmi'

import { useFormStore } from '../../stores'
import { artworkPreviewPanel } from './ArtworkUpload.css'

const previewVariants = {
  closed: {
    left: 0,
    top: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    x: '-105%',
    opacity: 0,
    transition: {
      animate: 'easeInOut',
    },
  },
  open: {
    x: 0,
    opacity: 1,
    transition: {
      animate: 'easeInOut',
      duration: 0.5,
    },
  },
}

interface ArtworkFormProps {
  id: string
  inputLabel: string | ReactElement
  formik?: FormikProps<any>
  errorMessage?: any
  helperText?: string
}

export const ArtworkUpload: React.FC<ArtworkFormProps> = ({
  id,
  inputLabel,
  helperText,
  errorMessage,
  formik,
}) => {
  const {
    setUpArtwork,
    setSetUpArtwork,
    setIsUploadingToIPFS,
    ipfsUpload,
    setIpfsUpload,
    orderedLayers,
    setOrderedLayers,
    setIpfsUploadProgress,
    artworkSource,
    setArtworkSource,
  } = useFormStore()
  const { address } = useAccount()
  const [selectedDao, setSelectedDao] = React.useState<DaoListItem | undefined>()

  const { daos: userDaos } = useUserDaos({
    address: address as AddressType,
    enabled: !!address,
  })

  const {
    properties,
    images: daoImages,
    orderedLayers: daoOrderedLayers,
    error: daoError,
  } = useDaoArtworkData({
    chainId: selectedDao?.chainId,
    metadataAddress: selectedDao?.addresses.metadata,
  })

  const userDaoAddressSet = useMemo(
    () => new Set(userDaos.map((dao) => dao.collectionAddress.toLowerCase())),
    [userDaos]
  )

  const isDaoRestricted = useCallback(
    (dao: DaoListItem) =>
      !PUBLIC_IS_TESTNET && !userDaoAddressSet.has(dao.address.toLowerCase()),
    [userDaoAddressSet]
  )

  const getDaoRestrictionReason = useCallback(
    (dao: DaoListItem) =>
      isDaoRestricted(dao)
        ? 'You can only reuse artwork from DAOs you belong to on mainnet.'
        : undefined,
    [isDaoRestricted]
  )

  const handleUploadStart = useCallback(() => {
    if (!formik) return
    setSetUpArtwork({ ...formik.values, filesLength: 0, artwork: [], fileType: '' })
    setIsUploadingToIPFS(true)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsUploadingToIPFS, formik])

  const handleUploadSuccess = useCallback(
    (ipfs: IPFSUpload[]) => {
      setIpfsUpload(ipfs)
      setIsUploadingToIPFS(false)
      setIpfsUploadProgress(0)
    },
    [setIsUploadingToIPFS, setIpfsUploadProgress, setIpfsUpload]
  )

  const handleUploadError = useCallback(
    async (err: Error) => {
      setIsUploadingToIPFS(false)
      setIpfsUploadProgress(0)
      try {
        const sentry = await import('@sentry/nextjs').catch(() => null)
        if (sentry) {
          sentry.captureException(err)
          await sentry.flush(2000)
        }
      } catch (_) {}
    },
    [setIsUploadingToIPFS, setIpfsUploadProgress]
  )

  const {
    artwork: uploadedArtwork,
    uploadError,
    artworkError,
    setFiles,
  } = useArtworkUpload({
    onUploadStart: handleUploadStart,
    onUploadSuccess: handleUploadSuccess,
    onUploadError: handleUploadError,
    onUploadProgress: setIpfsUploadProgress,
  })

  const images = useArtworkImages({
    ipfsUpload,
    traits: setUpArtwork.artwork,
  })

  const { generateStackedImage, generatedImages, canvas } = useArtworkPreview({
    images,
    orderedLayers,
  })

  const handleUpload = useCallback(
    (e: BaseSyntheticEvent) => {
      setOrderedLayers([])
      setFiles(e.currentTarget.files)
    },
    [setOrderedLayers, setFiles]
  )

  const resetArtworkState = useCallback(() => {
    if (!formik) return
    setIpfsUpload([])
    setOrderedLayers([])
    setSetUpArtwork({ ...formik.values, filesLength: 0, artwork: [], fileType: '' })
  }, [formik, setIpfsUpload, setOrderedLayers, setSetUpArtwork])

  const switchSource = useCallback(
    (source: 'upload' | 'dao') => {
      setArtworkSource(source)
      setSelectedDao(undefined)
      resetArtworkState()
    },
    [setArtworkSource, resetArtworkState]
  )

  // Set up artwork traits into store
  useEffect(() => {
    if (!uploadedArtwork || !formik) return

    setSetUpArtwork({
      ...formik.values,
      artwork: uploadedArtwork.traits,
      filesLength: uploadedArtwork.filesLength,
      fileType: uploadedArtwork.fileType,
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedArtwork])

  const normalizeToCid = (uri: string): string | null => {
    const match = uri.match(/^ipfs:\/\/([^/]+)/)
    return match?.[1] || null
  }

  const getFileTypeFromUri = (uri: string): string => {
    const lower = uri.toLowerCase()
    if (lower.endsWith('.svg')) return 'image/svg+xml'
    return 'image/png'
  }

  useEffect(() => {
    if (artworkSource !== 'dao') return
    if (!selectedDao || !properties?.length) return
    if (isDaoRestricted(selectedDao)) return

    const daoIpfsUploads: IPFSUpload[] = []

    properties.forEach((property: Property) => {
      property.items.forEach((item) => {
        const cid = normalizeToCid(item.uri)
        if (!cid) return
        daoIpfsUploads.push({
          name: item.name,
          trait: property.name,
          webkitRelativePath: `${property.name}/${item.name}`,
          type: getFileTypeFromUri(item.uri),
          ipfs: {
            cid,
            uri: `ipfs://${cid}`,
          },
        })
      })
    })

    const fileType = daoIpfsUploads[0]?.type || ''

    setIpfsUpload(daoIpfsUploads)
    setOrderedLayers(daoOrderedLayers || [])
    setSetUpArtwork({
      ...formik?.values,
      artwork: daoOrderedLayers || [],
      filesLength: daoIpfsUploads.length,
      fileType,
    })
  }, [
    artworkSource,
    selectedDao,
    properties,
    daoOrderedLayers,
    setIpfsUpload,
    setOrderedLayers,
    setSetUpArtwork,
    formik?.values,
    isDaoRestricted,
  ])

  useEffect(() => {
    if (
      setUpArtwork.artwork.length >= 0 &&
      setUpArtwork.artwork.length !== orderedLayers.length
    ) {
      setOrderedLayers(setUpArtwork.artwork)
    }
  }, [setUpArtwork.artwork, orderedLayers, setOrderedLayers])

  const activeImages = artworkSource === 'dao' ? daoImages : images
  const showPreview = !!activeImages?.length && !!orderedLayers.length

  const layerOrdering = (
    <LayerOrdering
      images={activeImages}
      orderedLayers={orderedLayers}
      setOrderedLayers={setOrderedLayers}
    />
  )
  return (
    <>
      <Stack gap="x4" mb="x4">
        <Text fontSize={14} fontWeight="label">
          Artwork Source
        </Text>
        <Flex gap="x2">
          <Button
            type="button"
            variant={artworkSource === 'upload' ? 'primary' : 'secondary'}
            onClick={() => switchSource('upload')}
          >
            Upload Folder
          </Button>
          <Button
            type="button"
            variant={artworkSource === 'dao' ? 'primary' : 'secondary'}
            onClick={() => switchSource('dao')}
          >
            Use DAO Artwork
          </Button>
        </Flex>
      </Stack>

      {artworkSource === 'upload' ? (
        <UploadComponent
          id={id}
          inputLabel={inputLabel}
          fileCount={setUpArtwork.filesLength}
          traitCount={setUpArtwork.artwork.length}
          helperText={helperText}
          formError={errorMessage}
          onUpload={handleUpload}
          uploadError={uploadError}
          artworkError={artworkError}
          fileType={setUpArtwork.fileType}
          layerOrdering={layerOrdering}
        />
      ) : (
        <Stack gap="x4">
          <Text color="text3" size="sm">
            {PUBLIC_IS_TESTNET
              ? 'Any DAO artwork can be reused on testnet.'
              : 'On mainnet, DAO artwork is visible but disabled unless you are a member.'}
          </Text>
          <Box
            p={'x4'}
            borderColor={'border'}
            borderStyle={'solid'}
            borderWidth={'normal'}
            borderRadius={'curved'}
          >
            <SingleDaoSelector
              selectedDaoAddress={selectedDao?.address}
              onSelectedDaoChange={setSelectedDao}
              userAddress={address as AddressType}
              showSearch
              isDaoDisabled={isDaoRestricted}
              getDisabledReason={getDaoRestrictionReason}
            />
          </Box>
          {daoError && (
            <Text color="negative" size="sm">
              Failed to load artwork for selected DAO.
            </Text>
          )}
          {!!selectedDao && !isDaoRestricted(selectedDao) && layerOrdering}
        </Stack>
      )}
      {showPreview && (
        <motion.div
          key="preview-panel"
          variants={previewVariants}
          initial="closed"
          animate="open"
          className={artworkPreviewPanel}
        >
          <ArtworkPreview
            canvas={canvas}
            generateStackedImage={generateStackedImage}
            images={activeImages}
            generatedImages={generatedImages}
            orderedLayers={orderedLayers}
          />
        </motion.div>
      )}
    </>
  )
}
