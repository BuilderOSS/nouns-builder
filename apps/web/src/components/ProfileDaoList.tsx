import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { DaoAvatar } from '@buildeross/ui/Avatar'
import { Box, Button, Flex, Icon, Text } from '@buildeross/zord'
import NextImage from 'next/image'
import Link from 'next/link'
import React from 'react'
import { createPortal } from 'react-dom'
import { HiddenDaoDisclosure } from 'src/components/HiddenDaoDisclosure'
import {
  daoEditorButtonGroup,
  daoEditorDoneButton,
  daoEditorDragging,
  daoEditorDragHandle,
  daoEditorIconButton,
  daoEditorRow,
  daoEditorSpacer,
  daoEditorSpacerActive,
  profileDaoLink,
  profileHiddenDaoLink,
} from 'src/styles/profile.css'
import {
  getDaoListPreferenceItemKey,
  useDaoListPreferences,
} from 'src/utils/useDaoListPreferences'

type ProfileDaoListItem = {
  auctionAddress: string
  chainId: number
  collectionAddress: string
  name: string
}

type DragOverlayState = {
  daoKey: string
  width: number
  x: number
  y: number
}

type DragMeta = {
  daoKey: string
  pointerOffsetY: number
  pointerId: number
}

type RowMetric = {
  daoKey: string
  midpoint: number
}

type ProfileDaoListProps = {
  daos: ProfileDaoListItem[]
  isOwnProfile: boolean
  userAddress: string
}

type ProfileDaoListRowProps = {
  chainIcon?: string
  dao: ProfileDaoListItem
  daoKey: string
  isDragging: boolean
  isEditing: boolean
  isHidden: boolean
  isInsertGapActive: boolean
  onPointerDown: (event: React.PointerEvent<HTMLButtonElement>, daoKey: string) => void
  onToggleHidden: (dao: ProfileDaoListItem, isHidden: boolean) => void
  setRowRef?: (daoKey: string, node: HTMLDivElement | null) => void
}

const ProfileDaoListRow = React.memo(
  ({
    chainIcon,
    dao,
    daoKey,
    isDragging,
    isEditing,
    isHidden,
    isInsertGapActive,
    onPointerDown,
    onToggleHidden,
    setRowRef,
  }: ProfileDaoListRowProps) => {
    const handleToggleHidden = React.useCallback(() => {
      onToggleHidden(dao, isHidden)
    }, [dao, isHidden, onToggleHidden])

    const handlePointerDown = React.useCallback(
      (event: React.PointerEvent<HTMLButtonElement>) => {
        onPointerDown(event, daoKey)
      },
      [daoKey, onPointerDown]
    )

    const handleRowRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        setRowRef?.(daoKey, node)
      },
      [daoKey, setRowRef]
    )

    return (
      <Box className={daoEditorRow}>
        {isEditing ? (
          <Box
            className={[daoEditorSpacer, isInsertGapActive && daoEditorSpacerActive]}
          />
        ) : null}
        <Flex
          ref={handleRowRef}
          align="center"
          gap="x3"
          p="x3"
          borderRadius="curved"
          borderStyle="solid"
          borderWidth="thin"
          borderColor="border"
          style={{
            transition: 'opacity 0.12s ease, box-shadow 0.12s ease, transform 0.12s ease',
            opacity: isDragging ? 0.42 : isHidden ? 0.7 : 1,
            cursor: isEditing ? 'auto' : 'pointer',
          }}
          className={[
            profileDaoLink,
            isHidden && profileHiddenDaoLink,
            isDragging && daoEditorDragging,
          ]}
        >
          <Flex align="center" gap="x3" flex="1" style={{ minWidth: 0 }}>
            <DaoAvatar
              collectionAddress={dao.collectionAddress}
              size="48"
              auctionAddress={dao.auctionAddress}
              chainId={dao.chainId}
            />
            <Flex align="center" justify="space-between" flex="1" style={{ minWidth: 0 }}>
              <Text fontWeight="display">{dao.name}</Text>
              {chainIcon ? (
                <NextImage
                  src={chainIcon}
                  alt=""
                  height={16}
                  width={16}
                  style={{
                    borderRadius: '999px',
                    objectFit: 'contain',
                  }}
                />
              ) : null}
            </Flex>
          </Flex>
          {isEditing ? (
            <Flex className={daoEditorButtonGroup}>
              <Button
                size="xs"
                variant="ghost"
                className={daoEditorIconButton}
                onClick={handleToggleHidden}
                aria-label={`${isHidden ? 'Show' : 'Hide'} ${dao.name}`}
              >
                <Icon id={isHidden ? 'plus' : 'dash'} size="sm" />
              </Button>
              <Button
                size="xs"
                variant="ghost"
                className={[daoEditorIconButton, daoEditorDragHandle]}
                onPointerDown={handlePointerDown}
                aria-label={`Drag to reorder ${dao.name}`}
              >
                <Icon id="dots" size="sm" style={{ transform: 'rotate(90deg)' }} />
              </Button>
            </Flex>
          ) : null}
        </Flex>
      </Box>
    )
  }
)

