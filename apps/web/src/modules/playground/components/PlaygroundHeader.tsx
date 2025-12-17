import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { chainIdToSlug } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Icon, Text } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'
import type { DaoListItem } from 'src/modules/dashboard/SingleDaoSelector'

import type { PlaygroundView } from '../PlaygroundPage'
import { daoImageStyle, headerContainer, headerContent } from './PlaygroundHeader.css'

interface PlaygroundHeaderProps {
  dao: DaoListItem | undefined
  view: PlaygroundView
  onBack: () => void
  onToggleView: () => void
}

export const PlaygroundHeader: React.FC<PlaygroundHeaderProps> = ({
  dao,
  view,
  onBack,
  onToggleView,
}) => {
  const isCustomView = view === 'custom'

  return (
    <Box className={headerContainer}>
      <Flex align="center" justify="space-between" className={headerContent}>
        <Flex gap="x4" align="center">
          <Button variant="secondary" onClick={onBack}>
            <Flex gap="x1" align="center">
              <Icon id="arrowLeft" />
              <Text fontSize={16} display={{ '@initial': 'none', '@768': 'block' }}>
                Back
              </Text>
            </Flex>
          </Button>
          {isCustomView && (
            <Text fontSize={28} fontWeight={'display'}>
              Custom Artwork
            </Text>
          )}
          {!isCustomView &&
            (dao ? (
              <Flex
                as={Link}
                align="center"
                gap="x4"
                href={`/dao/${chainIdToSlug(dao.chainId)}/${dao.address}`}
              >
                <FallbackImage className={daoImageStyle} src={dao.image} alt={dao.name} />
                <Text fontSize={28} fontWeight={'display'}>
                  {dao.name}
                </Text>
              </Flex>
            ) : (
              <Text fontSize={28} fontWeight={'display'}>
                DAO Artwork
              </Text>
            ))}
        </Flex>
        <Button variant="secondary" onClick={onToggleView}>
          {isCustomView ? 'DAO Artwork' : 'Custom Upload'}
        </Button>
      </Flex>
    </Box>
  )
}
