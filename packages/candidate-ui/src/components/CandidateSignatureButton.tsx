import { attestCandidateSignature } from '@buildeross/sdk'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { AnimatedModal, ContractButton, SuccessModalContent } from '@buildeross/ui'
import { getErrorMessage } from '@buildeross/utils/errors'
import { Box, vars } from '@buildeross/zord'
import React, { useCallback, useState } from 'react'
import { type Hex } from 'viem'
import { useAccount, useConfig, useWalletClient } from 'wagmi'

export interface CandidateSignatureButtonProps {
  candidateVersionUID: Hex
  proposer: `0x${string}`
  governorAddress: `0x${string}`
  tokenSymbol: string
  proposalId: Hex
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
  proposalId,
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

  const [nonce] = useState(BigInt(Date.now()))
  const [deadline] = useState(Math.floor(Date.now() / 1000) + 86400 * 7) // 7 days from now

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTxSuccess, setIsTxSuccess] = useState(false)

  const canSign = React.useMemo(() => {
    return !!address && !!walletClient && !alreadySigned && voteWeight > 0n
  }, [address, walletClient, alreadySigned, voteWeight])

  const handleSign = useCallback(async () => {
    if (!canSign || !address || !walletClient) return

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
        proposalId,
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
    proposalId,
    nonce,
    deadline,
    onSuccess,
  ])

  const handleCloseModal = () => {
    setIsTxSuccess(false)
    setErrorMessage(null)
  }

  const buttonText = React.useMemo(() => {
    if (alreadySigned) return 'Already Signed'
    if (voteWeight === 0n) return 'No Voting Power'
    return `Sign Candidate`
  }, [alreadySigned, voteWeight])

  const buttonSubtext = React.useMemo(() => {
    if (signatureCount > 0)
      return `${signatureCount} signature${signatureCount !== 1 ? 's' : ''}`
    return undefined
  }, [signatureCount])

  return (
    <>
      <ContractButton
        chainId={chain.id}
        handleClick={handleSign}
        disabled={!canSign}
        loading={isSubmitting}
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
            left="50%"
            fontSize={12}
            color="text3"
            style={{
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
                : 'Please confirm the transaction in your wallet.'
          }
        />
      </AnimatedModal>
    </>
  )
}
