import {
  MERKLE_METADATA_RENDERER,
  MERKLE_RESERVE_MINTER,
  PUBLIC_MANAGER_ADDRESS,
} from '@buildeross/constants/addresses'
import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import { useAuthStore, useChainStore, useDaoStore } from '@buildeross/stores'
import { CHAIN_ID } from '@buildeross/types'
import { isTestnetChain } from '@buildeross/utils'
import { Box, Button, Flex, Heading, Icon, Label, Stack, Text } from '@buildeross/zord'
import { useMemo, useState } from 'react'
import { zeroAddress } from 'viem'

import { useCrossChainMigration } from '../../../hooks/useCrossChainMigration'
import { useFetchDAOConfigForMigration } from '../../../hooks/useFetchDAOConfigForMigration'
import { validateChainMigration } from '../../../utils/validateMigration'

export const Step1_LoadConfig: React.FC = () => {
  const { chain } = useChainStore()
  const sourceChainId = chain.id
  const { addresses } = useDaoStore()
  const { address: walletAddress } = useAuthStore()
  const { setChains, setSourceAddresses, setSourceConfig, goToNextStep } =
    useCrossChainMigration()

  // Filter chains that have all required contracts
  // Mainnet DAOs can migrate to any network, testnet DAOs can only migrate to testnets
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

      // Mainnet can go to any network, testnet can only go to testnet
      const targetIsTestnet = isTestnetChain(chain.id)
      const isCompatibleChainType = sourceIsTestnet ? targetIsTestnet : true

      return (
        hasManager &&
        hasRenderer &&
        hasMinter &&
        isDifferentChain &&
        isCompatibleChainType
      )
    })
  }, [sourceChainId])

  // Set default target chain to first available chain
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

    // Ensure current wallet is always the first founder
    const configToSave = { ...config.rawValues }
    const oneYearFromNow = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60

    if (walletAddress) {
      if (configToSave.founders.length === 0) {
        // No founders - add current user as default founder (10%, 1 year vest)
        configToSave.founders = [
          {
            wallet: walletAddress,
            ownershipPct: 10,
            vestExpiry: oneYearFromNow,
          },
        ]
      } else {
        // Founders exist - ensure current wallet is at index 0
        // Create mutable copy of founders array
        const foundersCopy = [...configToSave.founders]
        const currentWalletIndex = foundersCopy.findIndex(
          (f) => f.wallet.toLowerCase() === walletAddress.toLowerCase()
        )

        if (currentWalletIndex === -1) {
          // Current wallet not in founders - add at position 0
          foundersCopy.unshift({
            wallet: walletAddress,
            ownershipPct: 10,
            vestExpiry: oneYearFromNow,
          })
          configToSave.founders = foundersCopy
        } else if (currentWalletIndex > 0) {
          // Current wallet exists but not first - move to position 0
          const [currentWalletFounder] = foundersCopy.splice(currentWalletIndex, 1)
          foundersCopy.unshift(currentWalletFounder)
          configToSave.founders = foundersCopy
        }
        // If currentWalletIndex === 0, wallet is already first - no action needed
      }
    }

    setChains(sourceChainId as CHAIN_ID, targetChainId)
    setSourceAddresses(addresses)
    setSourceConfig(configToSave as any)
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
            ? 'Testnet DAOs can only migrate to other testnet chains'
            : 'Mainnet DAOs can migrate to any available network (mainnet or testnet)'}
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

      {config.rawValues.founders.length === 0 && walletAddress && (
        <Box
          p="x4"
          borderRadius="curved"
          backgroundColor="warningDisabled"
          borderStyle="solid"
          borderWidth="thin"
          borderColor="border"
        >
          <Flex alignItems="center" flexDirection="row" gap="x2" mb="x2">
            <Icon id="warning" />
            <Text fontWeight="label">No Founders Found</Text>
          </Flex>
          <Text fontSize={14} color="text3">
            No founders found in source DAO. Your wallet will be added as founder (10%
            ownership, 1 year vest). You can edit this in Step 2.
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
