import { CHAIN_ID } from '@buildeross/types'
import { walletSnippet } from '@buildeross/utils'
import type { PopUpProps } from '@buildeross/zord'
import { Box, PopUp, Text } from '@buildeross/zord'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import useSWR from 'swr'

import { Avatar, DaoAvatar } from '../Avatar'
import { useLinks } from '../LinksProvider'
import { LinkWrapper as Link } from '../LinkWrapper'
import { daoLink, profileHeaderLink } from './WalletProfilePreview.css'

interface WalletProfilePreviewProps {
  address: `0x${string}`
  children: React.ReactNode
  displayName?: string
  avatarSrc?: string | null
  inline?: boolean
  mobileTapBehavior?: 'passthrough' | 'toggle'
  placement?: PopUpProps['placement']
  allowFlip?: boolean
}

interface WalletProfilePreviewResponse {
  topDaos: Array<{
    name: string
    contractImage: string
    collectionAddress: `0x${string}`
    auctionAddress: `0x${string}`
    chainId: CHAIN_ID
    daoTokenCount: number
  }>
  stats: {
    totalDaos: number
    totalVotes: number
    totalProposals: number
  }
  partial?: boolean
  failedChains?: number[]
}

const fetcher = async (url: string): Promise<WalletProfilePreviewResponse> => {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  })

  const rawBody = await response.text()
  let body: Partial<WalletProfilePreviewResponse> & { error?: string } = {}

  if (rawBody) {
    try {
      body = JSON.parse(rawBody)
    } catch {
      body = { error: rawBody }
    }
  }

  if (!response.ok) {
    throw new Error(body?.error || `Failed to load wallet preview (${response.status})`)
  }

  return body as WalletProfilePreviewResponse
}

const compactAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-6)}`
const PREVIEW_MIN_WIDTH = '248px'

const isInteractiveTarget = (target: EventTarget | null) => {
  if (!(target instanceof Element)) return false

  return Boolean(
    target.closest(
      'a, button, input, select, textarea, label, [role="button"], [role="link"], [data-wallet-preview-ignore="true"]'
    )
  )
}

export const WalletProfilePreview = ({
  address,
  children,
  displayName,
  avatarSrc,
  inline = false,
  mobileTapBehavior = 'passthrough',
  placement = 'bottom-start',
  allowFlip = true,
}: WalletProfilePreviewProps) => {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null)
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { getProfileLink, getDaoLink } = useLinks()
  const { data, error, isLoading } = useSWR(
    open ? `/api/profile-preview/${address}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  )

  const resolvedName = useMemo(
    () => displayName || walletSnippet(address),
    [address, displayName]
  )

  const clearOpenTimeout = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
      openTimeoutRef.current = null
    }
  }

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  const handleOpen = () => {
    clearOpenTimeout()
    clearCloseTimeout()
    openTimeoutRef.current = setTimeout(() => {
      setOpen(true)
    }, 140)
  }

  const handleClose = () => {
    clearOpenTimeout()
    clearCloseTimeout()
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, 160)
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearOpenTimeout()
      clearCloseTimeout()
    }
  }, [])

  const handleTriggerClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!isMobile) return

    if (mobileTapBehavior !== 'toggle' || isInteractiveTarget(event.target)) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    clearOpenTimeout()
    clearCloseTimeout()
    setOpen((current) => !current)
  }

  const handleTriggerPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (!isMobile) return

    if (mobileTapBehavior !== 'toggle' || isInteractiveTarget(event.target)) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <>
      <Box
        as={inline ? 'span' : 'div'}
        ref={setTriggerElement}
        style={{ minWidth: 0, cursor: 'pointer' }}
        onMouseEnter={isMobile ? undefined : handleOpen}
        onMouseLeave={isMobile ? undefined : handleClose}
        onFocusCapture={isMobile ? undefined : handleOpen}
        onBlurCapture={isMobile ? undefined : handleClose}
        onPointerDownCapture={handleTriggerPointerDown}
        onClickCapture={handleTriggerClick}
        tabIndex={inline ? undefined : 0}
      >
        {children}
      </Box>
      <PopUp
        open={open}
        onOpenChange={setOpen}
        triggerRef={triggerElement}
        placement={placement}
        allowFlip={allowFlip}
        showBackdrop={isMobile}
        padding="x0"
        offsetY={10}
        viewportPadding={isMobile ? 16 : 0}
      >
        <Box
          p="x2"
          style={{
            width: 'fit-content',
            minWidth: PREVIEW_MIN_WIDTH,
            maxWidth: 'calc(100vw - 32px)',
          }}
          onPointerDownCapture={(event: React.PointerEvent<HTMLDivElement>) =>
            event.stopPropagation()
          }
          onClickCapture={(event: React.MouseEvent<HTMLDivElement>) =>
            event.stopPropagation()
          }
          onMouseEnter={isMobile ? undefined : handleOpen}
          onMouseLeave={isMobile ? undefined : handleClose}
        >
          <Link
            link={getProfileLink(address)}
            className={profileHeaderLink}
            onClick={() => setOpen(false)}
          >
            <Avatar address={address} src={avatarSrc} size="40" />
            <Box
              style={{ minWidth: 0, textAlign: 'left', maxWidth: 'calc(100vw - 120px)' }}
            >
              <Text variant="heading-xs" style={{ whiteSpace: 'nowrap' }}>
                {resolvedName}
              </Text>
              <Text variant="label-sm" color="text3" style={{ whiteSpace: 'nowrap' }}>
                {compactAddress(address)}
              </Text>
            </Box>
          </Link>

          <Box mb="x2" pt="x1" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
            <Text variant="label-sm" color="text3" mb="x1">
              Top DAOs
            </Text>
            {isLoading ? (
              <Text variant="paragraph-sm" color="text3">
                Loading profile...
              </Text>
            ) : error ? (
              <Text variant="paragraph-sm" color="text3">
                Profile preview unavailable
              </Text>
            ) : data?.topDaos.length ? (
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 52px)',
                  columnGap: '8px',
                  justifyContent: 'start',
                }}
              >
                {data.topDaos.map((dao) => (
                  <Link
                    key={`${dao.chainId}:${dao.collectionAddress}`}
                    link={getDaoLink(dao.chainId, dao.collectionAddress)}
                    className={daoLink}
                    onClick={() => setOpen(false)}
                  >
                    <DaoAvatar
                      src={dao.contractImage || undefined}
                      collectionAddress={dao.collectionAddress}
                      auctionAddress={dao.auctionAddress}
                      chainId={dao.chainId}
                      size="52"
                    />
                  </Link>
                ))}
              </Box>
            ) : (
              <Text variant="paragraph-sm" color="text3">
                No DAO activity yet
              </Text>
            )}
          </Box>

          <Text
            variant="paragraph-sm"
            color="text3"
            pt="x1"
            style={{
              borderTop: '1px solid rgba(0, 0, 0, 0.08)',
              lineHeight: 1.25,
              textAlign: 'left',
              whiteSpace: 'nowrap',
            }}
          >
            {data?.stats.totalDaos ?? 0} DAOs, {data?.stats.totalProposals ?? 0}{' '}
            proposals, {data?.stats.totalVotes ?? 0} votes
          </Text>
        </Box>
      </PopUp>
    </>
  )
}
