import { attestCandidate, type CandidateAttestationParams } from '@buildeross/sdk'
import { useCandidateStore, useChainStore, useDaoStore } from '@buildeross/stores'
import { MarkdownDisplay } from '@buildeross/ui/MarkdownDisplay'
import { AnimatedModal, SuccessModalContent } from '@buildeross/ui/Modal'
import { getErrorMessage } from '@buildeross/utils/errors'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import React, { useCallback, useState } from 'react'
import { type Hex, keccak256, toBytes, toHex, zeroHash } from 'viem'
import { useAccount, useConfig } from 'wagmi'

import { buildCandidateDescription } from '../utils/buildCandidateDescription'

export interface CandidateSubmitFormProps {
  isUpdate?: boolean // True if updating existing candidate
  onSuccess?: (candidateId: Hex, attestationUID: Hex) => void
  onBack?: () => void
}

export const CandidateSubmitForm: React.FC<CandidateSubmitFormProps> = ({
  isUpdate = false,
  onSuccess,
  onBack,
}) => {
  const config = useConfig()
  const { address } = useAccount()
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()
  const {
    title,
    summary,
    discussionUrl,
    transactions,
    candidateId,
    salt,
    versionNumber,
  } = useCandidateStore()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTxSuccess, setIsTxSuccess] = useState(false)
  const [showUpdateWarning, setShowUpdateWarning] = useState(false)

  // Flatten transactions from bundles
  const allTransactions = React.useMemo(() => {
    return transactions.flatMap((bundle) => bundle.transactions)
  }, [transactions])

  const targets = React.useMemo(
    () => allTransactions.map((tx) => tx.target),
    [allTransactions]
  )
  const values = React.useMemo(
    () => allTransactions.map((tx) => BigInt(tx.value)),
    [allTransactions]
  )
  const calldatas = React.useMemo(
    () => allTransactions.map((tx) => tx.calldata as Hex),
    [allTransactions]
  )

  const transactionBundles = React.useMemo(
    () =>
      transactions.map((transaction) => ({
        type: transaction.type,
        summary: transaction.summary,
        callCount: transaction.transactions.length,
      })),
    [transactions]
  )

  // Use the same proposal-shaped metadata contract as proposals.
  const description = React.useMemo(
    () =>
      buildCandidateDescription({
        title,
        summary,
        discussionUrl,
        transactionBundles,
      }),
    [discussionUrl, summary, title, transactionBundles]
  )

  // Generate candidateId and salt if not exists
  const computedSalt = React.useMemo(() => {
    if (salt) return salt as Hex
    // Generate random salt
    const randomBytes = crypto.getRandomValues(new Uint8Array(32))
    return toHex(randomBytes)
  }, [salt])

  const computedCandidateId = React.useMemo(() => {
    if (candidateId) return candidateId as Hex
    // Generate candidateId from hash(daoAddress + salt)
    return keccak256(toBytes(`${addresses.token}${computedSalt}`))
  }, [candidateId, addresses.token, computedSalt])

  const computedVersionNumber = React.useMemo(() => {
    if (versionNumber) return versionNumber
    return 1
  }, [versionNumber])

  const canSubmit = React.useMemo(() => {
    return (
      !!address && !!title && !!summary && allTransactions.length > 0 && !!addresses.token
    )
  }, [address, title, summary, allTransactions.length, addresses.token])

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return

    setIsTxSuccess(false)
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const params: CandidateAttestationParams = {
        config,
        chainId: chain.id,
        daoTokenAddress: addresses.token!,
        candidateId: computedCandidateId,
        salt: computedSalt,
        versionNumber: computedVersionNumber,
        targets,
        values,
        calldatas,
        description,
        proposalId: zeroHash,
      }

      const result = await attestCandidate(params)

      setIsTxSuccess(true)

      if (onSuccess) {
        onSuccess(computedCandidateId, result.attestationUID)
      }
    } catch (err: unknown) {
      console.error('Error submitting candidate:', err)
      const message = getErrorMessage(err)
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [
    canSubmit,
    config,
    chain.id,
    addresses.token,
    computedCandidateId,
    computedSalt,
    computedVersionNumber,
    targets,
    values,
    calldatas,
    description,
    onSuccess,
  ])

  const handleUpdateClick = () => {
    if (isUpdate) {
      setShowUpdateWarning(true)
    } else {
      handleSubmit()
    }
  }

  const handleConfirmUpdate = () => {
    setShowUpdateWarning(false)
    handleSubmit()
  }

  const handleCloseModal = () => {
    setIsTxSuccess(false)
    setErrorMessage(null)
    setShowUpdateWarning(false)
  }

  return (
    <>
      <Stack gap="x6">
        <Box>
          <Text fontWeight="label" mb="x2">
            Review Candidate
          </Text>
          <Stack gap="x3" p="x4" backgroundColor="background2" borderRadius="curved">
            <Box>
              <Text fontSize={14} fontWeight="label" color="text3">
                Title
              </Text>
              <Text>{title}</Text>
            </Box>
            <Box>
              <Text fontSize={14} fontWeight="label" color="text3">
                Summary
              </Text>
              <MarkdownDisplay>{summary || ''}</MarkdownDisplay>
            </Box>
            {discussionUrl && (
              <Box>
                <Text fontSize={14} fontWeight="label" color="text3">
                  Discussion URL
                </Text>
                <Text
                  as="a"
                  href={discussionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'underline' }}
                >
                  {discussionUrl}
                </Text>
              </Box>
            )}
            <Box>
              <Text fontSize={14} fontWeight="label" color="text3">
                Transactions
              </Text>
              <Text>
                {allTransactions.length} transaction{allTransactions.length !== 1 && 's'}
              </Text>
            </Box>
            {isUpdate && (
              <Box
                p="x3"
                backgroundColor="background2"
                borderRadius="curved"
                style={{ border: '1px solid rgba(255, 100, 100, 0.3)' }}
              >
                <Text fontSize={14} color="text1" fontWeight="label">
                  ⚠️ Update Warning
                </Text>
                <Text fontSize={14} color="text2" mt="x2">
                  Creating a new version will reset all existing signatures. Sponsors must
                  re-sign the updated version.
                </Text>
              </Box>
            )}
          </Stack>
        </Box>

        <Flex justify="space-between">
          {onBack && (
            <Button variant="secondary" onClick={onBack}>
              Back
            </Button>
          )}
          <Button onClick={handleUpdateClick} disabled={!canSubmit || isSubmitting}>
            {isUpdate ? 'Update Candidate' : 'Submit Candidate'}
          </Button>
        </Flex>
      </Stack>

      {/* Update Warning Modal */}
      <AnimatedModal open={showUpdateWarning} close={handleCloseModal}>
        <Stack gap="x4" p="x6">
          <Text variant="heading-sm">Confirm Update</Text>
          <Text>
            Creating a new version will invalidate all existing signatures. Sponsors will
            need to re-sign the updated version.
          </Text>
          <Text fontWeight="label">Do you want to continue?</Text>
          <Flex gap="x3" justify="flex-end">
            <Button variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleConfirmUpdate}>Confirm Update</Button>
          </Flex>
        </Stack>
      </AnimatedModal>

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
              ? isUpdate
                ? 'Candidate Updated'
                : 'Candidate Created'
              : errorMessage
                ? 'Transaction Failed'
                : isUpdate
                  ? 'Updating Candidate...'
                  : 'Creating Candidate...'
          }
          subtitle={
            isTxSuccess
              ? isUpdate
                ? 'Your candidate has been updated successfully.'
                : 'Your candidate has been created successfully.'
              : errorMessage
                ? errorMessage
                : 'Please confirm the transaction in your wallet.'
          }
        />
      </AnimatedModal>
    </>
  )
}
