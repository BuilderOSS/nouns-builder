import { ImageProps, OrderedTraits } from '@buildeross/types'
import { Box, Text } from '@buildeross/zord'
import React from 'react'
import { createPortal } from 'react-dom'

import {
  artworkSettingsBox,
  artworkSettingsDropLabel,
  artworkSettingsDropSpacer,
  artworkSettingsDropSpacerActive,
  previewHeadingStyle,
} from './Artwork.css'
import { getLayerName, LayerBox } from './LayerBox'

type DragOverlayState = {
  width: number
  x: number
  y: number
}

type DragMeta = {
  fromIndex: number
  pointerId: number
  pointerOffsetY: number
}

type RowMetric = {
  index: number
  midpoint: number
}

interface LayerOrderingProps {
  title?: string
  images?: ImageProps[]
  orderedLayers: OrderedTraits
  setOrderedLayers: (orderedLayers: OrderedTraits) => void
}

const getScrollableAncestor = (node: HTMLElement): HTMLElement | Window => {
  let currentNode = node.parentElement

  while (currentNode) {
    const { overflowY } = window.getComputedStyle(currentNode)
    const canScroll =
      (overflowY === 'auto' || overflowY === 'scroll') &&
      currentNode.scrollHeight > currentNode.clientHeight

    if (canScroll) {
      return currentNode
    }

    currentNode = currentNode.parentElement
  }

  return window
}

const moveLayerToIndex = (
  layers: OrderedTraits,
  fromIndex: number,
  insertIndex: number
): OrderedTraits => {
  if (
    fromIndex < 0 ||
    insertIndex < 0 ||
    fromIndex >= layers.length ||
    insertIndex > layers.length
  ) {
    return layers
  }

  const adjustedInsertIndex = insertIndex > fromIndex ? insertIndex - 1 : insertIndex
  if (adjustedInsertIndex === fromIndex) return layers

  const nextLayers = [...layers]
  const [movedLayer] = nextLayers.splice(fromIndex, 1)
  nextLayers.splice(adjustedInsertIndex, 0, movedLayer)
  return nextLayers
}

const getDropLabel = (insertIndex: number, fromIndex: number, layers: OrderedTraits) => {
  const adjustedInsertIndex = insertIndex > fromIndex ? insertIndex - 1 : insertIndex
  const clampedIndex = Math.max(0, Math.min(layers.length - 1, adjustedInsertIndex))
  return `Drop here - set as ${getLayerName(clampedIndex, layers)}`
}

