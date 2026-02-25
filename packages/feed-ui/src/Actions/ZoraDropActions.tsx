import { BASE_URL } from '@buildeross/constants/baseUrl'
import { useNowSeconds } from '@buildeross/hooks'
import { type AddressType, CHAIN_ID } from '@buildeross/types'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper } from '@buildeross/ui/LinkWrapper'
import { ShareButton } from '@buildeross/ui/ShareButton'
import { Button, Flex } from '@buildeross/zord'
import React, { useCallback, useMemo } from 'react'

import type { OnOpenMintModal } from '../types/modalStates'

interface ZoraDropActionsProps {
  chainId: CHAIN_ID
  dropAddress: AddressType
  symbol: string
  daoName: string
  daoImage: string
  priceEth: string
  publicSaleStart: number
  publicSaleEnd: number
  editionSize?: string
  maxPerAddress?: number
  onOpenMintModal: OnOpenMintModal
}

export const ZoraDropActions: React.FC<ZoraDropActionsProps> = ({
  chainId,
  dropAddress,
  symbol,
  daoName,
  daoImage,
  priceEth,
  publicSaleStart,
  publicSaleEnd,
  editionSize,
  maxPerAddress,
  onOpenMintModal,
}) => {
  const buttonSize = { '@initial': 'xs', '@768': 'sm' } as const

  // Calculate sale timing
  const now = useNowSeconds(true)

  const saleStart = Number.isFinite(publicSaleStart) ? publicSaleStart : 0
  const saleEnd = Number.isFinite(publicSaleEnd) ? publicSaleEnd : 0
  const saleNotStarted = saleStart > 0 && saleStart > now
  const saleEnded = saleEnd > 0 && saleEnd < now
  const saleActive = !saleNotStarted && !saleEnded

  const { getDropLink } = useLinks()

  const shareUrl = useMemo(() => {
    const link = getDropLink(chainId, dropAddress)
    return link.href.startsWith('http') ? link.href : `${BASE_URL}${link.href}`
  }, [chainId, dropAddress, getDropLink])

  const handleOpenMint = useCallback(() => {
    onOpenMintModal({
      dropAddress,
      symbol,
      chainId,
      daoName,
      daoImage,
      priceEth,
      saleActive,
      saleNotStarted,
      saleEnded,
      saleStart,
      saleEnd,
      editionSize,
      maxPerAddress,
    })
  }, [
    onOpenMintModal,
    dropAddress,
    symbol,
    chainId,
    daoName,
    daoImage,
    priceEth,
    saleActive,
    saleNotStarted,
    saleEnded,
    saleStart,
    saleEnd,
    editionSize,
    maxPerAddress,
  ])

  return (
    <Flex gap="x2" align="center" wrap="wrap">
      <Button size={buttonSize} px="x3" variant="outline" onClick={handleOpenMint}>
        Mint
      </Button>
      <LinkWrapper link={getDropLink(chainId, dropAddress)} isExternal>
        <Button size={buttonSize} px="x3" variant="secondary">
          View Drop
        </Button>
      </LinkWrapper>
      {shareUrl && <ShareButton url={shareUrl} size={buttonSize} variant="secondary" />}
    </Flex>
  )
}
