import { CHAIN_ID } from '@buildeross/types'
import { Avatar, DaoAvatar } from '@buildeross/ui/Avatar'
import { walletSnippet } from '@buildeross/utils'
import { Box, Flex, PopUp, Text } from '@buildeross/zord'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import useSWR from 'swr'

interface ProposalWalletProfilePreviewProps {
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
}

const fetcher = async (url: string): Promise<WalletProfilePreviewResponse> => {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  })

  const body = await response.json()

  if (!response.ok) {
    throw new Error(body?.error || 'Failed to load wallet preview')
  }

  return body
}

const compactAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-6)}`

export const ProposalWalletProfilePreview = ({
  address,
  children,
  displayName,
  avatarSrc,
  inline = false,
}: ProposalWalletProfilePreviewProps) => {
  const [open, setOpen] = useState(false)
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
    return () => {
      clearOpenTimeout()
      clearCloseTimeout()
    }
  }, [])

  return (
    <>
      <Box
        as={inline ? 'span' : 'div'}
        ref={setTriggerElement}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        style={{ minWidth: 0 }}
      >
        {children}
      </Box>
      <PopUp
        open={open}
        triggerRef={triggerElement}
        placement="bottom"
        showBackdrop={false}
        padding="x0"
        offsetY={10}
      >
        <Box
          p="x2"
          style={{
            width: 'fit-content',
            minWidth: '264px',
            maxWidth: 'calc(100vw - 32px)',
          }}
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
        >
          <Flex align="center" gap="x2" mb="x2">
            <Avatar address={address} src={avatarSrc} size="40" />
            <Box style={{ minWidth: 0, textAlign: 'left', maxWidth: 'calc(100vw - 120px)' }}>
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
            {data?.stats.totalDaos ?? 0} DAOs, {data?.stats.totalProposals ?? 0} proposals,{' '}
            {data?.stats.totalVotes ?? 0} votes
          </Text>
        </Box>
      </PopUp>
    </>
  )
}
