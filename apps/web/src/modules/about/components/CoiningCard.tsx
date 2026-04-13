import { Box, Text } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'

import {
  cardLink,
  coiningCard,
  coiningMeta,
  coiningNetworkBadge,
  coiningPreview,
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

  return (
    <Box className={coiningCard}>
      <Box className={coiningPreview} style={{ background: item.surface }}>
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

      <Link className={cardLink} href={item.href}>
        View post
      </Link>
    </Box>
  )
}
