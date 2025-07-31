import { IPFSUpload, useArtworkPreview, useArtworkUpload } from '@buildeross/hooks'
import * as Sentry from '@sentry/nextjs'
import { FormikProps } from 'formik'
import { motion } from 'framer-motion'
import React, {
  BaseSyntheticEvent,
  ChangeEventHandler,
  ReactElement,
  useCallback,
} from 'react'
import { ArtworkPreview, ArtworkUpload as UploadComponent } from 'src/components/Artwork'
import { LayerOrdering } from 'src/components/Artwork/LayerOrdering'
import { useArtworkStore } from 'src/modules/create-proposal/stores/useArtworkStore'

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
  } = useArtworkStore()
  const { artwork } = setUpArtwork

  const handleUploadStart = React.useCallback(() => {
    setIsUploadingToIPFS(true)
  }, [setIsUploadingToIPFS])

  const handleUploadSuccess = React.useCallback(
    (ipfs: IPFSUpload[]) => {
      setIpfsUpload(ipfs)
      setIsUploadingToIPFS(false)
      setIpfsUploadProgress(0)
    },
    [setIpfsUpload, setIsUploadingToIPFS, setIpfsUploadProgress]
  )

  const handleUploadError = React.useCallback(
    async (err: Error) => {
      console.error('Error uploading to IPFS', err)
      setIpfsUpload([])
      setIsUploadingToIPFS(false)
      setIpfsUploadProgress(0)
      Sentry.captureException(err)
      Sentry.flush(2000).catch(() => {})
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
  React.useEffect(() => {
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

  React.useEffect(() => {
    if (isUploadingToIPFS || !fileInfo) return

    generateStackedImage()
  }, [generateStackedImage, isUploadingToIPFS, fileInfo])

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
        fileCount={setUpArtwork.filesLength}
        traitCount={setUpArtwork.artwork.length}
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
            images={images}
            generatedImages={generatedImages}
            orderedLayers={orderedLayers}
          />
        </motion.div>
      )}
    </>
  )
}
