import { auctionAbi } from '@buildeross/sdk/contract'
import { useProposalStore } from '@buildeross/stores'
import { AddressType, TransactionType } from '@buildeross/types'
import { Box, Button, Flex, Heading, Stack, Text } from '@buildeross/zord'
import { useMemo, useState } from 'react'
import { encodeFunctionData } from 'viem'
import { useReadContract } from 'wagmi'

import { useBridgeTransaction } from '../../../hooks/useBridgeTransaction'
import { useCrossChainMigration } from '../../../hooks/useCrossChainMigration'

export const Step8_CreateProposal: React.FC = () => {
  const {
    sourceChainId,
    targetChainId,
    sourceAddresses,
    targetAddresses,
    editedConfig,
    goToPreviousStep,
  } = useCrossChainMigration()
  const startProposalDraft = useProposalStore((state) => state.startProposalDraft)
  const resetTransactionType = useProposalStore((state) => state.resetTransactionType)

  const { bridgeTransaction } = useBridgeTransaction({
    sourceChainId: sourceChainId!,
    targetTreasuryAddress: targetAddresses?.treasury,
    amount: '0', // Will be set to treasury balance in actual proposal
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: paused } = useReadContract({
    abi: auctionAbi,
    address: sourceAddresses?.auction,
    chainId: sourceChainId,
    functionName: 'paused',
  })

  const proposalData = useMemo(() => {
    if (!sourceAddresses || !targetAddresses || !bridgeTransaction) return null
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

    transactions.push({
      type: TransactionType.CROSS_CHAIN_MIGRATION,
      title: 'Bridge Treasury',
      summary: 'Bridge treasury',
      transactions: [
        {
          functionSignature: 'bridgeETHTo()',
          target: bridgeTransaction.target,
          value: bridgeTransaction.value,
          calldata: bridgeTransaction.calldata,
        },
      ],
    })

    return {
      transactions,
      title: `Cross-Chain Migration to ${targetChainId}`,
      summary: `# Cross-Chain Migration to ${targetChainId}

This proposal completes the cross-chain migration by:

1. **Pausing the auction** on the source chain (if necessary)
2. **Bridging the treasury** to the new DAO on chain ${targetChainId}

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
- Treasury funds will be bridged to the new DAO
- The new DAO on chain ${targetChainId} will be fully operational`,
    }
  }, [sourceAddresses, targetAddresses, bridgeTransaction, targetChainId, paused])

  const handleCreateProposal = () => {
    if (proposalData) {
      setIsSubmitting(true)
      try {
        startProposalDraft(proposalData)
        resetTransactionType()
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <Stack gap="x6">
      <Box>
        <Heading size="md" mb="x2">
          Step 8: Create Migration Proposal
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
            <Text fontWeight="medium">{sourceChainId}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="text3">Target Chain:</Text>
            <Text fontWeight="medium">{targetChainId}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="text3">DAO Name:</Text>
            <Text fontWeight="medium">{editedConfig?.name}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="text3">Token Symbol:</Text>
            <Text fontWeight="medium">{editedConfig?.symbol}</Text>
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
          Proposal Actions
        </Heading>
        <Stack gap="x3" fontSize={14}>
          <Box>
            <Flex align="center" gap="x2" mb="x1">
              <Text fontWeight="medium">1. Pause Auction</Text>
            </Flex>
            <Text color="text3" fontSize={13}>
              Target: {sourceAddresses?.auction}
            </Text>
            <Text color="text3" fontSize={13}>
              Function: pause()
            </Text>
          </Box>
          <Box>
            <Flex align="center" gap="x2" mb="x1">
              <Text fontWeight="medium">2. Bridge Treasury</Text>
            </Flex>
            <Text color="text3" fontSize={13}>
              Target: {bridgeTransaction?.target}
            </Text>
            <Text color="text3" fontSize={13}>
              Function: bridgeETHTo()
            </Text>
            <Text color="text3" fontSize={13}>
              To: {targetAddresses?.treasury}
            </Text>
            <Text color="text3" fontSize={13}>
              Gas Limit: 200000
            </Text>
          </Box>
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
          <Text>
            • Ensure the treasury has sufficient balance for the bridge operation
          </Text>
          <Text>
            • The bridge transaction may take 7 days to finalize (depending on the chain)
          </Text>
          <Text>• Once paused, auctions on the source chain cannot be resumed</Text>
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
              fontSize={11}
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
          disabled={!proposalData || isSubmitting}
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
