import { Box, Text } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'

import {
  cardLink,
  coiningCard,
  coiningMeta,
  coiningNetworkBadge,
  coiningPreview,
  coiningPreviewSurfaceA,
  coiningPreviewSurfaceB,
  coiningPreviewSurfaceC,
  coiningPreviewSurfaceD,
  coiningPreviewMark,
  coiningPreviewTitle,
  coiningPreviewTop,
  coiningTitle,
  daoChainBadgeImage,
  mutedText,
} from '../AboutPage.css'
import { CoiningHighlight } from '../types'
import { getChainLogoSrc } from '../utils'

type CoiningCardProps = {
  item: CoiningHighlight
}

export const CoiningCard: React.FC<CoiningCardProps> = ({ item }) => {
  const chainLogoSrc = getChainLogoSrc(item.chainLabel)
  const previewSurfaceClass =
    [coiningPreviewSurfaceA, coiningPreviewSurfaceB, coiningPreviewSurfaceC, coiningPreviewSurfaceD][
      Number(item.id.replace(/\D/g, '')) % 4 || 0
    ]

  return (
    <Link
      aria-label={`View post: ${item.title}`}
      className={coiningCard}
      href={item.href}
    >
      <Box className={`${coiningPreview} ${previewSurfaceClass}`}>
        <Box className={coiningPreviewTop}>
          <Text className={coiningPreviewMark}>{item.amount}</Text>
          {chainLogoSrc ? (
            <Box className={coiningNetworkBadge} title={item.chainLabel}>
              <Box
                as="img"
                alt={`${item.chainLabel} logo`}
                className={daoChainBadgeImage}
                src={chainLogoSrc}
              />
            </Box>
          ) : null}
        </Box>
        <Text className={coiningPreviewTitle}>{item.previewLabel}</Text>
      </Box>

      <Box className={coiningMeta}>
        <Text className={coiningTitle}>{item.title}</Text>
        <Text className={mutedText}>
          By {item.creator} for {item.dao}
        </Text>
      </Box>

      <Text as="span" className={cardLink}>
        View post
      </Text>
    </Link>
  )
}
