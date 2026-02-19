import { useArtworkImages, useArtworkPreview } from '@buildeross/hooks/useArtworkPreview'
import { useArtworkUpload } from '@buildeross/hooks/useArtworkUpload'
import { IPFSUpload } from '@buildeross/types'
import {
  ArtworkPreview,
  ArtworkUpload as UploadComponent,
  LayerOrdering,
} from '@buildeross/ui/Artwork'
import { type FormikProps } from 'formik'
import { motion } from 'framer-motion'
import React, { BaseSyntheticEvent, ReactElement, useCallback, useEffect } from 'react'

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
  } = useFormStore()

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

  useEffect(() => {
    if (
      setUpArtwork.artwork.length >= 0 &&
      setUpArtwork.artwork.length !== orderedLayers.length
    ) {
      setOrderedLayers(setUpArtwork.artwork)
    }
  }, [setUpArtwork.artwork, orderedLayers, setOrderedLayers])

  const showPreview = !!images?.length && !!orderedLayers.length

  const layerOrdering = (
    <LayerOrdering
      images={images}
      orderedLayers={orderedLayers}
      setOrderedLayers={setOrderedLayers}
    />
  )
  return (
    <>
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
            images={images}
            generatedImages={generatedImages}
            orderedLayers={orderedLayers}
          />
        </motion.div>
      )}
    </>
  )
}
