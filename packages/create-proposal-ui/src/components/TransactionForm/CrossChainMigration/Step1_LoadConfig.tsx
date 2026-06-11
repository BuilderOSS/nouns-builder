import {
  MERKLE_METADATA_RENDERER,
  MERKLE_RESERVE_MINTER,
  PUBLIC_MANAGER_ADDRESS,
} from '@buildeross/constants/addresses'
import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import { useDaoStore } from '@buildeross/stores'
import { CHAIN_ID } from '@buildeross/types'
import { Box, Button, Flex, Heading, Label, Stack, Text } from '@buildeross/zord'
import { useMemo, useState } from 'react'
import { zeroAddress } from 'viem'
import { useChainId } from 'wagmi'

import { useCrossChainMigration } from '../../../hooks/useCrossChainMigration'
import { useFetchDAOConfigForMigration } from '../../../hooks/useFetchDAOConfigForMigration'

export const Step1_LoadConfig: React.FC = () => {
  const sourceChainId = useChainId()
  const { addresses } = useDaoStore()
  const { setChains, setSourceAddresses, setSourceConfig, goToNextStep } =
    useCrossChainMigration()

  const [targetChainId, setTargetChainId] = useState<CHAIN_ID>(CHAIN_ID.BASE)

  // Filter chains that have all required contracts
  const availableChains = useMemo(() => {
    return PUBLIC_ALL_CHAINS.filter((chain) => {
      const hasManager =
        PUBLIC_MANAGER_ADDRESS[chain.id] &&
        PUBLIC_MANAGER_ADDRESS[chain.id] !== zeroAddress
      const hasRenderer =
        MERKLE_METADATA_RENDERER[chain.id] &&
        MERKLE_METADATA_RENDERER[chain.id] !== zeroAddress
      const hasMinter =
        MERKLE_RESERVE_MINTER[chain.id] && MERKLE_RESERVE_MINTER[chain.id] !== zeroAddress

      // Don't allow same chain migration for now
      const isDifferentChain = chain.id !== sourceChainId

      return hasManager && hasRenderer && hasMinter && isDifferentChain
    })
  }, [sourceChainId])

  // Load source DAO config
  const { config, isLoading, error } = useFetchDAOConfigForMigration({
    sourceChainId: sourceChainId as CHAIN_ID,
    targetChainId,
    sourceAddresses: addresses,
    enabled: !!addresses.token,
  })

  const handleContinue = () => {
    if (!config) return

    setChains(sourceChainId as CHAIN_ID, targetChainId)
    setSourceAddresses(addresses)
    setSourceConfig(config.rawValues as any)
    goToNextStep()
  }

  if (isLoading) {
    return (
      <Stack gap="x4">
        <Heading size="md">Loading Configuration...</Heading>
        <Text color="text3">Fetching DAO configuration from source chain...</Text>
      </Stack>
    )
  }

  if (error || !config) {
    return (
      <Stack gap="x4">
        <Heading size="md">Error Loading Configuration</Heading>
        <Text color="negative">{error || 'Failed to load DAO configuration'}</Text>
      </Stack>
    )
  }

  return (
    <Stack gap="x6">
      <Box>
        <Heading size="md" mb="x2">
          Step 1: Select Target Chain
        </Heading>
        <Text color="text3">
          Choose the chain where you want to deploy a copy of this DAO. The source DAO
          configuration has been loaded automatically.
        </Text>
      </Box>

      <Box>
        <Label htmlFor="target-chain" mb="x2">
          Target Chain
        </Label>
        <Box
          as="select"
          id="target-chain"
          value={targetChainId.toString()}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setTargetChainId(Number(e.target.value) as CHAIN_ID)
          }
          p="x3"
          borderRadius="curved"
          borderWidth="thin"
          borderStyle="solid"
          borderColor="border"
          backgroundColor="background1"
          color="text1"
          style={{ width: '100%' }}
        >
          {availableChains.map((chain) => (
            <option key={chain.id} value={chain.id}>
              {chain.name}
            </option>
          ))}
        </Box>
        <Text color="text4" fontSize={14} mt="x2">
          Only chains with Manager, Renderer, and Minter contracts are shown
        </Text>
      </Box>

      <Box p="x4" borderRadius="curved" backgroundColor="background2">
        <Heading size="xs" mb="x3">
          Source DAO Configuration Loaded
        </Heading>
        <Stack gap="x2" fontSize={14}>
          <Flex justify="space-between">
            <Text color="text3">DAO Name:</Text>
            <Text>{config.rawValues.name}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="text3">Symbol:</Text>
            <Text>{config.rawValues.symbol}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="text3">Current Token ID:</Text>
            <Text>{config.rawValues.currentTokenId.toString()}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="text3">Tokens to Reserve:</Text>
            <Text>0 - {config.rawValues.currentTokenId.toString()}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="text3">Founders:</Text>
            <Text>{config.rawValues.founders.length}</Text>
          </Flex>
        </Stack>
      </Box>

      <Flex justify="flex-end">
        <Button onClick={handleContinue}>Continue to Review</Button>
      </Flex>
    </Stack>
  )
}
