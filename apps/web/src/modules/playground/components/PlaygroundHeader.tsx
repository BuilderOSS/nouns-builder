import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { chainIdToSlug } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Text } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'
import type { DaoListItem } from 'src/modules/dashboard/SingleDaoSelector'

import { daoImageStyle, headerContainer, headerContent } from './PlaygroundHeader.css'

interface PlaygroundHeaderProps {
  dao: DaoListItem
  onChangeDao: () => void
}

export const PlaygroundHeader: React.FC<PlaygroundHeaderProps> = ({
  dao,
  onChangeDao,
}) => {
  return (
    <Box className={headerContainer}>
      <Flex align="center" justify="space-between" className={headerContent}>
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
        <Button variant="secondary" onClick={onChangeDao}>
          Change DAO
        </Button>
      </Flex>
    </Box>
  )
}
