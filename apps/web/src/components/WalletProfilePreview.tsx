import { CHAIN_ID } from '@buildeross/types'
import { Avatar, DaoAvatar } from '@buildeross/ui/Avatar'
import { walletSnippet } from '@buildeross/utils'
import { Box, Button, Flex, Icon, PopUp, Text } from '@buildeross/zord'
import Link from 'next/link'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import useSWR from 'swr'

interface WalletProfilePreviewProps {
  address: `0x${string}`
  children: React.ReactNode
  displayName?: string
  avatarSrc?: string | null
  inline?: boolean
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

export const WalletProfilePreview = ({
  address,
  children,
  displayName,
  avatarSrc,
  inline = false,
}: WalletProfilePreviewProps) => {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null)
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
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

    event.preventDefault()
    event.stopPropagation()
    clearOpenTimeout()
    clearCloseTimeout()
    setOpen((current) => !current)
  }

  const handleTriggerPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (!isMobile) return

    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <>
      <Box
        as={inline ? 'span' : 'div'}
        ref={setTriggerElement}
        style={{ minWidth: 0 }}
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
        placement="bottom"
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
          onMouseEnter={isMobile ? undefined : handleOpen}
          onMouseLeave={isMobile ? undefined : handleClose}
        >
          <Flex align="center" gap="x2" mb="x2">
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
          </Flex>

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
                  <Flex
                    key={`${dao.chainId}:${dao.collectionAddress}`}
                    direction="column"
                    align="center"
                    justify="center"
                    gap="x0"
                    py="x0"
                    px="x0"
                    style={{ minWidth: 0, textAlign: 'center', width: '100%' }}
                  >
                    <DaoAvatar
                      src={dao.contractImage || undefined}
                      collectionAddress={dao.collectionAddress}
                      auctionAddress={dao.auctionAddress}
                      chainId={dao.chainId}
                      size="52"
                    />
                  </Flex>
                ))}
              </Box>
            ) : (
              <Text variant="paragraph-sm" color="text3">
                No DAO activity yet
              </Text>
            )}
          </Box>

          <Box
            pt="x1"
            style={{
              borderTop: '1px solid rgba(0, 0, 0, 0.08)',
              lineHeight: 1.25,
              textAlign: 'left',
              whiteSpace: 'nowrap',
            }}
          >
            {isLoading ? (
              <Text variant="paragraph-sm" color="text3">
                Loading profile...
              </Text>
            ) : error ? (
              <Text variant="paragraph-sm" color="text3">
                Profile preview unavailable
              </Text>
            ) : data ? (
              <Text variant="paragraph-sm" color="text3">
                {data.stats.totalDaos} DAOs, {data.stats.totalProposals} proposals,{' '}
                {data.stats.totalVotes} votes
              </Text>
            ) : null}
          </Box>

          {isMobile ? (
            <Box mt="x2" pt="x2" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <Button
                as={Link}
                href={`/profile/${address}`}
                variant="outline"
                size="sm"
                w="100%"
                style={{ minWidth: 0, textDecoration: 'none' }}
                onClick={() => setOpen(false)}
              >
                <Flex align="center" justify="space-between" gap="x2" w="100%">
                  <Text>View Profile</Text>
                  <Icon id="arrowRight" size="sm" />
                </Flex>
              </Button>
            </Box>
          ) : null}
        </Box>
      </PopUp>
    </>
  )
}
