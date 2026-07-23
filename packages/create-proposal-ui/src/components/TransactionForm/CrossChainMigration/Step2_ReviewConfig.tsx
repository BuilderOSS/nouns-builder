import { PUBLIC_MANAGER_ADDRESS } from '@buildeross/constants/addresses'
import { useManagerVersion } from '@buildeross/hooks'
import { useAuthStore } from '@buildeross/stores'
import { AddressType } from '@buildeross/types'
import { DaysHoursMinsSecs, SmartInput } from '@buildeross/ui/Fields'
import { getEnsAddress } from '@buildeross/utils/ens'
import { Box, Button, Flex, Heading, Input, Label, Stack, Text } from '@buildeross/zord'
import { Form, Formik, FormikHelpers } from 'formik'
import { useMemo } from 'react'
import { getAddress, isAddress } from 'viem'

import { useCrossChainMigration } from '../../../hooks/useCrossChainMigration'
import {
  bigIntSecondsToTimeStructure,
  numberSecondsToTimeStructure,
  timeStructureToBigIntSeconds,
  timeStructureToNumberSeconds,
} from '../../../utils/timeConversions'
import {
  Step2ConfigFormValues,
  step2ConfigValidationSchema,
} from './Step2_ReviewConfig.schema'

// Helper to safely stringify objects containing BigInt values
const stringifyWithBigInt = (obj: any): string => {
  return JSON.stringify(obj, (_key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )
}

export const Step2_ReviewConfig: React.FC = () => {
  const {
    sourceConfig,
    editedConfig,
    updateConfig,
    goToNextStep,
    goToPreviousStep,
    targetChainId,
  } = useCrossChainMigration()
  const { address: walletAddress } = useAuthStore()

  // Check if target Manager contract supports v3 features
  const managerAddress = targetChainId ? PUBLIC_MANAGER_ADDRESS[targetChainId] : undefined
  const { isV3OrHigher } = useManagerVersion({
    chainId: targetChainId || 1,
    managerAddress: managerAddress || '0x0000000000000000000000000000000000000000',
  })

  // Convert source config to form values
  const initialValues: Step2ConfigFormValues = useMemo(() => {
    const config = editedConfig || sourceConfig
    if (!config) {
      return {
        name: '',
        symbol: '',
        reservedUntilTokenId: 0n,
        founders: [],
        reservePrice: 0n,
        auctionDuration: { days: 0, hours: 0, minutes: 0, seconds: 0 },
        proposalThresholdBps: 0n,
        quorumThresholdBps: 0n,
        votingDelay: { days: 0, hours: 0, minutes: 0, seconds: 0 },
        votingPeriod: { days: 0, hours: 0, minutes: 0, seconds: 0 },
        proposalUpdatablePeriod: { days: 0, hours: 0, minutes: 0, seconds: 0 },
        timelockDelay: { days: 0, hours: 0, minutes: 0, seconds: 0 },
      }
    }

    return {
      name: config.name ?? '',
      symbol: config.symbol ?? '',
      reservedUntilTokenId: config.reservedUntilTokenId ?? 0n,
      founders: config.founders ?? [],
      reservePrice: config.reservePrice ?? 0n,
      auctionDuration: numberSecondsToTimeStructure(Number(config.duration ?? 0)),
      proposalThresholdBps: config.proposalThresholdBps ?? 0n,
      quorumThresholdBps: config.quorumThresholdBps ?? 0n,
      votingDelay: bigIntSecondsToTimeStructure(
        typeof config.votingDelay === 'bigint' ? config.votingDelay : 0n
      ),
      votingPeriod: bigIntSecondsToTimeStructure(
        typeof config.votingPeriod === 'bigint' ? config.votingPeriod : 0n
      ),
      proposalUpdatablePeriod: bigIntSecondsToTimeStructure(
        typeof config.proposalUpdatablePeriod === 'bigint'
          ? config.proposalUpdatablePeriod
          : 0n
      ),
      timelockDelay: bigIntSecondsToTimeStructure(
        typeof config.timelockDelay === 'bigint' && config.timelockDelay >= 300n
          ? config.timelockDelay
          : 300n
      ),
    }
  }, [sourceConfig, editedConfig])

  const handleSubmit = async (
    values: Step2ConfigFormValues,
    { setFieldError, setSubmitting }: FormikHelpers<Step2ConfigFormValues>
  ) => {
    // Additional validation for first founder
    if (walletAddress && values.founders[0]) {
      if (values.founders[0].wallet.toLowerCase() !== walletAddress.toLowerCase()) {
        setFieldError('founders', 'First founder must be your connected wallet address')
        setSubmitting(false)
        return
      }
    }

    // Check for duplicate founders
    const walletAddresses = values.founders.map((f) => f.wallet.toLowerCase())
    const duplicates = walletAddresses.filter(
      (addr, idx) => walletAddresses.indexOf(addr) !== idx
    )
    if (duplicates.length > 0) {
      setFieldError('founders', 'Duplicate founder addresses are not allowed')
      setSubmitting(false)
      return
    }

    // Resolve any ENS names to addresses before proceeding
    try {
      const resolvedFounders = await Promise.all(
        values.founders.map(async (founder, idx) => {
          try {
            const resolved = await getEnsAddress(founder.wallet)

            // Validate that the resolved value is actually a valid address
            if (!resolved || !isAddress(resolved, { strict: false })) {
              throw new Error(`Could not resolve address for founder ${idx + 1}`)
            }

            return {
              ...founder,
              wallet: getAddress(resolved) as AddressType,
            }
          } catch (error) {
            console.error(`Error resolving founder address ${idx + 1}:`, error)
            throw error
          }
        })
      )

      // Convert form values back to config format
      const configToSave = {
        ...(editedConfig || sourceConfig)!,
        name: values.name,
        symbol: values.symbol,
        reservedUntilTokenId: values.reservedUntilTokenId,
        founders: resolvedFounders,
        reservePrice: values.reservePrice,
        duration: timeStructureToNumberSeconds(values.auctionDuration),
        proposalThresholdBps: values.proposalThresholdBps,
        quorumThresholdBps: values.quorumThresholdBps,
        votingDelay: timeStructureToBigIntSeconds(values.votingDelay),
        votingPeriod: timeStructureToBigIntSeconds(values.votingPeriod),
        timelockDelay: timeStructureToBigIntSeconds(values.timelockDelay),
        proposalUpdatablePeriod: isV3OrHigher
          ? timeStructureToBigIntSeconds(values.proposalUpdatablePeriod!)
          : undefined,
      }

      updateConfig(configToSave)
      goToNextStep()
    } catch (error) {
      console.error('Failed to resolve founder addresses:', error)
      setFieldError('founders', 'Failed to resolve one or more founder addresses')
      setSubmitting(false)
    }
  }

  if (!sourceConfig) {
    return (
      <Stack gap="x4">
        <Heading size="md">No Configuration Loaded</Heading>
        <Text color="text3">Please go back to Step 1 to load a configuration.</Text>
      </Stack>
    )
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={step2ConfigValidationSchema(isV3OrHigher)}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {(formik) => {
        const hasChanges =
          stringifyWithBigInt(formik.values) !== stringifyWithBigInt(initialValues)

        const handleAddFounder = () => {
          const oneYearFromNow = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60
          const newFounder = {
            wallet: (walletAddress ||
              '0x0000000000000000000000000000000000000000') as AddressType,
            ownershipPct: 10,
            vestExpiry: BigInt(oneYearFromNow),
          }

          formik.setFieldValue('founders', [...formik.values.founders, newFounder])
        }

        const handleRemoveFounder = (index: number) => {
          const newFounders = formik.values.founders.filter((_, idx) => idx !== index)
          formik.setFieldValue('founders', newFounders)
        }

        const handleReset = () => {
          formik.resetForm({ values: initialValues })
        }

        return (
          <Form>
            <Stack gap="x6">
              <Box>
                <Heading size="md" mb="x2">
                  Step 2: Review & Edit Configuration
                </Heading>
                <Text color="text3">
                  Review the configuration loaded from your source DAO. You can make edits
                  before deployment.
                </Text>
              </Box>

              <Stack gap="x4">
                {/* Basic Token Info */}
                <Box
                  p="x4"
                  borderRadius="curved"
                  borderColor="border"
                  borderStyle="solid"
                >
                  <Heading size="xs" mb="x4">
                    Token Information
                  </Heading>
                  <Stack gap="x4">
                    <Box>
                      <Label htmlFor="name" mb="x2">
                        DAO Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.name && formik.errors.name && (
                        <Text color="negative" fontSize={12} mt="x1">
                          {formik.errors.name}
                        </Text>
                      )}
                    </Box>

                    <Box>
                      <Label htmlFor="symbol" mb="x2">
                        Token Symbol
                      </Label>
                      <Input
                        id="symbol"
                        name="symbol"
                        value={formik.values.symbol}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.symbol && formik.errors.symbol && (
                        <Text color="negative" fontSize={12} mt="x1">
                          {formik.errors.symbol}
                        </Text>
                      )}
                    </Box>

                    <Box>
                      <Label htmlFor="reservedUntilTokenId" mb="x2">
                        Reserved Tokens (0 to this ID)
                      </Label>
                      <Input
                        id="reservedUntilTokenId"
                        name="reservedUntilTokenId"
                        type="number"
                        value={formik.values.reservedUntilTokenId?.toString() || '0'}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          formik.setFieldValue(
                            'reservedUntilTokenId',
                            BigInt(Math.floor(Number(e.target.value || '0')))
                          )
                        }
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.reservedUntilTokenId &&
                        formik.errors.reservedUntilTokenId && (
                          <Text color="negative" fontSize={12} mt="x1">
                            {formik.errors.reservedUntilTokenId as string}
                          </Text>
                        )}
                      <Text color="text4" fontSize={12} mt="x2">
                        Tokens 0-
                        {(formik.values.reservedUntilTokenId
                          ? formik.values.reservedUntilTokenId - 1n
                          : 0n
                        ).toString()}{' '}
                        will be reserved for merkle minting
                      </Text>
                    </Box>
                  </Stack>
                </Box>

                {/* Founders */}
                <Box
                  p="x4"
                  borderRadius="curved"
                  borderColor="border"
                  borderStyle="solid"
                >
                  <Flex justify="space-between" align="center" mb="x4">
                    <Heading size="xs">
                      Founders ({formik.values.founders?.length || 0})
                    </Heading>
                    <Button size="sm" variant="secondary" onClick={handleAddFounder}>
                      Add Founder
                    </Button>
                  </Flex>

                  {/* Info banner about first founder requirement */}
                  <Box p="x3" borderRadius="curved" backgroundColor="accent" mb="x4">
                    <Text fontSize={14} color="background1">
                      ℹ️ Your wallet must be the first founder to execute this migration.
                      You can edit ownership % and vest expiry, but cannot change or
                      remove this founder.
                    </Text>
                  </Box>

                  {formik.errors.founders &&
                    typeof formik.errors.founders === 'string' && (
                      <Text color="negative" fontSize={12} mb="x3">
                        {formik.errors.founders}
                      </Text>
                    )}
                  {formik.values.founders && formik.values.founders.length > 0 ? (
                    <Stack gap="x4">
                      {formik.values.founders.map((founder, idx) => (
                        <Box
                          key={idx}
                          p="x3"
                          borderRadius="curved"
                          borderColor="border"
                          borderStyle="solid"
                          backgroundColor={idx === 0 ? 'background2' : undefined}
                        >
                          <Flex justify="space-between" align="center" mb="x2">
                            <Text fontSize={12} color="text3">
                              Founder {idx + 1} {idx === 0 && '(You)'}
                            </Text>
                            {idx > 0 && (
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => handleRemoveFounder(idx)}
                                style={{ color: 'var(--color-negative)' }}
                              >
                                Remove
                              </Button>
                            )}
                          </Flex>
                          <Stack gap="x3">
                            <Box>
                              <SmartInput
                                inputLabel="Wallet Address"
                                id={`founders.${idx}.wallet`}
                                value={founder.wallet}
                                type="text"
                                placeholder="0x... or .eth"
                                isAddress={true}
                                disabled={idx === 0}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  formik.setFieldValue(
                                    `founders.${idx}.wallet`,
                                    e.target.value as AddressType
                                  )
                                }}
                                errorMessage={
                                  formik.touched.founders?.[idx]?.wallet &&
                                  formik.errors.founders?.[idx]
                                    ? // @ts-ignore
                                      formik.errors.founders[idx].wallet
                                    : undefined
                                }
                              />
                            </Box>
                            <Flex gap="x3">
                              <Box flex={1}>
                                <Label
                                  htmlFor={`founders.${idx}.ownershipPct`}
                                  mb="x1"
                                  fontSize={12}
                                >
                                  Ownership %
                                </Label>
                                <Input
                                  id={`founders.${idx}.ownershipPct`}
                                  name={`founders.${idx}.ownershipPct`}
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={founder.ownershipPct}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    formik.setFieldValue(
                                      `founders.${idx}.ownershipPct`,
                                      Number(e.target.value)
                                    )
                                  }}
                                  onBlur={formik.handleBlur}
                                />
                                {formik.touched.founders?.[idx]?.ownershipPct &&
                                  formik.errors.founders?.[idx] && (
                                    <Text color="negative" fontSize={12} mt="x1">
                                      {/* @ts-ignore */}
                                      {formik.errors.founders[idx].ownershipPct}
                                    </Text>
                                  )}
                              </Box>
                              <Box flex={1}>
                                <Label
                                  htmlFor={`founders.${idx}.vestExpiry`}
                                  mb="x1"
                                  fontSize={12}
                                >
                                  Vesting End Date
                                </Label>
                                <Input
                                  id={`founders.${idx}.vestExpiry`}
                                  name={`founders.${idx}.vestExpiry`}
                                  type="date"
                                  value={
                                    founder.vestExpiry > 0n
                                      ? new Date(Number(founder.vestExpiry) * 1000)
                                          .toISOString()
                                          .split('T')[0]
                                      : ''
                                  }
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    formik.setFieldValue(
                                      `founders.${idx}.vestExpiry`,
                                      e.target.value
                                        ? BigInt(
                                            Math.floor(
                                              new Date(e.target.value).getTime() / 1000
                                            )
                                          )
                                        : 0n
                                    )
                                  }}
                                  onBlur={formik.handleBlur}
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
                <Box
                  p="x4"
                  borderRadius="curved"
                  borderColor="border"
                  borderStyle="solid"
                >
                  <Heading size="xs" mb="x4">
                    Auction Settings
                  </Heading>
                  <Stack gap="x4">
                    <Box>
                      <Label htmlFor="reservePrice" mb="x2">
                        Reserve Price (ETH)
                      </Label>
                      <Input
                        id="reservePrice"
                        name="reservePrice"
                        type="number"
                        step="0.0001"
                        value={(Number(formik.values.reservePrice) / 1e18).toString()}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          formik.setFieldValue(
                            'reservePrice',
                            BigInt(Math.floor(Number(e.target.value) * 1e18))
                          )
                        }
                        onBlur={formik.handleBlur}
                      />
                    </Box>

                    <DaysHoursMinsSecs
                      id="auctionDuration"
                      value={formik.values.auctionDuration}
                      inputLabel="Auction Duration"
                      onChange={() => {}}
                      formik={formik}
                      errorMessage={formik.errors.auctionDuration}
                      helperText="How long each NFT auction will run"
                      marginBottom="x4"
                    />
                  </Stack>
                </Box>

                {/* Governance Parameters */}
                <Box
                  p="x4"
                  borderRadius="curved"
                  borderColor="border"
                  borderStyle="solid"
                >
                  <Heading size="xs" mb="x4">
                    Governance Settings
                  </Heading>
                  <Stack gap="x4">
                    <Flex gap="x4">
                      <Box flex={1}>
                        <Label htmlFor="proposalThresholdBps" mb="x2">
                          Proposal Threshold (%)
                        </Label>
                        <Input
                          id="proposalThresholdBps"
                          name="proposalThresholdBps"
                          type="number"
                          step="0.1"
                          value={(
                            Number(formik.values.proposalThresholdBps) / 100
                          ).toFixed(2)}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            formik.setFieldValue(
                              'proposalThresholdBps',
                              BigInt(Math.round(parseFloat(e.target.value || '0') * 100))
                            )
                          }
                          onBlur={formik.handleBlur}
                        />
                        <Text color="text4" fontSize={12} mt="x1">
                          Minimum % of total NFTs required to create a proposal
                        </Text>
                      </Box>
                      <Box flex={1}>
                        <Label htmlFor="quorumThresholdBps" mb="x2">
                          Quorum Threshold (%)
                        </Label>
                        <Input
                          id="quorumThresholdBps"
                          name="quorumThresholdBps"
                          type="number"
                          step="1"
                          value={(Number(formik.values.quorumThresholdBps) / 100).toFixed(
                            2
                          )}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            formik.setFieldValue(
                              'quorumThresholdBps',
                              BigInt(Math.round(parseFloat(e.target.value || '0') * 100))
                            )
                          }
                          onBlur={formik.handleBlur}
                        />
                        <Text color="text4" fontSize={12} mt="x1">
                          Minimum % of total NFTs that must vote 'For' to pass
                        </Text>
                      </Box>
                    </Flex>

                    {isV3OrHigher && (
                      <DaysHoursMinsSecs
                        id="proposalUpdatablePeriod"
                        value={formik.values.proposalUpdatablePeriod!}
                        inputLabel="Updatable Period"
                        onChange={() => {}}
                        formik={formik}
                        errorMessage={formik.errors.proposalUpdatablePeriod}
                        helperText="Period during which proposers can edit proposals after creation. Can be 0 to disable."
                        marginBottom="x4"
                      />
                    )}

                    <DaysHoursMinsSecs
                      id="votingDelay"
                      value={formik.values.votingDelay}
                      inputLabel="Voting Delay"
                      onChange={() => {}}
                      formik={formik}
                      errorMessage={formik.errors.votingDelay}
                      helperText="Time between proposal creation and voting start"
                      marginBottom="x4"
                    />

                    <DaysHoursMinsSecs
                      id="votingPeriod"
                      value={formik.values.votingPeriod}
                      inputLabel="Voting Period"
                      onChange={() => {}}
                      formik={formik}
                      errorMessage={formik.errors.votingPeriod}
                      helperText="How long a proposal remains open for voting"
                      marginBottom="x4"
                    />

                    <DaysHoursMinsSecs
                      id="timelockDelay"
                      value={formik.values.timelockDelay}
                      inputLabel="Timelock Delay"
                      onChange={() => {}}
                      formik={formik}
                      errorMessage={formik.errors.timelockDelay}
                      helperText="Delay between when a passed proposal is queued and when it can be executed"
                      marginBottom="x4"
                    />
                  </Stack>
                </Box>

                {/* Changes indicator */}
                {hasChanges && (
                  <Box p="x3" borderRadius="curved" backgroundColor="background2">
                    <Text fontSize={14} color="text1">
                      ⚠️ You have made changes to the configuration. These will be used
                      for deployment.
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
                  <Button type="submit" disabled={formik.isSubmitting}>
                    Continue to Deployment
                  </Button>
                </Flex>
              </Flex>
            </Stack>
          </Form>
        )
      }}
    </Formik>
  )
}
