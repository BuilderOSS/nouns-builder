import { useArtworkPreview } from '@buildeross/hooks/useArtworkPreview'
import { useArtworkUpload } from '@buildeross/hooks/useArtworkUpload'
import { getFetchableUrls } from '@buildeross/ipfs-service'
import { type Property } from '@buildeross/sdk/contract'
import { ImageProps, IPFSUpload, Trait } from '@buildeross/types'
import {
  ArtworkPreview,
  ArtworkUpload as UploadComponent,
  LayerOrdering,
} from '@buildeross/ui/Artwork'
import { FormikProps } from 'formik'
import { motion } from 'framer-motion'
import React, {
  BaseSyntheticEvent,
  ChangeEventHandler,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
} from 'react'

import { useArtworkStore } from '../../stores/useArtworkStore'
import { artworkPreviewPanel } from './ArtworkUpload.css'

const previewVariants = {
  closed: {
    right: 0,
    top: 0,
    x: '105%',
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
  value: any
  inputLabel: string | ReactElement
  onChange: ChangeEventHandler
  onBlur: ChangeEventHandler
  existingProperties?: Property[]
  formik?: FormikProps<any>
  errorMessage?: any
  helperText?: string
}

function convertToImageProps(properties: Property[]): ImageProps[] {
  const imageProps: ImageProps[] = []

  for (const property of properties) {
    for (const item of property.items) {
      const match = item.uri.match(/^ipfs:\/\/([^/]+)\/.+$/)
      if (!match || !match[1]) {
        console.error(`Invalid IPFS URI format: ${item.uri}`)
        continue
      }
      const cid = match[1]

      const nameParts = item.uri.split('/')
      const name = nameParts[nameParts.length - 1]
      if (!name) {
        console.error(`Unable to extract name from URI: ${item.uri}`)
        continue
      }

      const urls = getFetchableUrls(item.uri)
      if (!urls || urls.length === 0) {
        console.error(`Unable to get fetchable URLs for: ${item.uri}`)
        continue
      }

      imageProps.push({
        cid,
        name,
        trait: property.name,
        uri: item.uri,
        url: urls[0],
      })
    }
  }

  return imageProps
}

function mergeTraits(a: Trait[], b: Trait[]): Trait[] {
  const traitMap = new Map<string, Set<string>>()

  // Helper to add traits to the map
  function addToMap(traits: Trait[]) {
    for (const { trait, properties } of traits) {
      if (!traitMap.has(trait)) {
        traitMap.set(trait, new Set())
      }
      const propSet = traitMap.get(trait)!
      for (const prop of properties) {
        propSet.add(prop)
      }
    }
  }

  // Add both arrays to the map
  addToMap(a)
  addToMap(b)

  // Convert map back to array
  return Array.from(traitMap.entries()).map(([trait, propSet]) => ({
    trait,
    properties: Array.from(propSet),
  }))
}

export const ArtworkUpload: React.FC<ArtworkFormProps> = ({
  existingProperties, // NOTE: only for add artwork, must be undefined for replace artwork
  inputLabel,
  helperText,
  errorMessage,
  formik,
}) => {
  const {
    ipfsUpload,
    setSetUpArtwork,
    setUpArtwork,
    setIpfsUpload,
    isUploadingToIPFS,
    setIsUploadingToIPFS,
    setIpfsUploadProgress,
    orderedLayers,
    setOrderedLayers,
  } = useArtworkStore()
  const { artwork } = setUpArtwork

  const handleUploadStart = useCallback(() => {
    setIsUploadingToIPFS(true)
  }, [setIsUploadingToIPFS])

  const handleUploadSuccess = useCallback(
    (ipfs: IPFSUpload[]) => {
      setIpfsUpload(ipfs)
      setIsUploadingToIPFS(false)
      setIpfsUploadProgress(0)
    },
    [setIpfsUpload, setIsUploadingToIPFS, setIpfsUploadProgress]
  )

  const handleUploadError = useCallback(
    async (err: Error) => {
      console.error('Error uploading to IPFS', err)
      setIpfsUpload([])
      setIsUploadingToIPFS(false)
      setIpfsUploadProgress(0)
      try {
        const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
        sentry.captureException(err)
        sentry.flush(2000).catch(() => {})
      } catch (_) {}
      return
    },
    [setIpfsUpload, setIsUploadingToIPFS, setIpfsUploadProgress]
  )

  const {
    images,
    fileInfo,
    filesArray,
    ipfsUploadError,
    uploadArtworkError,
    setUploadArtworkError,
    setFiles,
  } = useArtworkUpload({
    artwork,
    ipfsUpload,
    isUploadingToIPFS,
    onUploadStart: handleUploadStart,
    onUploadSuccess: handleUploadSuccess,
    onUploadError: handleUploadError,
    onUploadProgress: setIpfsUploadProgress,
  })

  const { existingImages, existingOrderedLayers } = useMemo(() => {
    if (!existingProperties) return { existingImages: [], existingOrderedLayers: [] }

    const existingImages = convertToImageProps(existingProperties)
    const existingOrderedLayers: Trait[] = existingProperties.map((property) => {
      return {
        trait: property.name,
        properties: property.items.map((item) => item.uri.split('/').pop()) as string[],
      }
    })

    return { existingImages, existingOrderedLayers }
  }, [existingProperties])

  const mergedImages = useMemo(() => {
    return [...existingImages, ...(images ?? [])]
  }, [existingImages, images])

  const { generateStackedImage, generatedImages, canvas } = useArtworkPreview({
    images: mergedImages,
    orderedLayers,
  })

  const handleUpload = useCallback(
    (e: BaseSyntheticEvent) => {
      setUploadArtworkError(undefined)
      setOrderedLayers([])
      setFiles(e.currentTarget.files)
    },
    [setUploadArtworkError, setOrderedLayers, setFiles]
  )

  // Set up artwork traits into store
  useEffect(() => {
    if (!fileInfo || !filesArray || !fileInfo.traits || !formik || uploadArtworkError)
      return

    setSetUpArtwork({
      ...formik.values,
      artwork: fileInfo.traits,
      filesLength: fileInfo.filesLength,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filesArray, fileInfo, uploadArtworkError])

  const showPreview = useMemo(
    () =>
      fileInfo &&
      !isUploadingToIPFS &&
      !ipfsUploadError &&
      !uploadArtworkError &&
      artwork.length > 0,
    [isUploadingToIPFS, ipfsUploadError, uploadArtworkError, fileInfo, artwork]
  )

  useEffect(() => {
    if (isUploadingToIPFS || !fileInfo) return
    generateStackedImage()
  }, [generateStackedImage, isUploadingToIPFS, fileInfo])

  useEffect(() => {
    if (!artwork || artwork.length === 0) {
      return
    }
    const mergedOrderedLayers = mergeTraits(artwork, existingOrderedLayers)
    if (orderedLayers?.length === mergedOrderedLayers?.length) return
    setOrderedLayers(mergedOrderedLayers)
  }, [artwork, existingOrderedLayers, orderedLayers, setOrderedLayers])

  const layerOrdering = (
    <LayerOrdering
      images={mergedImages}
      orderedLayers={orderedLayers}
      setOrderedLayers={setOrderedLayers}
    />
  )

  return (
    <>
      <UploadComponent
        inputLabel={inputLabel}
        fileCount={setUpArtwork.filesLength}
        traitCount={orderedLayers.length}
        helperText={helperText}
        formError={errorMessage}
        onUpload={handleUpload}
        ipfsUploadError={ipfsUploadError}
        uploadArtworkError={uploadArtworkError}
        images={images}
        fileType={fileInfo?.fileType}
        layerOrdering={layerOrdering}
      />
      {showPreview && (
        <motion.div
          key={'preview-panel'}
          variants={previewVariants}
          initial={'closed'}
          animate={'open'}
          className={artworkPreviewPanel}
        >
          <ArtworkPreview
            canvas={canvas}
            generateStackedImage={generateStackedImage}
            images={mergedImages}
            generatedImages={generatedImages}
            orderedLayers={orderedLayers}
          />
        </motion.div>
      )}
    </>
  )
}
