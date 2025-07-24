import { IPFSUpload, useArtworkPreview, useArtworkUpload } from '@buildeross/hooks'
import * as Sentry from '@sentry/nextjs'
import { FormikProps } from 'formik'
import { motion } from 'framer-motion'
import React, {
  BaseSyntheticEvent,
  ChangeEventHandler,
  ReactElement,
  useCallback,
  useEffect,
} from 'react'
import { ArtworkPreview, ArtworkUpload as UploadComponent } from 'src/components/Artwork'
import { LayerOrdering } from 'src/components/Artwork/LayerOrdering'
import { artworkPreviewPanel } from 'src/components/Fields/styles.css'

import { useFormStore } from '../../stores'

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
    },
    [setIpfsUpload, setIsUploadingToIPFS]
  )

  const handleUploadError = useCallback(
    async (err: Error) => {
      setIpfsUpload([])
      setIsUploadingToIPFS(false)
      Sentry.captureException(err)
      await Sentry.flush(2000)
    },
    [setIpfsUpload, setIsUploadingToIPFS]
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
  })

  const { generateStackedImage, generatedImages, canvas } = useArtworkPreview({
    images,
    orderedLayers,
  })

  const handleUpload = (e: BaseSyntheticEvent) => {
    setUploadArtworkError(undefined)
    setFiles(e.currentTarget.files)
    setOrderedLayers([])
  }

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

  useEffect(() => {
    if (!generatedImages.length && !isUploadingToIPFS) {
      generateStackedImage()
    }
  }, [generateStackedImage, generatedImages, isUploadingToIPFS])

  const showPreview = setUpArtwork?.artwork?.length > 0

  const layerOrdering = (
    <LayerOrdering
      images={images}
      artwork={artwork}
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
        errorMessage={errorMessage}
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
          />
        </motion.div>
      )}
    </>
  )
}
