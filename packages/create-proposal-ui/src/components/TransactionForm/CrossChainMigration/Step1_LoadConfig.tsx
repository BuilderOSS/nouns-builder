import {
  MERKLE_METADATA_RENDERER,
  MERKLE_RESERVE_MINTER,
  PUBLIC_MANAGER_ADDRESS,
} from '@buildeross/constants/addresses'
import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { CHAIN_ID } from '@buildeross/types'
import { isTestnetChain } from '@buildeross/utils'
import { Box, Button, Flex, Heading, Label, Stack, Text } from '@buildeross/zord'
import { useMemo, useState } from 'react'
import { zeroAddress } from 'viem'

import { useCrossChainMigration } from '../../../hooks/useCrossChainMigration'
import { useFetchDAOConfigForMigration } from '../../../hooks/useFetchDAOConfigForMigration'
import { validateChainMigration } from '../../../utils/validateMigration'

export const Step1_LoadConfig: React.FC = () => {
  const { chain } = useChainStore()
  const sourceChainId = chain.id
  const { addresses } = useDaoStore()
  const { setChains, setSourceAddresses, setSourceConfig, goToNextStep } =
    useCrossChainMigration()

  // Filter chains that have all required contracts AND match testnet/mainnet type
  const availableChains = useMemo(() => {
    const sourceIsTestnet = isTestnetChain(sourceChainId as CHAIN_ID)

    return PUBLIC_ALL_CHAINS.filter((chain) => {
      const hasManager =
        PUBLIC_MANAGER_ADDRESS[chain.id] &&
        PUBLIC_MANAGER_ADDRESS[chain.id] !== zeroAddress
      const hasRenderer =
        MERKLE_METADATA_RENDERER[chain.id] &&
        MERKLE_METADATA_RENDERER[chain.id] !== zeroAddress
      const hasMinter =
        MERKLE_RESERVE_MINTER[chain.id] && MERKLE_RESERVE_MINTER[chain.id] !== zeroAddress

      // Don't allow same chain migration
      const isDifferentChain = chain.id !== sourceChainId

      // Only allow testnet-to-testnet or mainnet-to-mainnet
      const targetIsTestnet = isTestnetChain(chain.id)
      const isCompatibleChainType = sourceIsTestnet === targetIsTestnet

      return (
        hasManager &&
        hasRenderer &&
        hasMinter &&
        isDifferentChain &&
        isCompatibleChainType
      )
    })
  }, [sourceChainId])

  // Set default target chain to first available chain (matches testnet/mainnet type)
  const [targetChainId, setTargetChainId] = useState<CHAIN_ID>(
    availableChains[0]?.id || CHAIN_ID.BASE
  )
  const [validationError, setValidationError] = useState<string>()

  // Load source DAO config
  const { config, isLoading, error } = useFetchDAOConfigForMigration({
    sourceChainId: sourceChainId as CHAIN_ID,
    targetChainId,
    sourceAddresses: addresses,
    enabled: !!addresses.token,
  })

  const handleContinue = () => {
    if (!config) return

    // Validate chain compatibility
    const validation = validateChainMigration(sourceChainId as CHAIN_ID, targetChainId)
    if (!validation.isValid) {
      setValidationError(validation.errors[0])
      return
    }

    setValidationError(undefined)
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
        <Text color="negative">
          {error instanceof Error
            ? error.message
            : error || 'Failed to load DAO configuration'}
        </Text>
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
          {isTestnetChain(sourceChainId as CHAIN_ID)
            ? 'Only testnet chains with required contracts are shown'
            : 'Only mainnet chains with required contracts are shown'}
        </Text>
      </Box>

      {validationError && (
        <Box p="x4" borderRadius="curved" backgroundColor="negative">
          <Text color="onNegative" fontWeight="label">
            ⚠️ Chain Incompatibility
          </Text>
          <Text color="onNegative" mt="x2">
            {validationError}
          </Text>
        </Box>
      )}

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
