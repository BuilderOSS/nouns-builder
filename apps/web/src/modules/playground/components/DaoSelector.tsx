import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { Box, Heading, Stack, Text } from '@buildeross/zord'
import React from 'react'
import {
  type DaoListItem,
  SingleDaoSelector,
} from 'src/modules/dashboard/SingleDaoSelector'

import { selectorContent, selectorWrapper } from './DaoSelector.css'

interface DaoSelectorProps {
  selectedDao: DaoListItem | undefined
  onSelectedDaoChange: (dao: DaoListItem | undefined) => void
  userAddress?: AddressType
  chainIds?: CHAIN_ID[]
}

export const DaoSelector: React.FC<DaoSelectorProps> = ({
  selectedDao,
  onSelectedDaoChange,
  userAddress,
  chainIds,
}) => {
  return (
    <Box className={selectorWrapper}>
      <Stack
        className={selectorContent}
        gap="x6"
        direction="column"
        align="center"
        width="100%"
        p={'x6'}
        borderColor={'border'}
        borderStyle={'solid'}
        borderRadius={'curved'}
        borderWidth={'normal'}
      >
        <Stack gap="x2">
          <Heading size="lg">Select a DAO</Heading>
          <Text color="text3">
            Choose a DAO to preview and experiment with its NFT artwork
          </Text>
        </Stack>

        <SingleDaoSelector
          selectedDaoAddress={selectedDao?.address}
          onSelectedDaoChange={onSelectedDaoChange}
          userAddress={userAddress}
          chainIds={chainIds}
          showSearch={true}
        />
      </Stack>
    </Box>
  )
}
