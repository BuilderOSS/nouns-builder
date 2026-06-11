import { AddressType } from '@buildeross/types'
import { Box, Button, Flex, Heading, Input, Label, Stack, Text } from '@buildeross/zord'
import { useState } from 'react'
import { isAddress } from 'viem'

import { useCrossChainMigration } from '../../../hooks/useCrossChainMigration'

export const Step2_ReviewConfig: React.FC = () => {
  const { sourceConfig, editedConfig, updateConfig, goToNextStep, goToPreviousStep } =
    useCrossChainMigration()

  const [localConfig, setLocalConfig] = useState(editedConfig || sourceConfig)
  const [errors, setErrors] = useState<Record<string, string>>({})

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

    if (localConfig.founders && localConfig.founders.length > 0) {
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

  const handleContinue = () => {
    if (validateConfig() && localConfig) {
      updateConfig(localConfig)
      goToNextStep()
    }
  }

  const handleReset = () => {
    setLocalConfig(sourceConfig)
    setErrors({})
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
        <Box p="x4" borderRadius="curved" backgroundColor="background2">
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
        {localConfig.founders && localConfig.founders.length > 0 && (
          <Box p="x4" borderRadius="curved" backgroundColor="background2">
            <Heading size="xs" mb="x4">
              Founders ({localConfig.founders.length})
            </Heading>
            <Stack gap="x4">
              {localConfig.founders.map((founder, idx) => (
                <Box key={idx} p="x3" borderRadius="curved" backgroundColor="background1">
                  <Text fontSize={12} color="text3" mb="x2">
                    Founder {idx + 1}
                  </Text>
                  <Stack gap="x3">
                    <Box>
                      <Label htmlFor={`founder-${idx}-wallet`} mb="x1" fontSize={12}>
                        Wallet Address
                      </Label>
                      <Input
                        id={`founder-${idx}-wallet`}
                        value={founder.wallet}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const newFounders = [...localConfig.founders!]
                          newFounders[idx] = {
                            ...founder,
                            wallet: e.target.value as AddressType,
                          }
                          setLocalConfig({ ...localConfig, founders: newFounders })
                        }}
                        fontFamily="mono"
                        fontSize={12}
                      />
                      {errors[`founder_${idx}_wallet`] && (
                        <Text color="negative" fontSize={12} mt="x1">
                          {errors[`founder_${idx}_wallet`]}
                        </Text>
                      )}
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
                        <Label htmlFor={`founder-${idx}-duration`} mb="x1" fontSize={12}>
                          Vesting End (Token ID)
                        </Label>
                        <Input
                          id={`founder-${idx}-duration`}
                          type="number"
                          value={founder.vestExpiry.toString()}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const newFounders = [...localConfig.founders!]
                            newFounders[idx] = {
                              ...founder,
                              vestExpiry: BigInt(e.target.value || '0'),
                            }
                            setLocalConfig({ ...localConfig, founders: newFounders })
                          }}
                        />
                      </Box>
                    </Flex>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Auction Parameters */}
        <Box p="x4" borderRadius="curved" backgroundColor="background2">
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
        <Box p="x4" borderRadius="curved" backgroundColor="background2">
          <Heading size="xs" mb="x4">
            Governance Settings
          </Heading>
          <Stack gap="x4">
            <Flex gap="x4">
              <Box flex={1}>
                <Label htmlFor="proposal-threshold" mb="x2">
                  Proposal Threshold (basis points)
                </Label>
                <Input
                  id="proposal-threshold"
                  type="number"
                  value={localConfig.proposalThresholdBps?.toString() || '0'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLocalConfig({
                      ...localConfig,
                      proposalThresholdBps: BigInt(e.target.value || '0'),
                    })
                  }
                />
                <Text color="text4" fontSize={12} mt="x1">
                  {(Number(localConfig.proposalThresholdBps) / 100).toFixed(2)}%
                </Text>
              </Box>
              <Box flex={1}>
                <Label htmlFor="quorum-threshold" mb="x2">
                  Quorum Threshold (basis points)
                </Label>
                <Input
                  id="quorum-threshold"
                  type="number"
                  value={localConfig.quorumThresholdBps?.toString() || '0'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLocalConfig({
                      ...localConfig,
                      quorumThresholdBps: BigInt(e.target.value || '0'),
                    })
                  }
                />
                <Text color="text4" fontSize={12} mt="x1">
                  {(Number(localConfig.quorumThresholdBps) / 100).toFixed(2)}%
                </Text>
              </Box>
            </Flex>

            <Flex gap="x4">
              <Box flex={1}>
                <Label htmlFor="voting-delay" mb="x2">
                  Voting Delay (seconds)
                </Label>
                <Input
                  id="voting-delay"
                  type="number"
                  value={localConfig.votingDelay?.toString() || '0'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLocalConfig({
                      ...localConfig,
                      votingDelay: BigInt(e.target.value || '0'),
                    })
                  }
                />
              </Box>
              <Box flex={1}>
                <Label htmlFor="voting-period" mb="x2">
                  Voting Period (seconds)
                </Label>
                <Input
                  id="voting-period"
                  type="number"
                  value={localConfig.votingPeriod?.toString() || '0'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLocalConfig({
                      ...localConfig,
                      votingPeriod: BigInt(e.target.value || '0'),
                    })
                  }
                />
              </Box>
            </Flex>
          </Stack>
        </Box>

        {/* Changes indicator */}
        {JSON.stringify(localConfig) !== JSON.stringify(sourceConfig) && (
          <Box p="x3" borderRadius="curved" backgroundColor="warning">
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
            onClick={handleReset}
            disabled={JSON.stringify(localConfig) === JSON.stringify(sourceConfig)}
          >
            Reset to Original
          </Button>
          <Button onClick={handleContinue}>Continue to Deployment</Button>
        </Flex>
      </Flex>
    </Stack>
  )
}
