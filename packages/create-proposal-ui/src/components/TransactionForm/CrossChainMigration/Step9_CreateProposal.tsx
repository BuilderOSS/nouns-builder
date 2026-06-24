import { auctionAbi } from '@buildeross/sdk/contract'
import { useProposalStore } from '@buildeross/stores'
import { AddressType, TransactionType } from '@buildeross/types'
import { Box, Button, Flex, Heading, Stack, Text } from '@buildeross/zord'
import { useEffect, useMemo, useState } from 'react'
import { encodeFunctionData, formatEther, parseEther } from 'viem'
import { useBalance, useReadContract } from 'wagmi'

import { useCrossChainMigrationContext } from '../../../contexts'
import { useBridgeTransaction } from '../../../hooks/useBridgeTransaction'
import { useCrossChainMigration } from '../../../hooks/useCrossChainMigration'

export const Step9_CreateProposal: React.FC = () => {
  const {
    sourceChainId,
    targetChainId,
    sourceAddresses,
    targetAddresses,
    editedConfig,
    goToPreviousStep,
  } = useCrossChainMigration()
  const context = useCrossChainMigrationContext()
  const startProposalDraft = useProposalStore((state) => state.startProposalDraft)
  const resetTransactionType = useProposalStore((state) => state.resetTransactionType)

  const { data: treasuryBalance, isLoading: isLoadingBalance } = useBalance({
    address: sourceAddresses?.treasury,
    chainId: sourceChainId,
  })

  const [amountInput, setAmountInput] = useState('')
  const [amountWei, setAmountWei] = useState<bigint | undefined>()

  const {
    bridgeTransaction,
    isLoading: isLoadingBridge,
    error: bridgeError,
  } = useBridgeTransaction({
    sourceChainId,
    targetChainId,
    targetTreasuryAddress: targetAddresses?.treasury,
    amount: amountWei,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: paused } = useReadContract({
    abi: auctionAbi,
    address: sourceAddresses?.auction,
    chainId: sourceChainId,
    functionName: 'paused',
  })

  useEffect(() => {
    if (treasuryBalance?.value && amountInput === '') {
      setAmountWei(treasuryBalance.value)
      setAmountInput(formatEther(treasuryBalance.value))
    }
  }, [treasuryBalance, amountInput])

  const handleAmountChange = (value: string) => {
    setAmountInput(value)
    try {
      if (value && !isNaN(Number(value))) {
        setAmountWei(parseEther(value as `${number}`))
      } else {
        setAmountWei(undefined)
      }
    } catch {
      setAmountWei(undefined)
    }
  }

  const handleSetMax = () => {
    if (treasuryBalance?.value) {
      setAmountWei(treasuryBalance.value)
      setAmountInput(formatEther(treasuryBalance.value))
    }
  }

  const proposalData = useMemo(() => {
    if (!sourceAddresses || !targetAddresses) return null

    type Transaction = {
      functionSignature: string
      target: AddressType
      value: string
      calldata: string
    }

    const transactions: {
      type: TransactionType
      title: string
      summary: string
      transactions: Transaction[]
    }[] = []

    if (!paused) {
      transactions.push({
        type: TransactionType.PAUSE_AUCTIONS,
        title: 'Pause Auctions',
        summary: 'Pause auctions',
        transactions: [
          {
            functionSignature: 'pause()',
            target: sourceAddresses.auction as AddressType,
            value: '0',
            calldata: encodeFunctionData({
              abi: auctionAbi,
              functionName: 'pause',
            }),
          },
        ],
      })
    }

    if (bridgeTransaction) {
      transactions.push({
        type: TransactionType.CROSS_CHAIN_MIGRATION,
        title: 'Bridge Treasury',
        summary: 'Bridge treasury via relay.link',
        transactions: [
          {
            functionSignature: bridgeTransaction.functionSignature,
            target: bridgeTransaction.target,
            value: bridgeTransaction.value,
            calldata: bridgeTransaction.calldata,
          },
        ],
      })
    }

    const actions = []
    if (!paused) actions.push('1. **Pausing the auction** on the source chain')
    if (bridgeTransaction) {
      actions.push(
        `2. **Bridging the treasury** to the new DAO on chain ${targetChainId}`
      )
    }

    return {
      transactions,
      title: `Cross-Chain Migration to ${targetChainId}`,
      summary: `# Cross-Chain Migration to ${targetChainId}

This proposal completes the cross-chain migration by:

${actions.join('\n')}

## New DAO Addresses

- **Token**: ${targetAddresses.token}
- **Metadata**: ${targetAddresses.metadata}
- **Auction**: ${targetAddresses.auction}
- **Treasury**: ${targetAddresses.treasury}
- **Governor**: ${targetAddresses.governor}

## Migration Status

✓ DAO deployed on target chain
✓ Metadata properties configured
✓ Merkle roots set for attributes and members
✓ Reserved tokens minted to original owners

## Next Steps

After this proposal passes:
- Source chain auctions will be paused
${bridgeTransaction ? '- Treasury funds will be bridged to the new DAO via relay.link\n- The new DAO on chain ' + targetChainId + ' will be fully operational' : '- The new DAO on chain ' + targetChainId + ' will be ready to receive the treasury manually'}`,
    }
  }, [sourceAddresses, targetAddresses, bridgeTransaction, targetChainId, paused])

  const handleCreateProposal = () => {
    if (proposalData) {
      setIsSubmitting(true)
      startProposalDraft(proposalData)
      resetTransactionType()
      // Navigate to review page
      if (context?.onNavigateToReview) {
        context.onNavigateToReview()
      }
    }
  }

  const isReady = !!proposalData
  const showBridgeSection = !!bridgeTransaction || !!bridgeError || isLoadingBridge

  return (
    <Stack gap="x6">
      <Box>
        <Heading size="md" mb="x2">
          Step 9: Create Migration Proposal
        </Heading>
        <Text color="text3">
          Create a proposal on the source DAO to pause auctions and bridge the treasury to
          the new DAO.
        </Text>
      </Box>

      <Box p="x4" borderRadius="curved" backgroundColor="positive" color="background1">
        <Heading size="xs" mb="x2">
          ✓ Migration Setup Complete!
        </Heading>
        <Text fontSize={14}>
          The new DAO has been fully configured and is ready to receive the treasury.
        </Text>
      </Box>

      <Box p="x4" borderRadius="curved" backgroundColor="background2">
        <Heading size="xs" mb="x3">
          Migration Summary
        </Heading>
        <Stack gap="x2" fontSize={14}>
          <Flex justify="space-between">
            <Text color="text3">Source Chain:</Text>
            <Text fontWeight="label">{sourceChainId}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="text3">Target Chain:</Text>
            <Text fontWeight="label">{targetChainId}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="text3">DAO Name:</Text>
            <Text fontWeight="label">{editedConfig?.name}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="text3">Token Symbol:</Text>
            <Text fontWeight="label">{editedConfig?.symbol}</Text>
          </Flex>
        </Stack>
      </Box>

      <Box p="x4" borderRadius="curved" backgroundColor="background2">
        <Heading size="xs" mb="x3">
          New DAO Addresses
        </Heading>
        <Stack gap="x2" fontSize={12} fontFamily="mono">
          <Box>
            <Text color="text3" mb="x1">
              Token:
            </Text>
            <Text>{targetAddresses?.token}</Text>
          </Box>
          <Box>
            <Text color="text3" mb="x1">
              Metadata:
            </Text>
            <Text>{targetAddresses?.metadata}</Text>
          </Box>
          <Box>
            <Text color="text3" mb="x1">
              Auction:
            </Text>
            <Text>{targetAddresses?.auction}</Text>
          </Box>
          <Box>
            <Text color="text3" mb="x1">
              Treasury:
            </Text>
            <Text>{targetAddresses?.treasury}</Text>
          </Box>
          <Box>
            <Text color="text3" mb="x1">
              Governor:
            </Text>
            <Text>{targetAddresses?.governor}</Text>
          </Box>
        </Stack>
      </Box>

      <Box p="x4" borderRadius="curved" backgroundColor="background2">
        <Heading size="xs" mb="x3">
          Bridge Configuration
        </Heading>
        <Stack gap="x3" fontSize={14}>
          <Flex justify="space-between" align="center">
            <Text color="text3">Treasury Balance:</Text>
            <Text fontWeight="label">
              {isLoadingBalance
                ? 'Loading...'
                : treasuryBalance
                  ? `${formatEther(treasuryBalance.value)} ETH`
                  : 'N/A'}
            </Text>
          </Flex>
          <Box>
            <Text color="text3" mb="x1">
              Amount to Bridge (ETH):
            </Text>
            <Flex gap="x2" align="center">
              <Box
                as="input"
                type="number"
                value={amountInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleAmountChange(e.target.value)
                }
                placeholder="0"
                min={0}
                step="any"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: 'var(--zord-colors-border)',
                  background: 'var(--zord-colors-background1)',
                  color: 'var(--zord-colors-text)',
                  fontSize: '14px',
                }}
              />
              <Button
                type="button"
                onClick={handleSetMax}
                variant="unset"
                style={{ whiteSpace: 'nowrap' }}
              >
                Set max
              </Button>
            </Flex>
          </Box>
          {showBridgeSection && (
            <Box>
              {isLoadingBridge && <Text color="text3">Fetching bridge quote...</Text>}
              {bridgeError && !isLoadingBridge && (
                <Box
                  p="x3"
                  borderRadius="curved"
                  backgroundColor="warning"
                  color="background1"
                >
                  <Text fontWeight="label" mb="x1">
                    Bridge Not Available
                  </Text>
                  <Text fontSize={12}>
                    {bridgeError}. The treasury transfer will be skipped in this proposal.
                  </Text>
                </Box>
              )}
              {bridgeTransaction && !isLoadingBridge && (
                <Stack gap="x2">
                  <Flex justify="space-between">
                    <Text color="text3">Bridge Provider:</Text>
                    <Text fontWeight="label">relay.link</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="text3">Depository:</Text>
                    <Text fontFamily="mono" fontSize={12}>
                      {bridgeTransaction.target}
                    </Text>
                  </Flex>
                  {bridgeTransaction.fees && (
                    <>
                      <Flex justify="space-between">
                        <Text color="text3">Estimated Gas Fee:</Text>
                        <Text fontWeight="label">
                          {bridgeTransaction.fees.gas.amountFormatted} ETH
                        </Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="text3">Relayer Fee:</Text>
                        <Text fontWeight="label">
                          {bridgeTransaction.fees.relayer.amountFormatted} ETH
                        </Text>
                      </Flex>
                    </>
                  )}
                </Stack>
              )}
            </Box>
          )}
        </Stack>
      </Box>

      <Box p="x4" borderRadius="curved" backgroundColor="background2">
        <Heading size="xs" mb="x3">
          Proposal Actions
        </Heading>
        <Stack gap="x3" fontSize={14}>
          <Box>
            <Flex align="center" gap="x2" mb="x1">
              <Text fontWeight="label">1. Pause Auction</Text>
            </Flex>
            <Text color="text3" fontSize="12">
              Target: {sourceAddresses?.auction}
            </Text>
            <Text color="text3" fontSize="12">
              Function: pause()
            </Text>
          </Box>
          {bridgeTransaction && !isLoadingBridge && (
            <Box>
              <Flex align="center" gap="x2" mb="x1">
                <Text fontWeight="label">2. Bridge Treasury</Text>
              </Flex>
              <Text color="text3" fontSize="12">
                Target: {bridgeTransaction.target}
              </Text>
              <Text color="text3" fontSize="12">
                Function: {bridgeTransaction.functionSignature}
              </Text>
              <Text color="text3" fontSize="12">
                Value: {formatEther(BigInt(bridgeTransaction.value))} ETH
              </Text>
            </Box>
          )}
          {bridgeError && !isLoadingBridge && (
            <Box
              p="x3"
              borderRadius="curved"
              backgroundColor="warning"
              color="background1"
            >
              <Text fontWeight="label" mb="x1">
                Skipped: Bridge Treasury
              </Text>
              <Text fontSize={12}>
                Bridge is not supported for this chain pair. The treasury can be
                transferred manually after migration.
              </Text>
            </Box>
          )}
        </Stack>
      </Box>

      <Box p="x4" borderRadius="curved" backgroundColor="warning" color="background1">
        <Heading size="xs" mb="x2">
          Important Notes
        </Heading>
        <Stack gap="x2" fontSize={14}>
          <Text>
            • The proposal will need to pass voting on the source DAO before execution
          </Text>
          {bridgeTransaction && (
            <Text>
              • Ensure the treasury has sufficient balance for the bridge operation
            </Text>
          )}
          {bridgeTransaction && (
            <Text>
              • The bridge transaction may take several days to finalize (depending on the
              chain)
            </Text>
          )}
          <Text>• Once paused, auctions on the source chain cannot be resumed</Text>
          {bridgeError && (
            <Text>
              • Bridge is not available for this chain pair. The treasury transfer will
              need to be done manually.
            </Text>
          )}
        </Stack>
      </Box>

      {proposalData && (
        <Box p="x4" borderRadius="curved" backgroundColor="background2">
          <Heading size="xs" mb="x3">
            Proposal Preview
          </Heading>
          <Box
            p="x3"
            borderRadius="curved"
            backgroundColor="background1"
            maxHeight="300px"
            style={{ overflowY: 'auto' }}
          >
            <Text
              fontFamily="mono"
              fontSize={12}
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {proposalData.summary}
            </Text>
          </Box>
        </Box>
      )}

      <Flex justify="space-between">
        <Button variant="secondary" onClick={goToPreviousStep}>
          Back
        </Button>
        <Button
          onClick={handleCreateProposal}
          disabled={!isReady || isLoadingBridge || isSubmitting}
          isLoading={isSubmitting}
        >
          Generate Proposal
        </Button>
      </Flex>

      <Box p="x3" borderRadius="curved" backgroundColor="background2">
        <Text fontSize={12} color="text3">
          Note: This will reset and populate the proposal creation form with the migration
          actions. You'll be able to review and submit the proposal from there.
        </Text>
      </Box>
    </Stack>
  )
}
