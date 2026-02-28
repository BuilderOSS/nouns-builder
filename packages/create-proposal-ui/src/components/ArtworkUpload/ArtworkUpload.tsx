import { useArtworkImages, useArtworkPreview } from '@buildeross/hooks/useArtworkPreview'
import { useArtworkUpload } from '@buildeross/hooks/useArtworkUpload'
import { useScrollDirection } from '@buildeross/hooks/useScrollDirection'
import type { IPFSUpload, Property, Trait } from '@buildeross/types'
import {
  ArtworkPreview,
  ArtworkUpload as UploadComponent,
  LayerOrdering,
} from '@buildeross/ui/Artwork'
import { transformPropertiesToImageProps } from '@buildeross/utils'
import { motion } from 'framer-motion'
import React, {
  BaseSyntheticEvent,
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
  inputLabel: string | ReactElement
  existingProperties?: Property[]
  errorMessage?: any
  helperText?: string
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
  id,
  existingProperties, // NOTE: only for add artwork, must be undefined for replace artwork
  inputLabel,
  helperText,
  errorMessage,
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
  } = useArtworkStore()
  const scrollDirection = useScrollDirection()

  // Calculate top offset based on header visibility
  // Header is 80px tall and hidden when scrollDirection is 'down'
  const topOffset = scrollDirection === 'down' ? 24 : 104 // 24px + 80px header

  const handleUploadStart = useCallback(() => {
    setSetUpArtwork({ filesLength: 0, artwork: [], fileType: '' })
    setIsUploadingToIPFS(true)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsUploadingToIPFS])

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
      console.error('Error uploading to IPFS', err)
      setIsUploadingToIPFS(false)
      setIpfsUploadProgress(0)
      try {
        const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
        sentry.captureException(err)
        sentry.flush(2000).catch(() => {})
      } catch (_) {}
      return
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

  const { existingImages, existingOrderedLayers } = useMemo(() => {
    if (!existingProperties) return { existingImages: [], existingOrderedLayers: [] }

    const existingImages = transformPropertiesToImageProps(existingProperties)
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
      setOrderedLayers([])
      setFiles(e.currentTarget.files)
    },
    [setOrderedLayers, setFiles]
  )

  // Set up artwork traits into store
  useEffect(() => {
    if (!uploadedArtwork) return

    setSetUpArtwork({
      artwork: uploadedArtwork.traits,
      filesLength: uploadedArtwork.filesLength,
      fileType: uploadedArtwork.fileType,
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedArtwork])

  const showPreview = !!images?.length && !!orderedLayers.length

  useEffect(() => {
    if (setUpArtwork.artwork.length == 0) {
      return
    }
    const mergedOrderedLayers = mergeTraits(setUpArtwork.artwork, existingOrderedLayers)
    if (orderedLayers?.length === mergedOrderedLayers?.length) return
    setOrderedLayers(mergedOrderedLayers)
  }, [setUpArtwork.artwork, existingOrderedLayers, orderedLayers, setOrderedLayers])

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
          key={'preview-panel'}
          variants={previewVariants}
          initial={'closed'}
          animate={'open'}
          className={artworkPreviewPanel}
        >
          <div
            style={{
              position: 'sticky',
              top: `${topOffset}px`,
              transition: 'top 150ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <ArtworkPreview
              canvas={canvas}
              generateStackedImage={generateStackedImage}
              images={mergedImages}
              generatedImages={generatedImages}
              orderedLayers={orderedLayers}
            />
          </div>
        </motion.div>
      )}
    </>
  )
}
