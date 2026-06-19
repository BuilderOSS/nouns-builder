import { attestCandidateSignature } from '@buildeross/sdk'
import { governorAbi } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { AnimatedModal, ContractButton, SuccessModalContent } from '@buildeross/ui'
import { getErrorMessage } from '@buildeross/utils/errors'
import { Box, vars } from '@buildeross/zord'
import React, { useCallback, useState } from 'react'
import { type Hex } from 'viem'
import { useAccount, useConfig, useReadContract, useWalletClient } from 'wagmi'

import {
  CANDIDATE_SIGNATURE_VALIDITY_DAYS,
  CANDIDATE_SIGNATURE_VALIDITY_SECONDS,
} from '../utils/candidateProposal'

export interface CandidateSignatureButtonProps {
  candidateVersionUID: Hex
  proposer: `0x${string}`
  governorAddress: `0x${string}`
  tokenSymbol: string
  buttonVariant?: React.ComponentProps<typeof ContractButton>['variant']
  alreadySigned?: boolean
  voteWeight?: bigint
  signatureCount?: number
  onSuccess?: () => void
}

export const CandidateSignatureButton: React.FC<CandidateSignatureButtonProps> = ({
  candidateVersionUID,
  proposer,
  governorAddress,
  tokenSymbol,
  buttonVariant = 'primary',
  alreadySigned = false,
  voteWeight = 0n,
  signatureCount = 0,
  onSuccess,
}) => {
  const config = useConfig()
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()
  const isProposer = React.useMemo(
    () => !!address && address.toLowerCase() === proposer.toLowerCase(),
    [address, proposer]
  )

  const { data: nonce, isLoading: isNonceLoading } = useReadContract({
    abi: governorAbi,
    address: governorAddress,
    functionName: 'proposeSignatureNonce',
    args: address ? [address] : undefined,
    chainId: chain.id,
    query: { enabled: !!address && !!governorAddress },
  })
  const [deadline] = useState(
    Math.floor(Date.now() / 1000) + CANDIDATE_SIGNATURE_VALIDITY_SECONDS
  )

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTxSuccess, setIsTxSuccess] = useState(false)

  const canSign = React.useMemo(() => {
    return (
      !!address &&
      !!walletClient &&
      nonce !== undefined &&
      !alreadySigned &&
      !isProposer &&
      voteWeight > 0n
    )
  }, [address, walletClient, nonce, alreadySigned, isProposer, voteWeight])

  const handleSign = useCallback(async () => {
    if (!canSign || !address || !walletClient || nonce === undefined) return

    setIsTxSuccess(false)
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      await attestCandidateSignature({
        config,
        chainId: chain.id,
        walletClient,
        daoTokenAddress: addresses.token!,
        governorAddress,
        tokenSymbol,
        candidateVersionUID,
        signer: address,
        proposer,
        nonce,
        deadline,
      })

      setIsTxSuccess(true)

      if (onSuccess) {
        setTimeout(onSuccess, 1500)
      }
    } catch (err: unknown) {
      console.error('Error signing candidate:', err)
      const message = getErrorMessage(err)
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [
    canSign,
    address,
    walletClient,
    config,
    chain.id,
    addresses.token,
    governorAddress,
    tokenSymbol,
    candidateVersionUID,
    proposer,
    nonce,
    deadline,
    onSuccess,
  ])

  const handleCloseModal = () => {
    setIsTxSuccess(false)
    setErrorMessage(null)
  }

  const buttonText = React.useMemo(() => {
    if (isNonceLoading) return 'Loading Signature Nonce...'
    if (isProposer) return 'Candidate Creator Cannot Sign'
    if (alreadySigned) return 'Already Signed'
    if (voteWeight === 0n) return 'No Voting Power'
    return `Sign Candidate`
  }, [alreadySigned, isNonceLoading, isProposer, voteWeight])

  const buttonSubtext = React.useMemo(() => {
    if (signatureCount > 0)
      return `${signatureCount} signature${signatureCount !== 1 ? 's' : ''}`
    return undefined
  }, [signatureCount])

  if (isProposer) return null

  return (
    <>
      <ContractButton
        chainId={chain.id}
        handleClick={handleSign}
        disabled={!canSign}
        loading={isSubmitting}
        variant={buttonVariant}
        style={{ position: 'relative' }}
      >
        <Box>{buttonText}</Box>
        {voteWeight > 0n && !alreadySigned && (
          <Box
            position="absolute"
            right={{ '@initial': 'x2', '@768': 'x4' }}
            px="x3"
            py="x1"
            borderRadius="normal"
            fontSize={14}
            style={{
              backgroundColor: `color-mix(in srgb, ${vars.color.onAccent} 30%, transparent)`,
            }}
          >
            {voteWeight.toString()} Votes
          </Box>
        )}
        {buttonSubtext && (
          <Box
            position="absolute"
            bottom="x1"
            fontSize={12}
            color="text3"
            style={{
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            {buttonSubtext}
          </Box>
        )}
      </ContractButton>

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
              ? 'Signature Added'
              : errorMessage
                ? 'Transaction Failed'
                : 'Signing Candidate...'
          }
          subtitle={
            isTxSuccess
              ? `Your signature has been recorded with ${voteWeight.toString()} vote weight.`
              : errorMessage
                ? errorMessage
                : `Please confirm the transaction in your wallet. Signature valid for ${CANDIDATE_SIGNATURE_VALIDITY_DAYS} days.`
          }
        />
      </AnimatedModal>
    </>
  )
}
