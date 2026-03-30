import { getFetchableUrls } from '@buildeross/ipfs-service'
import { ImageProps, OrderedTraits } from '@buildeross/types'
import { Box, Flex, Icon } from '@buildeross/zord'
import { motion } from 'framer-motion'
import React from 'react'

import {
  artworkSettingsBox,
  artworkSettingsBoxDragging,
  artworkSettingsDragHandle,
  artworkSettingsDragHandleActive,
  artworkSettingsImageThumb,
  artworkSettingsName,
  artworkSettingsPropertyCount,
  artworkSettingsPropertyName,
} from './Artwork.css'

export const getLayerName = (idx: number, layers?: OrderedTraits): string => {
  if (idx === 0) {
    return 'Top layer'
  }

  if (layers && idx === layers.length - 1) {
    return 'Base layer'
  }

  return `Layer #${idx}`
}

interface LayerBoxProps {
  trait: string
  properties: string[]
  ipfs: ImageProps[]
  orderedLayers: OrderedTraits
  index: number
  isDragInProgress: boolean
  isDragging: boolean
  onDragHandlePointerDown: (
    event: React.PointerEvent<HTMLButtonElement>,
    index: number
  ) => void
  setRowRef?: (index: number, node: HTMLDivElement | null) => void
}

const propertiesVariants = {
  initial: {
    height: 0,
    overflow: 'hidden',
  },
  open: {
    height: 'auto',
    overflow: 'auto',
  },
}

export const LayerBox: React.FC<LayerBoxProps> = ({
  trait,
  properties,
  ipfs,
  orderedLayers,
  index,
  isDragInProgress,
  isDragging,
  onDragHandlePointerDown,
  setRowRef,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    if (isDragInProgress) {
      setIsOpen(false)
    }
  }, [isDragInProgress])

  const handleToggle = React.useCallback(() => {
    if (isDragInProgress) return
    setIsOpen((bool) => !bool)
  }, [isDragInProgress])

  const handleRowRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      setRowRef?.(index, node)
    },
    [index, setRowRef]
  )

  const handleDragHandlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      onDragHandlePointerDown(event, index)
    },
    [index, onDragHandlePointerDown]
  )

  const handleDragHandleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      event.stopPropagation()
    },
    []
  )

  return (
    <Flex
      ref={handleRowRef}
      direction="column"
      key={trait}
      p="x4"
      mb="x5"
      className={[
        artworkSettingsBox,
        isDragging ? artworkSettingsBoxDragging : undefined,
      ]}
    >
      <Flex
        fontSize={18}
        justify="space-between"
        align="center"
        className={artworkSettingsName}
        onClick={handleToggle}
      >
        <Flex align="center">
          <Box mr="x2">{`${trait} (${properties?.length} variants)`}</Box>
          {isOpen ? <Icon id="chevronUp" /> : <Icon id="chevronDown" />}
        </Flex>
        <Flex
          as="button"
          type="button"
          align="center"
          fontSize={12}
          className={[
            artworkSettingsDragHandle,
            isDragInProgress ? artworkSettingsDragHandleActive : undefined,
          ]}
          onPointerDown={handleDragHandlePointerDown}
          onClick={handleDragHandleClick}
          style={{
            cursor: isDragInProgress ? 'grabbing' : 'grab',
            background: 'transparent',
            border: 0,
            padding: 0,
          }}
          aria-label={`Drag to reorder ${trait}`}
        >
          <Box mr="x4">{getLayerName(index, orderedLayers)}</Box>
          <Icon id="move" />
        </Flex>
      </Flex>
      <motion.div
        variants={propertiesVariants}
        initial="initial"
        animate={isOpen ? 'open' : 'initial'}
        style={{ maxHeight: '500px' }}
      >
        {properties?.map((property) => {
          const propertyIndex = ipfs?.map((image) => image.name).indexOf(property)
          const image = ipfs?.[propertyIndex]?.uri
          const src = getFetchableUrls(image)?.[0]
          return (
            <Flex gap="x2" key={property} justify="center" align="center">
              <Flex align="center" fontSize={14} className={artworkSettingsPropertyName}>
                {property}
              </Flex>
              <Flex
                align="center"
                justify="center"
                className={artworkSettingsPropertyCount}
              >
                {src ? (
                  <img
                    src={src}
                    className={artworkSettingsImageThumb}
                    alt={`${property} thumbnail image`}
                  />
                ) : null}
              </Flex>
            </Flex>
          )
        })}
      </motion.div>
    </Flex>
  )
}
