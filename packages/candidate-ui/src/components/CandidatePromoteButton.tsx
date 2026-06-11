import { governorAbi } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { AnimatedModal, ContractButton, SuccessModalContent } from '@buildeross/ui'
import { getErrorMessage } from '@buildeross/utils/errors'
import { Box, Stack, Text } from '@buildeross/zord'
import React, { useCallback, useState } from 'react'
import { type Hex } from 'viem'
import { useAccount, useConfig } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

export interface ProposerSignature {
  signer: `0x${string}`
  nonce: bigint
  deadline: bigint
  sig: Hex
}

export interface CandidatePromoteButtonProps {
  candidateVersionUID: Hex
  targets: string[]
  values: bigint[]
  calldatas: Hex[]
  description: string
  signatures: ProposerSignature[]
  proposalThreshold: bigint
  totalSignatureWeight: bigint
  onSuccess?: (proposalId: Hex) => void
}

export const CandidatePromoteButton: React.FC<CandidatePromoteButtonProps> = ({
  targets,
  values,
  calldatas,
  description,
  signatures,
  proposalThreshold,
  totalSignatureWeight,
  onSuccess,
}) => {
  const config = useConfig()
  const { address } = useAccount()
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTxSuccess, setIsTxSuccess] = useState(false)

  const meetsThreshold = React.useMemo(() => {
    return totalSignatureWeight >= proposalThreshold
  }, [totalSignatureWeight, proposalThreshold])

  const canPromote = React.useMemo(() => {
    return (
      !!address &&
      !!addresses.governor &&
      meetsThreshold &&
      signatures.length > 0 &&
      targets.length > 0
    )
  }, [address, addresses.governor, meetsThreshold, signatures.length, targets.length])

  const handlePromote = useCallback(async () => {
    if (!canPromote || !addresses.governor) return

    setIsTxSuccess(false)
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      // Format signatures for the contract
      const formattedSignatures = signatures.map((sig) => ({
        signer: sig.signer,
        nonce: sig.nonce,
        deadline: sig.deadline,
        sig: sig.sig,
      }))

      // 1. Simulate the transaction
      const simulation = await simulateContract(config, {
        address: addresses.governor!,
        abi: governorAbi,
        functionName: 'proposeBySigs',
        chainId: chain.id,
        args: [
          formattedSignatures,
          targets as `0x${string}`[],
          values,
          calldatas,
          description,
        ],
      })

      // 2. Write the transaction
      const txHash = await writeContract(config, simulation.request)

      // 3. Wait for confirmation
      await waitForTransactionReceipt(config, {
        hash: txHash,
        chainId: chain.id,
      })

      // 4. Use txHash as proposal identifier
      setIsTxSuccess(true)

      if (onSuccess) {
        setTimeout(() => onSuccess(txHash), 1500)
      }
    } catch (err: unknown) {
      console.error('Error promoting candidate:', err)
      const message = getErrorMessage(err)
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [
    canPromote,
    addresses.governor,
    config,
    chain.id,
    signatures,
    targets,
    values,
    calldatas,
    description,
    onSuccess,
  ])

  const handleCloseModal = () => {
    setIsTxSuccess(false)
    setErrorMessage(null)
  }

  const buttonText = React.useMemo(() => {
    if (!meetsThreshold) {
      const needed = proposalThreshold - totalSignatureWeight
      return `Need ${needed.toString()} more vote${needed !== 1n ? 's' : ''}`
    }
    if (signatures.length === 0) {
      return 'No signatures'
    }
    return 'Submit as Proposal'
  }, [meetsThreshold, proposalThreshold, totalSignatureWeight, signatures.length])

  return (
    <>
      <Stack gap="x3">
        <Box>
          <Text fontSize={14} color="text3" mb="x2">
            Signature Progress
          </Text>
          <Text fontSize={16} fontWeight="label">
            {totalSignatureWeight.toString()} / {proposalThreshold.toString()} votes
          </Text>
          {signatures.length > 0 && (
            <Text fontSize={14} color="text3" mt="x1">
              {signatures.length} signature{signatures.length !== 1 ? 's' : ''} collected
            </Text>
          )}
        </Box>

        <ContractButton
          chainId={chain.id}
          handleClick={handlePromote}
          disabled={!canPromote}
          loading={isSubmitting}
        >
          {buttonText}
        </ContractButton>
      </Stack>

      {/* Transaction Status Modal */}
      <AnimatedModal
        open={isSubmitting || isTxSuccess}
        close={isSubmitting ? undefined : handleCloseModal}
      >
        <SuccessModalContent
          success={isTxSuccess}
          pending={!isTxSuccess && !errorMessage}
          title={
            isTxSuccess
              ? 'Proposal Created'
              : errorMessage
                ? 'Transaction Failed'
                : 'Creating Proposal...'
          }
          subtitle={
            isTxSuccess
              ? `Your candidate has been submitted as a proposal with ${signatures.length} signatures.`
              : errorMessage
                ? errorMessage
                : 'Please confirm the transaction in your wallet.'
          }
        />
      </AnimatedModal>
    </>
  )
}
