import {
  attestCandidateComment,
  attestCommentWithSignature,
  CandidateVoteSupportEnum,
} from '@buildeross/sdk'
import { governorAbi } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import {
  AnimatedModal,
  ContractButton,
  SuccessModalContent,
  TextArea,
} from '@buildeross/ui'
import { getErrorMessage } from '@buildeross/utils/errors'
import { Box, Flex, Stack, Text } from '@buildeross/zord'
import React, { useCallback, useState } from 'react'
import { type Hex } from 'viem'
import { useAccount, useConfig, useReadContract, useWalletClient } from 'wagmi'

import {
  CANDIDATE_SIGNATURE_VALIDITY_DAYS,
  CANDIDATE_SIGNATURE_VALIDITY_SECONDS,
} from '../utils/candidateProposal'

export interface CandidateCommentFormProps {
  candidateId: Hex
  candidateVersionUID: Hex
  proposer: `0x${string}`
  governorAddress: `0x${string}`
  tokenSymbol: string
  proposalId: Hex
  onSuccess?: () => void
  parentCommentUID?: Hex
}

export const CandidateCommentForm: React.FC<CandidateCommentFormProps> = ({
  candidateId,
  candidateVersionUID,
  proposer,
  governorAddress,
  tokenSymbol,
  proposalId,
  onSuccess,
  parentCommentUID,
}) => {
  const config = useConfig()
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()
  const { data: nonce, isLoading: isNonceLoading } = useReadContract({
    abi: governorAbi,
    address: governorAddress,
    functionName: 'proposeSignatureNonce',
    args: address ? [address] : undefined,
    chainId: chain.id,
    query: { enabled: !!address && !!governorAddress },
  })
  const isCreator = React.useMemo(
    () => !!address && address.toLowerCase() === proposer.toLowerCase(),
    [address, proposer]
  )

  const [support, setSupport] = useState<CandidateVoteSupportEnum>(
    CandidateVoteSupportEnum.NONE
  )
  const [comment, setComment] = useState('')
  const [shouldSign, setShouldSign] = useState(false)
  const [deadline] = useState(
    Math.floor(Date.now() / 1000) + CANDIDATE_SIGNATURE_VALIDITY_SECONDS
  )

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTxSuccess, setIsTxSuccess] = useState(false)
  const [submittedSupport, setSubmittedSupport] =
    useState<CandidateVoteSupportEnum | null>(null)
  const [submittedWithSignature, setSubmittedWithSignature] = useState(false)

  const canSubmit = React.useMemo(() => {
    return (
      !!address &&
      !!addresses.token &&
      (comment.trim().length > 0 ||
        shouldSign ||
        support !== CandidateVoteSupportEnum.NONE) &&
      (!shouldSign || nonce !== undefined)
    )
  }, [address, addresses.token, comment, shouldSign, support, nonce])

  const canSign = React.useMemo(() => {
    return (
      support === CandidateVoteSupportEnum.FOR &&
      !isCreator &&
      nonce !== undefined &&
      !!walletClient
    )
  }, [isCreator, support, nonce, walletClient])

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !address) return

    setIsTxSuccess(false)
    setErrorMessage(null)
    setIsSubmitting(true)

    const withSignature = shouldSign && canSign

    try {
      if (withSignature) {
        // Submit signal/comment + signature in one transaction
        await attestCommentWithSignature({
          config,
          chainId: chain.id,
          walletClient: walletClient!,
          daoTokenAddress: addresses.token!,
          governorAddress,
          tokenSymbol,
          candidateId,
          candidateVersionUID,
          signer: address,
          proposer,
          proposalId,
          nonce: nonce as bigint,
          deadline,
          support,
          comment: comment.trim(),
          parentCommentUID,
        })
      } else {
        // Submit only comment/signal
        await attestCandidateComment({
          config,
          chainId: chain.id,
          daoTokenAddress: addresses.token!,
          candidateId,
          support,
          comment: comment.trim(),
          parentCommentUID,
        })
      }

      setSubmittedWithSignature(withSignature)
      setSubmittedSupport(support)
      setIsTxSuccess(true)
      setComment('')
      setShouldSign(false)
      setSupport(CandidateVoteSupportEnum.NONE)

      if (onSuccess) {
        setTimeout(onSuccess, 1500)
      }
    } catch (err: unknown) {
      console.error('Error submitting comment:', err)
      const message = getErrorMessage(err)
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [
    canSubmit,
    address,
    shouldSign,
    canSign,
    walletClient,
    config,
    chain.id,
    addresses.token,
    governorAddress,
    tokenSymbol,
    candidateId,
    candidateVersionUID,
    proposer,
    proposalId,
    nonce,
    deadline,
    support,
    comment,
    parentCommentUID,
    onSuccess,
  ])

  const handleCloseModal = () => {
    setIsTxSuccess(false)
    setErrorMessage(null)
    setSubmittedSupport(null)
    setSubmittedWithSignature(false)
  }

  return (
    <>
      <Stack gap={{ '@initial': 'x4', '@768': 'x6' }}>
        <Box>
          <Text fontSize={16} fontWeight="label" mb="x4">
            Your Signal
          </Text>
          <Stack gap={{ '@initial': 'x2', '@768': 'x3' }}>
            <Box
              as="label"
              display="flex"
              alignItems="center"
              cursor="pointer"
              p={{ '@initial': 'x2', '@768': 'x3' }}
              borderRadius="curved"
              backgroundColor={
                support === CandidateVoteSupportEnum.FOR ? 'background2' : 'transparent'
              }
              style={{
                border:
                  support === CandidateVoteSupportEnum.FOR
                    ? '1px solid rgba(0, 255, 0, 0.3)'
                    : '1px solid transparent',
              }}
            >
              <input
                type="radio"
                name="support"
                checked={support === CandidateVoteSupportEnum.FOR}
                onChange={() => setSupport(CandidateVoteSupportEnum.FOR)}
                style={{ marginRight: '12px' }}
              />
              <Text>Signal For</Text>
            </Box>
            <Box
              as="label"
              display="flex"
              alignItems="center"
              cursor="pointer"
              p={{ '@initial': 'x2', '@768': 'x3' }}
              borderRadius="curved"
              backgroundColor={
                support === CandidateVoteSupportEnum.AGAINST
                  ? 'background2'
                  : 'transparent'
              }
              style={{
                border:
                  support === CandidateVoteSupportEnum.AGAINST
                    ? '1px solid rgba(255, 0, 0, 0.3)'
                    : '1px solid transparent',
              }}
            >
              <input
                type="radio"
                name="support"
                checked={support === CandidateVoteSupportEnum.AGAINST}
                onChange={() => {
                  setSupport(CandidateVoteSupportEnum.AGAINST)
                  setShouldSign(false)
                }}
                style={{ marginRight: '12px' }}
              />
              <Text>Signal Against</Text>
            </Box>
            <Box
              as="label"
              display="flex"
              alignItems="center"
              cursor="pointer"
              p={{ '@initial': 'x2', '@768': 'x3' }}
              borderRadius="curved"
              backgroundColor={
                support === CandidateVoteSupportEnum.ABSTAIN
                  ? 'background2'
                  : 'transparent'
              }
              style={{
                border:
                  support === CandidateVoteSupportEnum.ABSTAIN
                    ? '1px solid rgba(255, 255, 0, 0.3)'
                    : '1px solid transparent',
              }}
            >
              <input
                type="radio"
                name="support"
                checked={support === CandidateVoteSupportEnum.ABSTAIN}
                onChange={() => {
                  setSupport(CandidateVoteSupportEnum.ABSTAIN)
                  setShouldSign(false)
                }}
                style={{ marginRight: '12px' }}
              />
              <Text>Signal Abstain</Text>
            </Box>
            <Box
              as="label"
              display="flex"
              alignItems="center"
              cursor="pointer"
              p={{ '@initial': 'x2', '@768': 'x3' }}
              borderRadius="curved"
              backgroundColor={
                support === CandidateVoteSupportEnum.NONE ? 'background2' : 'transparent'
              }
              style={{
                border:
                  support === CandidateVoteSupportEnum.NONE
                    ? '1px solid rgba(128, 128, 128, 0.3)'
                    : '1px solid transparent',
              }}
            >
              <input
                type="radio"
                name="support"
                checked={support === CandidateVoteSupportEnum.NONE}
                onChange={() => {
                  setSupport(CandidateVoteSupportEnum.NONE)
                  setShouldSign(false)
                }}
                style={{ marginRight: '12px' }}
              />
              <Text>No signal</Text>
            </Box>
          </Stack>
        </Box>

        <TextArea
          id="candidate-comment"
          value={comment}
          inputLabel="Comment (Optional)"
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setComment(e.target.value)
          }
          placeholder="Share your thoughts..."
          rows={4}
          disabled={isSubmitting}
        />

        {support === CandidateVoteSupportEnum.FOR && !isCreator && (
          <Box>
            <Box
              as="label"
              display="flex"
              alignItems="center"
              cursor="pointer"
              p="x3"
              borderRadius="curved"
              opacity={nonce === undefined ? 0.6 : 1}
              backgroundColor={shouldSign ? 'background2' : 'transparent'}
              style={{
                border: shouldSign
                  ? '1px solid rgba(0, 200, 255, 0.3)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <input
                type="checkbox"
                checked={shouldSign}
                disabled={nonce === undefined || !walletClient}
                onChange={(e) => setShouldSign(e.target.checked)}
                style={{ marginRight: '12px' }}
              />
              <Text>Also sponsor this candidate</Text>
            </Box>
            {shouldSign && (
              <Text fontSize={14} color="text3" mt="x2" ml="x3">
                Your signature will be used when promoting this candidate to a proposal.
              </Text>
            )}
            <Text fontSize={14} color="text3" mt="x2" ml="x3">
              Signature valid for {CANDIDATE_SIGNATURE_VALIDITY_DAYS} days.
            </Text>
          </Box>
        )}

        {shouldSign && isNonceLoading && (
          <Text fontSize={14} color="text3">
            Loading signature nonce...
          </Text>
        )}

        {isCreator && (
          <Text fontSize={14} color="text3">
            Candidate creators can signal and comment, but cannot sponsor their own
            candidate.
          </Text>
        )}

        <Flex justify={{ '@initial': 'stretch', '@768': 'flex-end' }}>
          <ContractButton
            chainId={chain.id}
            handleClick={handleSubmit}
            disabled={!canSubmit}
            loading={isSubmitting}
            style={{ width: '100%' }}
          >
            {shouldSign
              ? 'Signal & Sign'
              : support === CandidateVoteSupportEnum.NONE
                ? 'Add Comment'
                : 'Submit Signal'}
          </ContractButton>
        </Flex>
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
              ? submittedWithSignature
                ? 'Signal & Signature Added'
                : submittedSupport === CandidateVoteSupportEnum.NONE
                  ? 'Comment Added'
                  : 'Signal Submitted'
              : errorMessage
                ? 'Transaction Failed'
                : shouldSign
                  ? 'Submitting Signal & Signature...'
                  : support === CandidateVoteSupportEnum.NONE
                    ? 'Submitting Comment...'
                    : 'Submitting Signal...'
          }
          subtitle={
            isTxSuccess
              ? submittedWithSignature
                ? 'Your signal and signature have been recorded.'
                : submittedSupport === CandidateVoteSupportEnum.NONE
                  ? 'Your comment has been recorded.'
                  : 'Your signal has been recorded.'
              : errorMessage
                ? errorMessage
                : 'Please confirm the transaction in your wallet.'
          }
        />
      </AnimatedModal>
    </>
  )
}