export const LayerOrdering: React.FC<LayerOrderingProps> = ({
  title,
  images,
  orderedLayers,
  setOrderedLayers,
}) => {
  const [activeDragIndex, setActiveDragIndex] = React.useState<number | null>(null)
  const [dragInsertIndex, setDragInsertIndex] = React.useState<number | null>(null)
  const [dragOverlay, setDragOverlay] = React.useState<DragOverlayState | null>(null)

  const listRef = React.useRef<HTMLDivElement | null>(null)
  const overlayRef = React.useRef<HTMLDivElement | null>(null)
  const rowRefs = React.useRef<Record<number, HTMLDivElement | null>>({})
  const dragMetaRef = React.useRef<DragMeta | null>(null)
  const latestPointerYRef = React.useRef(0)
  const rafRef = React.useRef<number | null>(null)
  const autoScrollRafRef = React.useRef<number | null>(null)
  const rowMetricsRef = React.useRef<RowMetric[]>([])
  const scrollContainerRef = React.useRef<HTMLElement | Window | null>(null)
  const orderedLayersRef = React.useRef(orderedLayers)

  const draggedLayer = React.useMemo(() => {
    if (activeDragIndex === null) return null
    return orderedLayers[activeDragIndex] || null
  }, [activeDragIndex, orderedLayers])

  React.useEffect(() => {
    orderedLayersRef.current = orderedLayers
  }, [orderedLayers])

  React.useEffect(() => {
    if (!dragOverlay || !dragMetaRef.current) {
      document.body.style.userSelect = ''
      document.body.style.touchAction = ''
      document.body.style.removeProperty('cursor')
      document.documentElement.style.removeProperty('cursor')
      document.documentElement.style.overscrollBehavior = ''
      return
    }

    document.body.style.userSelect = 'none'
    document.body.style.touchAction = 'none'
    document.body.style.setProperty('cursor', 'grabbing', 'important')
    document.documentElement.style.setProperty('cursor', 'grabbing', 'important')
    document.documentElement.style.overscrollBehavior = 'none'

    const computeRowMetrics = () => {
      rowMetricsRef.current = orderedLayersRef.current
        .map((_, index) => {
          const row = rowRefs.current[index]
          if (!row) return null
          const rect = row.getBoundingClientRect()
          return {
            index,
            midpoint: rect.top + rect.height / 2,
          }
        })
        .filter((metric): metric is RowMetric => metric !== null)
    }

    const getInsertIndexForPointer = (pointerY: number, fromIndex: number) => {
      for (let index = 0; index < rowMetricsRef.current.length; index++) {
        const rowMetric = rowMetricsRef.current[index]
        if (rowMetric.index === fromIndex) continue

        if (pointerY < rowMetric.midpoint) {
          return rowMetric.index
        }
      }

      if (rowMetricsRef.current.length === 0) {
        return 0
      }

      return rowMetricsRef.current[rowMetricsRef.current.length - 1].index + 1
    }

    computeRowMetrics()

    const flushDragFrame = () => {
      rafRef.current = null

      const dragMeta = dragMetaRef.current
      const overlay = overlayRef.current
      if (!dragMeta || !overlay) return

      const nextTop = latestPointerYRef.current - dragMeta.pointerOffsetY
      overlay.style.transform = `translate3d(${dragOverlay.x}px, ${nextTop}px, 0)`

      const nextInsertIndex = getInsertIndexForPointer(
        latestPointerYRef.current,
        dragMeta.fromIndex
      )
      setDragInsertIndex((current) =>
        current === nextInsertIndex ? current : nextInsertIndex
      )
    }

    const runAutoScrollFrame = () => {
      autoScrollRafRef.current = null

      const scrollContainer = scrollContainerRef.current
      if (!scrollContainer) return

      const threshold = 56
      const maxSpeed = 14
      let delta = 0
      const listRect = listRef.current?.getBoundingClientRect()

      if (scrollContainer === window) {
        const boundsTop = listRect ? Math.max(listRect.top, 0) : 0
        const boundsBottom = listRect
          ? Math.min(listRect.bottom, window.innerHeight)
          : window.innerHeight
        const topDistance = latestPointerYRef.current - boundsTop
        const bottomDistance = boundsBottom - latestPointerYRef.current

        if (topDistance < threshold) {
          delta = -Math.min(maxSpeed, ((threshold - topDistance) / threshold) * maxSpeed)
        } else if (bottomDistance < threshold) {
          delta = Math.min(
            maxSpeed,
            ((threshold - bottomDistance) / threshold) * maxSpeed
          )
        }

        if (delta !== 0) {
          window.scrollBy(0, delta)
        }
      } else {
        const element = scrollContainer as HTMLElement
        const rect = element.getBoundingClientRect()
        const boundsTop = listRect ? Math.max(rect.top, listRect.top) : rect.top
        const boundsBottom = listRect
          ? Math.min(rect.bottom, listRect.bottom)
          : rect.bottom
        const topDistance = latestPointerYRef.current - boundsTop
        const bottomDistance = boundsBottom - latestPointerYRef.current

        if (topDistance < threshold) {
          delta = -Math.min(maxSpeed, ((threshold - topDistance) / threshold) * maxSpeed)
        } else if (bottomDistance < threshold) {
          delta = Math.min(
            maxSpeed,
            ((threshold - bottomDistance) / threshold) * maxSpeed
          )
        }

        if (delta !== 0) {
          element.scrollTop += delta
        }
      }

      if (delta !== 0) {
        computeRowMetrics()

        if (rafRef.current === null) {
          rafRef.current = window.requestAnimationFrame(flushDragFrame)
        }

        autoScrollRafRef.current = window.requestAnimationFrame(runAutoScrollFrame)
      }
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== dragMetaRef.current?.pointerId) return
      latestPointerYRef.current = event.clientY

      if (rafRef.current === null) {
        rafRef.current = window.requestAnimationFrame(flushDragFrame)
      }

      if (autoScrollRafRef.current === null) {
        autoScrollRafRef.current = window.requestAnimationFrame(runAutoScrollFrame)
      }
    }

    const handleViewportChange = () => {
      computeRowMetrics()
    }

    const finishDrag = () => {
      const dragMeta = dragMetaRef.current
      if (!dragMeta) return

      computeRowMetrics()
      const insertIndex = getInsertIndexForPointer(
        latestPointerYRef.current,
        dragMeta.fromIndex
      )

      if (insertIndex >= 0) {
        setOrderedLayers(
          moveLayerToIndex(orderedLayersRef.current, dragMeta.fromIndex, insertIndex)
        )
      }

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      if (autoScrollRafRef.current !== null) {
        window.cancelAnimationFrame(autoScrollRafRef.current)
        autoScrollRafRef.current = null
      }

      dragMetaRef.current = null
      scrollContainerRef.current = null
      setActiveDragIndex(null)
      setDragInsertIndex(null)
      setDragOverlay(null)
    }

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerId !== dragMetaRef.current?.pointerId) return
      finishDrag()
    }

    const handlePointerCancel = (event: PointerEvent) => {
      if (event.pointerId !== dragMetaRef.current?.pointerId) return
      finishDrag()
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (!dragMetaRef.current || !event.cancelable) return
      event.preventDefault()
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerCancel)
    window.addEventListener('scroll', handleViewportChange, true)
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      document.body.style.userSelect = ''
      document.body.style.touchAction = ''
      document.body.style.removeProperty('cursor')
      document.documentElement.style.removeProperty('cursor')
      document.documentElement.style.overscrollBehavior = ''
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      if (autoScrollRafRef.current !== null) {
        window.cancelAnimationFrame(autoScrollRafRef.current)
        autoScrollRafRef.current = null
      }
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerCancel)
      window.removeEventListener('scroll', handleViewportChange, true)
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [dragOverlay, setOrderedLayers])

  const handleDragHandlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>, index: number) => {
      if (!event.isPrimary) return
      if (event.pointerType === 'mouse' && event.button !== 0) return

      const rowNode = rowRefs.current[index]
      if (!rowNode) return

      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      const rect = rowNode.getBoundingClientRect()
      latestPointerYRef.current = event.clientY
      scrollContainerRef.current = getScrollableAncestor(rowNode)
      dragMetaRef.current = {
        fromIndex: index,
        pointerId: event.pointerId,
        pointerOffsetY: event.clientY - rect.top,
      }
      setActiveDragIndex(index)
      setDragInsertIndex(index)
      setDragOverlay({
        width: rect.width,
        x: rect.left,
        y: rect.top,
      })
    },
    []
  )

  const setRowRef = React.useCallback((index: number, node: HTMLDivElement | null) => {
    rowRefs.current[index] = node
  }, [])

  const moveLayerByOffset = React.useCallback(
    (fromIndex: number, offset: number) => {
      const layers = orderedLayersRef.current
      const nextIndex = fromIndex + offset

      if (
        fromIndex < 0 ||
        fromIndex >= layers.length ||
        nextIndex < 0 ||
        nextIndex >= layers.length
      ) {
        return
      }

      const insertIndex = offset > 0 ? nextIndex + 1 : nextIndex
      setOrderedLayers(moveLayerToIndex(layers, fromIndex, insertIndex))
    },
    [setOrderedLayers]
  )

  if (!images) return null

  return (
    <Box ref={listRef}>
      <Text variant="heading-md" className={previewHeadingStyle}>
        {title}
      </Text>

      {orderedLayers.map(({ trait, properties }, index) => {
        const isDragInProgress = activeDragIndex !== null
        const isInsertGapActive = dragInsertIndex === index && isDragInProgress

        return (
          <React.Fragment key={trait}>
            <Box
              className={[
                artworkSettingsDropSpacer,
                isInsertGapActive ? artworkSettingsDropSpacerActive : undefined,
              ]}
            >
              {isInsertGapActive && activeDragIndex !== null ? (
                <Text className={artworkSettingsDropLabel}>
                  {getDropLabel(index, activeDragIndex, orderedLayers)}
                </Text>
              ) : null}
            </Box>
            <LayerBox
              trait={trait}
              properties={properties}
              ipfs={images}
              orderedLayers={orderedLayers}
              index={index}
              isDragInProgress={isDragInProgress}
              isDragging={activeDragIndex === index}
              onMoveUp={() => moveLayerByOffset(index, -1)}
              onMoveDown={() => moveLayerByOffset(index, 1)}
              onDragHandlePointerDown={handleDragHandlePointerDown}
              setRowRef={setRowRef}
            />
          </React.Fragment>
        )
      })}

      <Box
        className={[
          artworkSettingsDropSpacer,
          dragInsertIndex === orderedLayers.length && activeDragIndex !== null
            ? artworkSettingsDropSpacerActive
            : undefined,
        ]}
      >
        {dragInsertIndex === orderedLayers.length && activeDragIndex !== null ? (
          <Text className={artworkSettingsDropLabel}>
            {getDropLabel(orderedLayers.length, activeDragIndex, orderedLayers)}
          </Text>
        ) : null}
      </Box>

      {dragOverlay && draggedLayer
        ? typeof document !== 'undefined'
          ? createPortal(
              <Box
                ref={overlayRef}
                p="x4"
                backgroundColor="background1"
                boxShadow="medium"
                className={artworkSettingsBox}
                style={{
                  opacity: 0.82,
                  pointerEvents: 'none',
                  position: 'fixed',
                  left: 0,
                  top: 0,
                  transform: `translate3d(${dragOverlay.x}px, ${dragOverlay.y}px, 0)`,
                  willChange: 'transform',
                  width: dragOverlay.width,
                  zIndex: 9999,
                }}
              >
                <Text>{draggedLayer.trait}</Text>
              </Box>,
              document.body
            )
          : null
        : null}
    </Box>
  )
}
