import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { useCountdown } from '@buildeross/hooks/useCountdown'
import { useIsMounted } from '@buildeross/hooks/useIsMounted'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { BigNumberish, formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Flex, Paragraph, Text } from '@buildeross/zord'
import dayjs from 'dayjs'
import { useState } from 'react'

import {
  auction,
  card,
  cardWrapper,
  daoImage,
  favoriteButton,
  favoriteButtonActive,
  favoriteIcon,
  favoriteIconActive,
  name,
  title,
} from './DaoCard.css'
import { Detail } from './Detail'

export interface DaoCardProps {
  chainId: CHAIN_ID
  collectionAddress: AddressType
  tokenId?: number | string | bigint
  tokenName?: string
  tokenImage?: string
  collectionName?: string
  bid?: BigNumberish
  endTime?: number
  isFavorited?: boolean
  favoriteDisabled?: boolean
  onFavoriteToggle?: () => void
}

const Countdown = ({ end, onEnd }: { end: any; onEnd: () => void }) => {
  const { countdownString } = useCountdown(end, onEnd)
  return <Detail title={'Ends in'} content={countdownString} />
}

export const DaoCard = ({
  chainId,
  tokenName,
  tokenImage,
  collectionName,
  collectionAddress,
  bid,
  endTime,
  isFavorited = false,
  favoriteDisabled = false,
  onFavoriteToggle,
}: DaoCardProps) => {
  const isMounted = useIsMounted()
  const [isEnded, setIsEnded] = useState(false)
  const chainMeta = PUBLIC_DEFAULT_CHAINS.find((c) => c.id === chainId)
  const { getDaoLink } = useLinks()

  const onEnd = () => {
    setIsEnded(true)
  }

  if (!isMounted) return null

  const isOver = !!endTime ? dayjs.unix(Date.now() / 1000) >= dayjs.unix(endTime) : true
  const favoriteLabelBase = tokenName ?? collectionName ?? 'DAO'
  const favoriteLabel = isFavorited
    ? `Remove ${favoriteLabelBase} from favorites`
    : `Add ${favoriteLabelBase} to favorites`

  return (
    <Box className={cardWrapper}>
      <Link
        direction="column"
        link={getDaoLink?.(chainId, collectionAddress)}
        borderRadius={'curved'}
        height={'100%'}
        overflow={'hidden'}
        className={card}
      >
        <Box
          backgroundColor="background2"
          width={'100%'}
          height={'auto'}
          aspectRatio={1 / 1}
          position="relative"
          overflow={'hidden'}
          className={daoImage}
        >
          <FallbackImage
            src={tokenImage}
            sizes="100vw"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            alt={`${collectionName} image`}
          />
        </Box>

        <Box pt="x4" position={'relative'} overflow={'hidden'} className={title}>
          <Flex
            width="100%"
            minW={'x0'}
            align="center"
            justify="space-between"
            px="x4"
            mb={'x1'}
          >
            <Box data-testid="token-name" flex={1}>
              <Box
                style={{ fontSize: 22, height: 27 }}
                fontWeight={'display'}
                className={name}
              >
                {tokenName ?? collectionName ?? null}
              </Box>
            </Box>
          </Flex>

          <Flex width="100%" align="center" justify="space-between" px="x4" mb={'x4'}>
            <Paragraph
              data-testid="collection-name"
              color={'text3'}
              className={name}
              style={{ height: 24 }}
            >
              {collectionName ?? null}
            </Paragraph>
            {chainMeta && (
              <Flex align="center" gap="x1">
                <img
                  src={chainMeta.icon}
                  style={{
                    borderRadius: '12px',
                    maxHeight: '16px',
                    objectFit: 'contain',
                    maxWidth: '16px',
                  }}
                  alt={chainMeta.name}
                  height={16}
                  width={16}
                />
                <Text fontSize={12} color="text3">
                  {chainMeta.name}
                </Text>
              </Flex>
            )}
          </Flex>
        </Box>

        <Flex direction={'row'} width={'100%'} className={auction}>
          {isEnded || isOver ? (
            <Detail
              title={'Winning bid'}
              content={bid ? `${formatCryptoVal(bid)} ETH` : 'n/a'}
            />
          ) : (
            <>
              <Detail
                title={'Highest bid'}
                content={bid ? `${formatCryptoVal(bid)} ETH` : '0.00 ETH'}
              />
              <Countdown end={endTime} onEnd={onEnd} />
            </>
          )}
        </Flex>
      </Link>

      {onFavoriteToggle ? (
        <button
          type="button"
          className={[favoriteButton, isFavorited && favoriteButtonActive]
            .filter(Boolean)
            .join(' ')}
          aria-label={favoriteLabel}
          title={favoriteLabel}
          onClick={onFavoriteToggle}
          disabled={favoriteDisabled}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={[favoriteIcon, isFavorited && favoriteIconActive]
              .filter(Boolean)
              .join(' ')}
          >
            <path
              d="M12 2.75l2.85 5.77 6.37.93-4.61 4.49 1.09 6.34L12 17.29l-5.7 2.99 1.09-6.34-4.61-4.49 6.37-.93L12 2.75z"
              fill={isFavorited ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : null}
    </Box>
  )
}
