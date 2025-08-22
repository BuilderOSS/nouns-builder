import { ImageProps, OrderedTraits } from '@buildeross/hooks'
import { Box, Flex, Icon } from '@buildeross/zord'
import { motion } from 'framer-motion'
import React from 'react'
import {
  artworkSettingsBox,
  artworkSettingsBoxDropping,
  artworkSettingsImageThumb,
  artworkSettingsName,
  artworkSettingsNameDropping,
  artworkSettingsPropertyCount,
  artworkSettingsPropertyName,
} from 'src/styles/Artwork.css'

export const getLayerName = (idx: number, layers?: OrderedTraits): string => {
  if (idx === 0) {
    return 'Top layer'
  }

  if (layers && idx === layers.length - 1) {
    return 'Base layer'
  }

  return `Layer #${idx}`
}

export interface DragAndDropProps {
  draggedFrom?: number
  draggedTo?: number | null
  isDragging?: boolean
  originalOrder?: OrderedTraits
  updatedOrder?: OrderedTraits
}

interface LayerBoxProps {
  trait: string
  properties: string[]
  ipfs: ImageProps[]
  setDragAndDrop: (props: DragAndDropProps) => void
  dragAndDrop: DragAndDropProps | null
  orderedLayers: OrderedTraits
  setOrderedLayers: (orderedLayers: OrderedTraits) => void
  index: number
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
  setDragAndDrop,
  dragAndDrop,
  orderedLayers,
  setOrderedLayers,
  index,
}) => {
  /*  toggle property animation  */
  const [isOpen, setIsOpen] = React.useState(false)

  /* Handle Drag and Drop to Reorder Properties */
  const onDragStart = React.useCallback(
    (e: any) => {
      const initialPosition = Number(e.currentTarget.dataset.position)
      setDragAndDrop({
        ...dragAndDrop,

        draggedFrom: initialPosition,
        isDragging: true,
        originalOrder: orderedLayers,
      })

      /*  firefox compatibility */
      e.dataTransfer.setData('text/html', '')
    },
    [dragAndDrop, orderedLayers, setDragAndDrop]
  )

  const onDragOver = React.useCallback(
    (e: any) => {
      e.preventDefault()

      let updatedOrder = orderedLayers

      const draggedFrom = dragAndDrop?.draggedFrom
      if (!draggedFrom && draggedFrom !== 0) return

      const draggedTo = Number(e.currentTarget.dataset.position)

      const itemDragged = updatedOrder[draggedFrom]

      const remainingItems = updatedOrder.filter(
        (item) => updatedOrder.indexOf(item) !== draggedFrom
      )

      updatedOrder = [
        ...remainingItems.slice(0, draggedTo),
        itemDragged,
        ...remainingItems.slice(draggedTo),
      ]

      if (draggedTo !== dragAndDrop?.draggedTo) {
        setDragAndDrop({
          ...dragAndDrop,
          updatedOrder,
          draggedTo,
        })
      }
    },
    [dragAndDrop, orderedLayers, setDragAndDrop]
  )

  const onDrop = React.useCallback(() => {
    if (!dragAndDrop?.updatedOrder) return
    setOrderedLayers(dragAndDrop.updatedOrder)

    setDragAndDrop({
      ...dragAndDrop,
      draggedFrom: 0,
      draggedTo: null,
      isDragging: false,
    })
  }, [dragAndDrop, setOrderedLayers, setDragAndDrop])

  /*  listen for if section is being dropped in drop area */
  const isDropping = React.useMemo(() => {
    return dragAndDrop && dragAndDrop.draggedTo === Number(index)
  }, [dragAndDrop, index])

  /*  close section if is dragging */
  React.useEffect(() => {
    if (dragAndDrop?.isDragging) {
      setIsOpen(false)
    }
  }, [dragAndDrop])

  const handleToggle = React.useCallback(() => {
    setIsOpen((bool) => !bool)
  }, [])

  return (
    <Flex
      direction={'column'}
      key={trait}
      p={'x4'}
      mb={'x5'}
      className={isDropping ? artworkSettingsBoxDropping : artworkSettingsBox}
      draggable={true}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      data-position={index}
    >
      <Flex
        fontSize={18}
        justify={isDropping ? 'center' : 'space-between'}
        align={'center'}
        className={isDropping ? artworkSettingsNameDropping : artworkSettingsName}
        onClick={handleToggle}
      >
        <Flex align={'center'}>
          <Box mr={'x2'}>
            {isDropping
              ? `Drag Here - Set as ${getLayerName(index, orderedLayers)}`
              : `${trait} (${properties?.length} variants)`}
          </Box>
          {!isDropping ? (
            isOpen ? (
              <Icon id="chevronUp" />
            ) : (
              <Icon id="chevronDown" />
            )
          ) : null}
        </Flex>
        {!isDropping && (
          <Flex align={'center'} fontSize={12}>
            <Box mr={'x4'}>{getLayerName(index, orderedLayers)}</Box>
            <Icon id="move" />
          </Flex>
        )}
      </Flex>
      <motion.div
        variants={propertiesVariants}
        initial={'initial'}
        animate={isOpen ? 'open' : 'initial'}
        style={{ maxHeight: '500px' }}
      >
        {properties?.map((property) => {
          const index = ipfs?.map((e) => e.name).indexOf(property)
          const image = ipfs?.[index]?.cid
          const src = ipfs?.[index]?.url
          return (
            <Flex gap={'x2'} key={property} justify={'center'} align={'center'}>
              <Flex
                align={'center'}
                fontSize={14}
                className={artworkSettingsPropertyName}
              >
                {property}
              </Flex>
              <Flex
                align={'center'}
                justify={'center'}
                className={artworkSettingsPropertyCount}
              >
                {ipfs && image && (
                  <img
                    src={src}
                    className={artworkSettingsImageThumb}
                    alt={`${property} thumbnail image`}
                  />
                )}
              </Flex>
            </Flex>
          )
        })}
      </motion.div>
    </Flex>
  )
}
