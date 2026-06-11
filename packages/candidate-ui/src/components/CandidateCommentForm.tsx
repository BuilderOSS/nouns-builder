import {
  attestCandidateComment,
  attestCommentWithSignature,
  CandidateVoteSupportEnum,
} from '@buildeross/sdk'
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
import { useAccount, useConfig, useWalletClient } from 'wagmi'

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

  const [support, setSupport] = useState<CandidateVoteSupportEnum>(
    CandidateVoteSupportEnum.FOR
  )
  const [comment, setComment] = useState('')
  const [shouldSign, setShouldSign] = useState(false)
  const [nonce] = useState(BigInt(Date.now()))
  const [deadline] = useState(Math.floor(Date.now() / 1000) + 86400 * 7) // 7 days from now

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTxSuccess, setIsTxSuccess] = useState(false)

  const canSubmit = React.useMemo(() => {
    return !!address && !!addresses.token && (comment.trim().length > 0 || shouldSign)
  }, [address, addresses.token, comment, shouldSign])

  const canSign = React.useMemo(() => {
    return support === CandidateVoteSupportEnum.FOR
  }, [support])

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !address) return

    setIsTxSuccess(false)
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      if (shouldSign && canSign && walletClient) {
        // Submit comment + signature in one transaction
        await attestCommentWithSignature({
          config,
          chainId: chain.id,
          walletClient,
          daoTokenAddress: addresses.token!,
          governorAddress,
          tokenSymbol,
          candidateId,
          candidateVersionUID,
          signer: address,
          proposer,
          proposalId,
          nonce,
          deadline,
          support,
          comment: comment.trim(),
          parentCommentUID,
        })
      } else {
        // Submit only comment/vote
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

      setIsTxSuccess(true)
      setComment('')
      setShouldSign(false)

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
  }

  return (
    <>
      <Stack gap="x6">
        <Box>
          <Text fontSize={16} fontWeight="label" mb="x4">
            Your Position
          </Text>
          <Stack gap="x3">
            <Box
              as="label"
              display="flex"
              alignItems="center"
              cursor="pointer"
              p="x3"
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
              <Text>Support (For)</Text>
            </Box>
            <Box
              as="label"
              display="flex"
              alignItems="center"
              cursor="pointer"
              p="x3"
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
              <Text>Oppose (Against)</Text>
            </Box>
            <Box
              as="label"
              display="flex"
              alignItems="center"
              cursor="pointer"
              p="x3"
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
              <Text>Abstain</Text>
            </Box>
            <Box
              as="label"
              display="flex"
              alignItems="center"
              cursor="pointer"
              p="x3"
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
              <Text>No Position</Text>
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

        {canSign && (
          <Box>
            <Box
              as="label"
              display="flex"
              alignItems="center"
              cursor="pointer"
              p="x3"
              borderRadius="curved"
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
                onChange={(e) => setShouldSign(e.target.checked)}
                style={{ marginRight: '12px' }}
              />
              <Text>Also sponsor this candidate (adds your signature)</Text>
            </Box>
            {shouldSign && (
              <Text fontSize={14} color="text3" mt="x2" ml="x3">
                Your signature will be used when promoting this candidate to a proposal.
              </Text>
            )}
          </Box>
        )}

        <Flex justify="flex-end">
          <ContractButton
            chainId={chain.id}
            handleClick={handleSubmit}
            disabled={!canSubmit}
            loading={isSubmitting}
          >
            {shouldSign ? 'Comment & Sign' : 'Submit'}
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
              ? shouldSign
                ? 'Comment & Signature Added'
                : 'Comment Added'
              : errorMessage
                ? 'Transaction Failed'
                : shouldSign
                  ? 'Submitting Comment & Signature...'
                  : 'Submitting Comment...'
          }
          subtitle={
            isTxSuccess
              ? shouldSign
                ? 'Your comment and signature have been recorded.'
                : 'Your comment has been recorded.'
              : errorMessage
                ? errorMessage
                : 'Please confirm the transaction in your wallet.'
          }
        />
      </AnimatedModal>
    </>
  )
}
