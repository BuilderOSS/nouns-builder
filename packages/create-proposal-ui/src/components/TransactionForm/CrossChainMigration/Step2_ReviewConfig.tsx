import { AddressType } from '@buildeross/types'
import { SmartInput } from '@buildeross/ui/Fields'
import { getEnsAddress } from '@buildeross/utils/ens'
import { Box, Button, Flex, Heading, Input, Label, Stack, Text } from '@buildeross/zord'
import { useMemo, useState } from 'react'
import { getAddress, isAddress } from 'viem'
import { useAccount } from 'wagmi'

import { useCrossChainMigration } from '../../../hooks/useCrossChainMigration'

// Helper to safely stringify objects containing BigInt values
const stringifyWithBigInt = (obj: any): string => {
  return JSON.stringify(obj, (_key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
}

export const Step2_ReviewConfig: React.FC = () => {
  const { sourceConfig, editedConfig, updateConfig, goToNextStep, goToPreviousStep } =
    useCrossChainMigration()
  const { address: walletAddress } = useAccount()

  const [localConfig, setLocalConfig] = useState(editedConfig || sourceConfig)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Detect if config has changed (BigInt-safe comparison)
  const hasChanges = useMemo(() => {
    if (!localConfig || !sourceConfig) return false
    return stringifyWithBigInt(localConfig) !== stringifyWithBigInt(sourceConfig)
  }, [localConfig, sourceConfig])

  const validateConfig = () => {
    const newErrors: Record<string, string> = {}

    if (!localConfig) return false

    if (!localConfig.name || localConfig.name.trim().length === 0) {
      newErrors.name = 'DAO name is required'
    }

    if (!localConfig.symbol || localConfig.symbol.trim().length === 0) {
      newErrors.symbol = 'Token symbol is required'
    }

    if (
      localConfig.reservedUntilTokenId !== undefined &&
      localConfig.reservedUntilTokenId < 0n
    ) {
      newErrors.reservedUntilTokenId = 'Reserved tokens must be non-negative'
    }

    // Ensure at least one founder exists
    if (!localConfig.founders || localConfig.founders.length === 0) {
      newErrors.founders = 'At least one founder is required'
    }

    if (localConfig.founders && localConfig.founders.length > 0) {
      // Check for duplicates
      const walletAddresses = localConfig.founders.map((f) => f.wallet.toLowerCase())
      const duplicates = walletAddresses.filter(
        (addr, idx) => walletAddresses.indexOf(addr) !== idx
      )
      if (duplicates.length > 0) {
        newErrors.founders = 'Duplicate founder addresses are not allowed'
      }

      localConfig.founders.forEach((founder, idx) => {
        if (!isAddress(founder.wallet)) {
          newErrors[`founder_${idx}_wallet`] = 'Invalid wallet address'
        }
        if (founder.ownershipPct < 0 || founder.ownershipPct > 100) {
          newErrors[`founder_${idx}_pct`] = 'Ownership must be between 0-100'
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = async () => {
    if (!validateConfig() || !localConfig) return

    // Resolve any ENS names to addresses before proceeding
    if (localConfig.founders && localConfig.founders.length > 0) {
      try {
        const resolvedFounders = await Promise.all(
          localConfig.founders.map(async (founder, idx) => {
            // Resolve ENS name if needed
            try {
              const resolved = await getEnsAddress(founder.wallet)

              // Validate that the resolved value is actually a valid address
              if (!resolved || !isAddress(resolved, { strict: false })) {
                setErrors({
                  [`founder_${idx}_wallet`]: 'Could not resolve address',
                })
                throw new Error(`Could not resolve address for founder ${idx + 1}`)
              }

              return {
                ...founder,
                wallet: getAddress(resolved) as AddressType,
              }
            } catch (error) {
              console.error(`Error resolving founder address ${idx + 1}:`, error)
              setErrors({
                [`founder_${idx}_wallet`]: 'Failed to resolve address',
              })
              throw error
            }
          })
        )

        const configWithResolvedFounders = {
          ...localConfig,
          founders: resolvedFounders,
        }

        updateConfig(configWithResolvedFounders)
        goToNextStep()
      } catch (error) {
        // Error already handled in setErrors above
        console.error('Failed to resolve founder addresses:', error)
        return
      }
    } else {
      updateConfig(localConfig)
      goToNextStep()
    }
  }

  const handleReset = () => {
    setLocalConfig(sourceConfig)
    setErrors({})
  }

  const handleAddFounder = () => {
    if (!localConfig) return

    const oneYearFromNow = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60
    const newFounder = {
      wallet: (walletAddress ||
        '0x0000000000000000000000000000000000000000') as AddressType,
      ownershipPct: 10,
      vestExpiry: BigInt(oneYearFromNow),
    }

    const newFounders = [...(localConfig.founders || []), newFounder]
    setLocalConfig({ ...localConfig, founders: newFounders })
  }

  const handleRemoveFounder = (index: number) => {
    if (!localConfig || !localConfig.founders) return

    const newFounders = localConfig.founders.filter((_, idx) => idx !== index)
    setLocalConfig({ ...localConfig, founders: newFounders })
  }

  if (!localConfig || !sourceConfig) {
    return (
      <Stack gap="x4">
        <Heading size="md">No Configuration Loaded</Heading>
        <Text color="text3">Please go back to Step 1 to load a configuration.</Text>
      </Stack>
    )
  }

  return (
    <Stack gap="x6">
      <Box>
        <Heading size="md" mb="x2">
          Step 2: Review & Edit Configuration
        </Heading>
        <Text color="text3">
          Review the configuration loaded from your source DAO. You can make edits before
          deployment.
        </Text>
      </Box>

      <Stack gap="x4">
        {/* Basic Token Info */}
        <Box p="x4" borderRadius="curved" borderColor="border" borderStyle="solid">
          <Heading size="xs" mb="x4">
            Token Information
          </Heading>
          <Stack gap="x4">
            <Box>
              <Label htmlFor="dao-name" mb="x2">
                DAO Name
              </Label>
              <Input
                id="dao-name"
                value={localConfig.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setLocalConfig({ ...localConfig, name: e.target.value })
                }
              />
              {errors.name && (
                <Text color="negative" fontSize={12} mt="x1">
                  {errors.name}
                </Text>
              )}
            </Box>

            <Box>
              <Label htmlFor="token-symbol" mb="x2">
                Token Symbol
              </Label>
              <Input
                id="token-symbol"
                value={localConfig.symbol}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setLocalConfig({ ...localConfig, symbol: e.target.value })
                }
              />
              {errors.symbol && (
                <Text color="negative" fontSize={12} mt="x1">
                  {errors.symbol}
                </Text>
              )}
            </Box>

            <Box>
              <Label htmlFor="reserved-tokens" mb="x2">
                Reserved Tokens (0 to this ID)
              </Label>
              <Input
                id="reserved-tokens"
                type="number"
                value={localConfig.reservedUntilTokenId?.toString() || '0'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setLocalConfig({
                    ...localConfig,
                    reservedUntilTokenId: BigInt(e.target.value || '0'),
                  })
                }
              />
              {errors.reservedUntilTokenId && (
                <Text color="negative" fontSize={12} mt="x1">
                  {errors.reservedUntilTokenId}
                </Text>
              )}
              <Text color="text4" fontSize={12} mt="x2">
                Tokens 0-
                {(localConfig.reservedUntilTokenId
                  ? localConfig.reservedUntilTokenId - 1n
                  : 0n
                ).toString()}{' '}
                will be reserved for merkle minting
              </Text>
            </Box>
          </Stack>
        </Box>

        {/* Founders */}
        <Box p="x4" borderRadius="curved" borderColor="border" borderStyle="solid">
          <Flex justify="space-between" align="center" mb="x4">
            <Heading size="xs">Founders ({localConfig.founders?.length || 0})</Heading>
            <Button size="sm" variant="secondary" onClick={handleAddFounder}>
              Add Founder
            </Button>
          </Flex>
          {errors.founders && (
            <Text color="negative" fontSize={12} mb="x3">
              {errors.founders}
            </Text>
          )}
          {localConfig.founders && localConfig.founders.length > 0 ? (
            <Stack gap="x4">
              {localConfig.founders.map((founder, idx) => (
                <Box
                  key={idx}
                  p="x3"
                  borderRadius="curved"
                  borderColor="border"
                  borderStyle="solid"
                >
                  <Flex justify="space-between" align="center" mb="x2">
                    <Text fontSize={12} color="text3">
                      Founder {idx + 1}
                    </Text>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleRemoveFounder(idx)}
                      style={{ color: 'var(--color-negative)' }}
                    >
                      Remove
                    </Button>
                  </Flex>
                  <Stack gap="x3">
                    <Box>
                      <SmartInput
                        inputLabel="Wallet Address"
                        id={`founder-${idx}-wallet`}
                        value={founder.wallet}
                        type="text"
                        placeholder="0x... or .eth"
                        isAddress={true}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const newFounders = [...localConfig.founders!]
                          newFounders[idx] = {
                            ...founder,
                            wallet: e.target.value as AddressType,
                          }
                          setLocalConfig({ ...localConfig, founders: newFounders })
                        }}
                        errorMessage={errors[`founder_${idx}_wallet`]}
                      />
                    </Box>
                    <Flex gap="x3">
                      <Box flex={1}>
                        <Label htmlFor={`founder-${idx}-pct`} mb="x1" fontSize={12}>
                          Ownership %
                        </Label>
                        <Input
                          id={`founder-${idx}-pct`}
                          type="number"
                          min={0}
                          max={100}
                          value={founder.ownershipPct}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const newFounders = [...localConfig.founders!]
                            newFounders[idx] = {
                              ...founder,
                              ownershipPct: Number(e.target.value),
                            }
                            setLocalConfig({ ...localConfig, founders: newFounders })
                          }}
                        />
                        {errors[`founder_${idx}_pct`] && (
                          <Text color="negative" fontSize={12} mt="x1">
                            {errors[`founder_${idx}_pct`]}
                          </Text>
                        )}
                      </Box>
                      <Box flex={1}>
                        <Label
                          htmlFor={`founder-${idx}-vestExpiry`}
                          mb="x1"
                          fontSize={12}
                        >
                          Vesting End Date
                        </Label>
                        <Input
                          id={`founder-${idx}-vestExpiry`}
                          type="date"
                          value={
                            founder.vestExpiry > 0n
                              ? new Date(Number(founder.vestExpiry) * 1000)
                                  .toISOString()
                                  .split('T')[0]
                              : ''
                          }
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const newFounders = [...localConfig.founders!]
                            newFounders[idx] = {
                              ...founder,
                              vestExpiry: e.target.value
                                ? BigInt(
                                    Math.floor(new Date(e.target.value).getTime() / 1000)
                                  )
                                : 0n,
                            }
                            setLocalConfig({ ...localConfig, founders: newFounders })
                          }}
                        />
                        {founder.vestExpiry > 0n &&
                          Number(founder.vestExpiry) < Date.now() / 1000 && (
                            <Text color="warning" fontSize={12} mt="x1">
                              ⚠️ Vesting has already completed on source DAO
                            </Text>
                          )}
                      </Box>
                    </Flex>
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : (
            <Text color="text3" fontSize={14}>
              No founders configured. Click "Add Founder" to add one.
            </Text>
          )}
        </Box>

        {/* Auction Parameters */}
        <Box p="x4" borderRadius="curved" borderColor="border" borderStyle="solid">
          <Heading size="xs" mb="x4">
            Auction Settings
          </Heading>
          <Stack gap="x4">
            <Flex gap="x4">
              <Box flex={1}>
                <Label htmlFor="reserve-price" mb="x2">
                  Reserve Price (ETH)
                </Label>
                <Input
                  id="reserve-price"
                  type="number"
                  step="0.0001"
                  value={(Number(localConfig.reservePrice) / 1e18).toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLocalConfig({
                      ...localConfig,
                      reservePrice: BigInt(Math.floor(Number(e.target.value) * 1e18)),
                    })
                  }
                />
              </Box>
              <Box flex={1}>
                <Label htmlFor="duration" mb="x2">
                  Duration (seconds)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={localConfig.duration?.toString() || '0'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLocalConfig({
                      ...localConfig,
                      duration: Number(e.target.value || 0),
                    })
                  }
                />
              </Box>
            </Flex>
          </Stack>
        </Box>

        {/* Governance Parameters */}
        <Box p="x4" borderRadius="curved" borderColor="border" borderStyle="solid">
          <Heading size="xs" mb="x4">
            Governance Settings
          </Heading>
          <Stack gap="x4">
            <Flex gap="x4">
              <Box flex={1}>
                <Label htmlFor="proposal-threshold" mb="x2">
                  Proposal Threshold (%)
                </Label>
                <Input
                  id="proposal-threshold"
                  type="number"
                  step="0.1"
                  value={(Number(localConfig.proposalThresholdBps) / 100).toFixed(2)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLocalConfig({
                      ...localConfig,
                      proposalThresholdBps: BigInt(
                        Math.round(parseFloat(e.target.value || '0') * 100)
                      ),
                    })
                  }
                />
                <Text color="text4" fontSize={12} mt="x1">
                  Minimum % of total NFTs required to create a proposal
                </Text>
              </Box>
              <Box flex={1}>
                <Label htmlFor="quorum-threshold" mb="x2">
                  Quorum Threshold (%)
                </Label>
                <Input
                  id="quorum-threshold"
                  type="number"
                  step="1"
                  value={(Number(localConfig.quorumThresholdBps) / 100).toFixed(2)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLocalConfig({
                      ...localConfig,
                      quorumThresholdBps: BigInt(
                        Math.round(parseFloat(e.target.value || '0') * 100)
                      ),
                    })
                  }
                />
                <Text color="text4" fontSize={12} mt="x1">
                  Minimum % of total NFTs that must vote 'For' to pass
                </Text>
              </Box>
            </Flex>

            <Flex gap="x4">
              <Box flex={1}>
                <Label htmlFor="voting-delay" mb="x2">
                  Voting Delay (days)
                </Label>
                <Input
                  id="voting-delay"
                  type="number"
                  step="0.1"
                  value={(Number(localConfig.votingDelay) / 86400).toFixed(2)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLocalConfig({
                      ...localConfig,
                      votingDelay: BigInt(
                        Math.round(parseFloat(e.target.value || '0') * 86400)
                      ),
                    })
                  }
                />
                <Text color="text4" fontSize={12} mt="x1">
                  {Number(localConfig.votingDelay).toLocaleString()} seconds - Time
                  between proposal creation and voting start
                </Text>
              </Box>
              <Box flex={1}>
                <Label htmlFor="voting-period" mb="x2">
                  Voting Period (days)
                </Label>
                <Input
                  id="voting-period"
                  type="number"
                  step="0.1"
                  value={(Number(localConfig.votingPeriod) / 86400).toFixed(2)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLocalConfig({
                      ...localConfig,
                      votingPeriod: BigInt(
                        Math.round(parseFloat(e.target.value || '0') * 86400)
                      ),
                    })
                  }
                />
                <Text color="text4" fontSize={12} mt="x1">
                  {Number(localConfig.votingPeriod).toLocaleString()} seconds - How long a
                  proposal remains open for voting
                </Text>
              </Box>
            </Flex>
          </Stack>
        </Box>

        {/* Changes indicator */}
        {hasChanges && (
          <Box p="x3" borderRadius="curved" backgroundColor="background2">
            <Text fontSize={14} color="onWarning">
              ⚠️ You have made changes to the configuration. These will be used for
              deployment.
            </Text>
          </Box>
        )}
      </Stack>

      <Flex justify="space-between">
        <Button variant="secondary" onClick={goToPreviousStep}>
          Back to Chain Selection
        </Button>
        <Flex gap="x3">
          <Button
            variant="secondary"
            icon="refresh"
            iconAlign="left"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            Reset to Original
          </Button>
          <Button onClick={handleContinue}>Continue to Deployment</Button>
        </Flex>
      </Flex>
    </Stack>
  )
}
