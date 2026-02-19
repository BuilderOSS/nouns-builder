import type { ImageProps, OrderedTraits } from '@buildeross/types'
import { LayerOrdering } from '@buildeross/ui/Artwork'
import { Playground } from '@buildeross/ui/Playground'
import { Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import React, { BaseSyntheticEvent, useCallback, useEffect, useState } from 'react'

const processArtworkFiles = (
  files: FileList
): {
  images: ImageProps[]
  orderedLayers: OrderedTraits
} | null => {
  const filesArray = Array.from(files).filter((file) => file.name !== '.DS_Store')
  const acceptableMIME = ['image/png', 'image/svg+xml']

  // Validate file types
  const invalidFiles = filesArray.filter((file) => !acceptableMIME.includes(file.type))
  if (invalidFiles.length > 0) {
    throw new Error('Only PNG and SVG files are supported')
  }

  // Parse folder structure
  const traits: { trait: string; properties: string[] }[] = []
  const images: ImageProps[] = []

  filesArray.forEach((file) => {
    const path = file.webkitRelativePath
    const pathParts = path.split('/')

    // Expecting structure: rootFolder/traitFolder/itemFile.png
    if (pathParts.length < 3) return

    const traitName = pathParts[pathParts.length - 2]
    const itemName = pathParts[pathParts.length - 1].replace(/\.(png|svg)$/i, '')

    // Find or create trait
    let trait = traits.find((t) => t.trait === traitName)
    if (!trait) {
      trait = { trait: traitName, properties: [] }
      traits.push(trait)
    }

    if (!trait.properties.includes(itemName)) {
      trait.properties.push(itemName)
    }

    const existingImage = images.find(
      (img) => img.trait === traitName && img.name === itemName
    )
    if (existingImage) return // Skip duplicate

    // Create image object with blob URL for preview and File object for processing
    const blobUrl = URL.createObjectURL(file)
    images.push({
      trait: traitName,
      name: itemName,
      uri: blobUrl,
      content: file,
    })
  })

  if (traits.length === 0 || images.length === 0) {
    throw new Error(
      'No valid artwork found. Please upload a folder containing subfolders for each trait.'
    )
  }

  return {
    images,
    orderedLayers: traits.reverse(),
  }
}

export const CustomArtworkUpload: React.FC = () => {
  const [images, setImages] = useState<ImageProps[]>([])
  const [orderedLayers, setOrderedLayers] = useState<OrderedTraits>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleUpload = useCallback((e: BaseSyntheticEvent) => {
    setError(null)
    const files = e.target.files as FileList

    if (!files || files.length === 0) {
      setError('No files selected')
      return
    }

    try {
      const result = processArtworkFiles(files)
      if (result) {
        setImages(result.images)
        setOrderedLayers(result.orderedLayers)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process artwork')
      setImages([])
      setOrderedLayers([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [])

  const handleClear = useCallback(() => {
    setImages([])
    setOrderedLayers([])
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.uri.startsWith('blob:')) {
          URL.revokeObjectURL(img.uri)
        }
      })
    }
  }, [images])

  if (images.length > 0 && orderedLayers.length > 0) {
    return (
      <Flex
        direction="column"
        w="100%"
        gap="x8"
        py="x6"
        style={{ minHeight: 'calc(100vh - 250px)', maxWidth: '880px', margin: '0 auto' }}
      >
        <Flex justify={{ '@initial': 'center', '@768': 'flex-end' }}>
          <Button variant="secondary" onClick={handleClear}>
            Clear Artwork
          </Button>
        </Flex>
        <Stack gap="x8">
          <Flex
            direction="column"
            align="stretch"
            width="100%"
            p={'x6'}
            borderColor={'border'}
            borderStyle={'solid'}
            borderRadius={'curved'}
            borderWidth={'normal'}
          >
            <LayerOrdering
              title="Layer Order"
              images={images}
              orderedLayers={orderedLayers}
              setOrderedLayers={setOrderedLayers}
            />
          </Flex>
          <Flex
            direction="column"
            align="stretch"
            width="100%"
            p={'x6'}
            borderColor={'border'}
            borderStyle={'solid'}
            borderRadius={'curved'}
            borderWidth={'normal'}
          >
            <Playground images={images} orderedLayers={orderedLayers} />
          </Flex>
        </Stack>
      </Flex>
    )
  }

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap="x6"
      py="x6"
      style={{ minHeight: 'calc(100vh - 250px)', maxWidth: '880px', margin: '0 auto' }}
    >
      <Flex
        direction="column"
        align="center"
        width="100%"
        px={'x6'}
        py={'x12'}
        gap="x6"
        borderColor={'border'}
        borderStyle={'solid'}
        borderRadius={'curved'}
        borderWidth={'normal'}
      >
        <Stack align="center" gap="x4">
          <Text fontSize={28} fontWeight="display">
            Upload Custom Artwork
          </Text>
          <Text color="text3" align="center" style={{ maxWidth: '600px' }}>
            Upload a folder containing subfolders for each trait. Each subfolder should
            contain every variant for that trait.
          </Text>
          <Text color="text3" size="sm">
            Supported formats: PNG and SVG
          </Text>
        </Stack>

        <input
          ref={fileInputRef}
          type="file"
          id="artwork-upload"
          // @ts-ignore - webkitdirectory is not in the types but is supported
          webkitdirectory=""
          directory=""
          multiple
          accept="image/png,image/svg+xml"
          onChange={handleUpload}
          style={{ display: 'none' }}
        />

        <Button
          as="label"
          htmlFor="artwork-upload"
          style={{ cursor: 'pointer', borderRadius: '16px' }}
          size="lg"
        >
          Choose Folder
        </Button>

        {error && (
          <Stack align="center" gap="x2">
            <Text color="negative">{error}</Text>
          </Stack>
        )}

        <Flex
          align="center"
          as="a"
          href="/nouns.zip"
          download
          style={{ textDecoration: 'none' }}
        >
          <Icon id="download" mr="x2" />
          <Text>Download Sample Folder</Text>
        </Flex>
      </Flex>
    </Flex>
  )
}
