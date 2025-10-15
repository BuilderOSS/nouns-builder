import { useArtworkPreview } from '@buildeross/hooks/useArtworkPreview'
import { useArtworkUpload } from '@buildeross/hooks/useArtworkUpload'
import { IPFSUpload } from '@buildeross/types'
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
} from 'react'

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
  value: any
  inputLabel: string | ReactElement
  onChange: ChangeEventHandler
  onBlur: ChangeEventHandler
  formik?: FormikProps<any>
  errorMessage?: any
  helperText?: string
}

export const ArtworkUpload: React.FC<ArtworkFormProps> = ({
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
  } = useFormStore()

  const { artwork } = setUpArtwork ?? {}

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
      setIpfsUpload([])
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

  const { generateStackedImage, generatedImages, canvas } = useArtworkPreview({
    images,
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

  const showPreview = React.useMemo(
    () => fileInfo && !isUploadingToIPFS && !ipfsUploadError && !uploadArtworkError,
    [isUploadingToIPFS, ipfsUploadError, uploadArtworkError, fileInfo]
  )

  useEffect(() => {
    if (isUploadingToIPFS || !fileInfo) return

    generateStackedImage()
  }, [generateStackedImage, isUploadingToIPFS, fileInfo])

  useEffect(() => {
    if (!artwork || artwork.length === 0 || artwork.length === orderedLayers.length)
      return
    setOrderedLayers(artwork)
  }, [artwork, orderedLayers, setOrderedLayers])

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
        inputLabel={inputLabel}
        fileCount={setUpArtwork?.filesLength}
        traitCount={setUpArtwork?.artwork?.length}
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