ProfileDaoListRow.displayName = 'ProfileDaoListRow'

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

export const ProfileDaoList: React.FC<ProfileDaoListProps> = ({
  daos,
  isOwnProfile,
  userAddress,
}) => {
  const [isEditingDaos, setIsEditingDaos] = React.useState(false)
  const [isHiddenDaosOpen, setIsHiddenDaosOpen] = React.useState(false)
  const [activeDragKey, setActiveDragKey] = React.useState<string | null>(null)
  const [dragInsertIndex, setDragInsertIndex] = React.useState<number | null>(null)
  const [dragOverlay, setDragOverlay] = React.useState<DragOverlayState | null>(null)

  const { groupHiddenDaosLast, isDaoHidden, persistOrderedDaos, setDaoHidden, sortDaos } =
    useDaoListPreferences(userAddress)

  const overlayRef = React.useRef<HTMLDivElement | null>(null)
  const listRef = React.useRef<HTMLDivElement | null>(null)
  const rowRefs = React.useRef<Record<string, HTMLDivElement | null>>({})
  const dragMetaRef = React.useRef<DragMeta | null>(null)
  const latestPointerYRef = React.useRef(0)
  const dragInsertIndexRef = React.useRef<number | null>(null)
  const rafRef = React.useRef<number | null>(null)
  const autoScrollRafRef = React.useRef<number | null>(null)
  const rowMetricsRef = React.useRef<RowMetric[]>([])
  const scrollContainerRef = React.useRef<HTMLElement | Window | null>(null)
  const chainIconsById = React.useMemo(
    () => new Map(PUBLIC_DEFAULT_CHAINS.map((chain) => [chain.id, chain.icon])),
    []
  )
  const chainSlugsById = React.useMemo(
    () => new Map(PUBLIC_DEFAULT_CHAINS.map((chain) => [chain.id, chain.slug])),
    []
  )

  const orderedDaos = React.useMemo(() => {
    const sortedOrderedDaos = sortDaos(
      daos,
      (dao) => dao.collectionAddress,
      (dao) => dao.chainId
    )

    return groupHiddenDaosLast(
      sortedOrderedDaos,
      (dao) => dao.collectionAddress,
      (dao) => dao.chainId
    )
  }, [daos, groupHiddenDaosLast, sortDaos])

  const hiddenDaosCount = React.useMemo(
    () =>
      orderedDaos.filter((dao) => isDaoHidden(dao.chainId, dao.collectionAddress)).length,
    [isDaoHidden, orderedDaos]
  )

  const visibleDaos = React.useMemo(
    () => orderedDaos.filter((dao) => !isDaoHidden(dao.chainId, dao.collectionAddress)),
    [isDaoHidden, orderedDaos]
  )

  const hiddenDaos = React.useMemo(
    () => orderedDaos.filter((dao) => isDaoHidden(dao.chainId, dao.collectionAddress)),
    [isDaoHidden, orderedDaos]
  )

  const daosForDisplay = isEditingDaos ? orderedDaos : visibleDaos

  const getDaoKey = React.useCallback(
    (chainId: number, collectionAddress: string) =>
      getDaoListPreferenceItemKey(chainId, collectionAddress),
    []
  )

  const getInsertIndexForPointer = React.useCallback(
    (pointerY: number, draggingKey: string) => {
      for (let index = 0; index < rowMetricsRef.current.length; index++) {
        const rowMetric = rowMetricsRef.current[index]
        if (rowMetric.daoKey === draggingKey) continue

        if (pointerY < rowMetric.midpoint) {
          return index
        }
      }

      return rowMetricsRef.current.length
    },
    []
  )

  const moveDaoToIndex = React.useCallback(
    (fromIndex: number, toIndex: number) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= daos.length ||
        toIndex > daos.length ||
        fromIndex === toIndex
      ) {
        return
      }

      persistOrderedDaos((currentOrderedDaoKeys) => {
        const sortedCurrentDaos = sortDaos(
          daos,
          (dao) => dao.collectionAddress,
          (dao) => dao.chainId
        )
        const currentOrderedDaos = groupHiddenDaosLast(
          sortedCurrentDaos,
          (dao) => dao.collectionAddress,
          (dao) => dao.chainId
        )

        if (
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= currentOrderedDaos.length ||
          toIndex > currentOrderedDaos.length ||
          fromIndex === toIndex
        ) {
          return currentOrderedDaoKeys
        }

        const nextDaos = [...currentOrderedDaos]
        const [movedDao] = nextDaos.splice(fromIndex, 1)
        nextDaos.splice(toIndex, 0, movedDao)

        return nextDaos.map((dao) => getDaoKey(dao.chainId, dao.collectionAddress))
      })
    },
    [daos, getDaoKey, groupHiddenDaosLast, persistOrderedDaos, sortDaos]
  )

  React.useEffect(() => {
    dragInsertIndexRef.current = dragInsertIndex
  }, [dragInsertIndex])

  React.useEffect(() => {
    if (isOwnProfile) return
    setIsEditingDaos(false)
  }, [isOwnProfile])

  React.useEffect(() => {
    if (isEditingDaos) return
    setActiveDragKey(null)
    setDragInsertIndex(null)
    setDragOverlay(null)
    dragMetaRef.current = null
    rowMetricsRef.current = []
    scrollContainerRef.current = null
  }, [isEditingDaos])

  React.useEffect(() => {
    if (!dragOverlay || !dragMetaRef.current) {
      document.body.style.userSelect = ''
      document.body.style.touchAction = ''
      document.documentElement.style.overscrollBehavior = ''
      return
    }

    document.body.style.userSelect = 'none'
    document.body.style.touchAction = 'none'
    document.documentElement.style.overscrollBehavior = 'none'

    const computeRowMetrics = () => {
      rowMetricsRef.current = orderedDaos
        .map((dao) => {
          const daoKey = getDaoKey(dao.chainId, dao.collectionAddress)
          const row = rowRefs.current[daoKey]
          if (!row) return null

          const rect = row.getBoundingClientRect()
          return {
            daoKey,
            midpoint: rect.top + rect.height / 2,
          }
        })
        .filter((metric): metric is RowMetric => metric !== null)
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
        dragMeta.daoKey
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
        const boundsBottom = listRect ? Math.min(rect.bottom, listRect.bottom) : rect.bottom
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

      const fromIndex = orderedDaos.findIndex(
        (dao) => getDaoKey(dao.chainId, dao.collectionAddress) === dragMeta.daoKey
      )
      const insertIndex = dragInsertIndexRef.current

      if (insertIndex !== null) {
        const adjustedInsertIndex =
          insertIndex > fromIndex ? insertIndex - 1 : insertIndex
        moveDaoToIndex(fromIndex, adjustedInsertIndex)
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
      setActiveDragKey(null)
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
  }, [dragOverlay, getDaoKey, getInsertIndexForPointer, moveDaoToIndex, orderedDaos])

  const draggedDao = React.useMemo(() => {
    if (!activeDragKey) return null
    return (
      orderedDaos.find(
        (dao) => getDaoKey(dao.chainId, dao.collectionAddress) === activeDragKey
      ) || null
    )
  }, [activeDragKey, getDaoKey, orderedDaos])

  const handleToggleHidden = React.useCallback(
    (dao: ProfileDaoListItem, isHidden: boolean) => {
      setDaoHidden(dao.chainId, dao.collectionAddress, !isHidden)
    },
    [setDaoHidden]
  )

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>, daoKey: string) => {
      const rowNode = rowRefs.current[daoKey]
      if (!rowNode) return

      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      const rect = rowNode.getBoundingClientRect()
      scrollContainerRef.current = getScrollableAncestor(rowNode)
      latestPointerYRef.current = event.clientY
      dragMetaRef.current = {
        daoKey,
        pointerOffsetY: event.clientY - rect.top,
        pointerId: event.pointerId,
      }
      setActiveDragKey(daoKey)
      setDragInsertIndex(
        orderedDaos.findIndex(
          (item) => getDaoKey(item.chainId, item.collectionAddress) === daoKey
        )
      )
      setDragOverlay({
        daoKey,
        width: rect.width,
        x: rect.left,
        y: rect.top,
      })
    },
    [getDaoKey, orderedDaos]
  )

  const setRowRef = React.useCallback((daoKey: string, node: HTMLDivElement | null) => {
    rowRefs.current[daoKey] = node
  }, [])

  return (
    <Flex ref={listRef} direction="column" gap="x3" w="100%">
      <Flex mb="x4" w="100%" align="center" justify="space-between" gap="x2">
        <Text fontWeight="display">DAOs</Text>
        {isOwnProfile && daos.length > 0 ? (
          <Button
            size="sm"
            variant="outline"
            className={isEditingDaos ? daoEditorDoneButton : undefined}
            onClick={() => setIsEditingDaos((current) => !current)}
          >
            {isEditingDaos ? 'Done' : 'Edit'}
          </Button>
        ) : null}
      </Flex>

      {daosForDisplay.map((dao, index) => {
        const daoKey = getDaoKey(dao.chainId, dao.collectionAddress)
        const isHidden = isDaoHidden(dao.chainId, dao.collectionAddress)
        const isDragging = activeDragKey === daoKey
        const row = (
          <ProfileDaoListRow
            chainIcon={chainIconsById.get(dao.chainId)}
            dao={dao}
            daoKey={daoKey}
            isDragging={isDragging}
            isEditing={isEditingDaos}
            isHidden={isHidden}
            isInsertGapActive={dragInsertIndex === index && activeDragKey !== null}
            onToggleHidden={handleToggleHidden}
            onPointerDown={handlePointerDown}
            setRowRef={setRowRef}
          />
        )

        return (
          <Box key={daoKey}>
            {isEditingDaos ? (
              row
            ) : (
              <Link
                href={`/dao/${chainSlugsById.get(dao.chainId)}/${dao.collectionAddress}`}
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                  width: '100%',
                }}
              >
                {row}
              </Link>
            )}
          </Box>
        )
      })}

      {isEditingDaos ? (
        <Box
          className={[
            daoEditorSpacer,
            dragInsertIndex === daosForDisplay.length &&
              activeDragKey !== null &&
              daoEditorSpacerActive,
          ]}
        />
      ) : null}

      {hiddenDaosCount > 0 && !isEditingDaos ? (
        <HiddenDaoDisclosure
          count={hiddenDaosCount}
          isOpen={isHiddenDaosOpen}
          onToggle={() => setIsHiddenDaosOpen((current) => !current)}
        >
          <Flex direction="column" gap="x3" w="100%">
            {hiddenDaos.map((dao) => {
              const daoKey = getDaoKey(dao.chainId, dao.collectionAddress)
              const row = (
                <ProfileDaoListRow
                  chainIcon={chainIconsById.get(dao.chainId)}
                  dao={dao}
                  daoKey={daoKey}
                  isDragging={false}
                  isEditing={false}
                  isHidden={true}
                  isInsertGapActive={false}
                  onToggleHidden={handleToggleHidden}
                  onPointerDown={handlePointerDown}
                />
              )

              return (
                <Box key={daoKey}>
                  <Link
                    href={`/dao/${chainSlugsById.get(dao.chainId)}/${dao.collectionAddress}`}
                    style={{
                      color: 'inherit',
                      textDecoration: 'none',
                      width: '100%',
                    }}
                  >
                    {row}
                  </Link>
                </Box>
              )
            })}
          </Flex>
        </HiddenDaoDisclosure>
      ) : null}

      {dragOverlay && draggedDao
        ? typeof document !== 'undefined'
          ? createPortal(
              <Box
                ref={overlayRef}
                style={{
                  opacity: 0.78,
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
                <Box style={{ boxShadow: '0 20px 40px rgba(0, 0, 0, 0.18)' }}>
                  <ProfileDaoListRow
                    chainIcon={chainIconsById.get(draggedDao.chainId)}
                    dao={draggedDao}
                    daoKey={dragOverlay.daoKey}
                    isDragging={false}
                    isEditing={false}
                    isHidden={isDaoHidden(
                      draggedDao.chainId,
                      draggedDao.collectionAddress
                    )}
                    isInsertGapActive={false}
                    onToggleHidden={() => undefined}
                    onPointerDown={() => undefined}
                  />
                </Box>
              </Box>,
              document.body
            )
          : null
        : null}
    </Flex>
  )
}
