import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import { useChainStore } from '@buildeross/stores'
import { Box, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { useCrossChainMigration } from '../../../hooks/useCrossChainMigration'

export const MigrationBanner: React.FC = () => {
  const sourceChain = useChainStore((x) => x.chain)
  const { sourceConfig, targetChainId } = useCrossChainMigration()

  const targetChain = targetChainId
    ? PUBLIC_ALL_CHAINS.find((c) => c.id === targetChainId)
    : undefined

  const daoName = sourceConfig?.name || 'DAO'

  return (
    <Box
      borderRadius="curved"
      borderStyle="solid"
      borderWidth="normal"
      borderColor="border"
      p="x4"
    >
      <Stack gap="x2">
        <Text fontSize="16" fontWeight="label">
          Migrating: {daoName}
        </Text>
        <Flex gap="x2" align="center">
          <Text fontSize="14" color="text3">
            Source Chain:
          </Text>
          <Box style={{ width: 16, height: 16, position: 'relative' }}>
            <img
              src={sourceChain.icon}
              alt={sourceChain.name}
              width={16}
              height={16}
              style={{ objectFit: 'contain' }}
            />
          </Box>
          <Text fontSize="14" color="text1">
            {sourceChain.name}
          </Text>
        </Flex>
        {targetChain ? (
          <Flex gap="x2" align="center">
            <Text fontSize="14" color="text3">
              Target Chain:
            </Text>
            <Box style={{ width: 16, height: 16, position: 'relative' }}>
              <img
                src={targetChain.icon}
                alt={targetChain.name}
                width={16}
                height={16}
                style={{ objectFit: 'contain' }}
              />
            </Box>
            <Text fontSize="14" color="text1">
              {targetChain.name}
            </Text>
          </Flex>
        ) : (
          <Text fontSize="14" color="text3">
            Target Chain: Not selected
          </Text>
        )}
      </Stack>
    </Box>
  )
}
