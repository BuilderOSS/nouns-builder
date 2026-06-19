import { MobileProposalActionBar } from '@buildeross/create-proposal-ui'
import { decodeTransactions } from '@buildeross/hooks'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import {
  BundledDecodedTransactions,
  ProposalContentCard,
  ProposalMarkdown,
  ProposalSection,
} from '@buildeross/proposal-ui'
import { attestCandidate, type CandidateAttestationParams } from '@buildeross/sdk'
import { useCandidateStore, useChainStore, useDaoStore } from '@buildeross/stores'
import { type ProposalDescriptionMetadataV1 } from '@buildeross/types'
import { WalletIdentityWithPreview } from '@buildeross/ui'
import { AnimatedModal, SuccessModalContent } from '@buildeross/ui/Modal'
import { getErrorMessage } from '@buildeross/utils/errors'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import React, { useCallback, useState } from 'react'
import useSWR from 'swr'
import { type Hex, keccak256, toBytes, toHex } from 'viem'
import { useAccount, useConfig } from 'wagmi'

import { buildCandidateDescription } from '../utils/buildCandidateDescription'
import { getCandidateProposalId } from '../utils/candidateProposal'

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
  const { displayName, ensAvatar } = useEnsData(address)
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

  const proposalMetadata = React.useMemo(() => {
    try {
      return JSON.parse(
        buildCandidateDescription({
          title,
          summary,
          discussionUrl,
          transactionBundles,
        })
      ) as ProposalDescriptionMetadataV1
    } catch {
      return undefined
    }
  }, [discussionUrl, summary, title, transactionBundles])

  const { data: decodedTransactions, isLoading: isDecodingTransactions } = useSWR(
    allTransactions.length > 0
      ? ([
          'candidate-submit-decoded-transactions',
          chain.id,
          targets,
          calldatas,
          values,
        ] as const)
      : null,
    ([, chainId, _targets, _calldatas, _values]) =>
      decodeTransactions(
        chainId,
        _targets as string[],
        _calldatas as string[],
        (_values as bigint[]).map((value) => value.toString())
      ),
    { revalidateOnFocus: false }
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
    if (!canSubmit || !address) return

    setIsTxSuccess(false)
    setErrorMessage(null)
    setIsSubmitting(true)

    const proposalId = getCandidateProposalId({
      targets,
      values,
      calldatas,
      description,
      proposer: address,
    })

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
        proposalId,
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
    address,
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
        <ProposalContentCard>
          <ProposalSection title="Title">
            <Text fontSize={28} fontWeight="display">
              {title}
            </Text>
            {address && (
              <Flex
                color={'text3'}
                mt={'x2'}
                align="center"
                gap="x2"
                wrap
                style={{ minWidth: 0 }}
              >
                <Text color={'text3'}>By</Text>
                <WalletIdentityWithPreview
                  address={address}
                  displayName={displayName}
                  avatarSrc={ensAvatar}
                  avatarSize="20"
                  nameVariant="paragraph-sm"
                  mobileTapBehavior="toggle"
                  inline
                />
              </Flex>
            )}
          </ProposalSection>
          <ProposalSection title="Summary">
            <ProposalMarkdown>{summary || ''}</ProposalMarkdown>
          </ProposalSection>
          {discussionUrl && (
            <ProposalSection title="Discussion">
              <Text
                as="a"
                href={discussionUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'underline' }}
              >
                {discussionUrl}
              </Text>
            </ProposalSection>
          )}
          <ProposalSection title="Transactions">
            {isDecodingTransactions && !decodedTransactions ? (
              <Text color="text3">Loading transaction details...</Text>
            ) : (
              <BundledDecodedTransactions
                chainId={chain.id}
                addresses={addresses}
                decodedTransactions={decodedTransactions}
                proposalMetadata={proposalMetadata}
                transactionBundles={transactionBundles}
                isDecoding={isDecodingTransactions}
              />
            )}
          </ProposalSection>
        </ProposalContentCard>

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

        <Flex justify="space-between" display={{ '@initial': 'none', '@768': 'flex' }}>
          {onBack && (
            <Button variant="secondary" onClick={onBack}>
              Back
            </Button>
          )}
          <Button onClick={handleUpdateClick} disabled={!canSubmit || isSubmitting}>
            {isUpdate ? 'Update Candidate' : 'Submit Candidate'}
          </Button>
        </Flex>

        <MobileProposalActionBar
          showBack={!!onBack}
          onBack={onBack}
          showQueue={false}
          showReset={false}
          showContinue
          onContinue={handleUpdateClick}
          continueDisabled={!canSubmit || isSubmitting}
          continueLoading={isSubmitting}
          continueLabel={isUpdate ? 'Update Candidate' : 'Submit Candidate'}
        />
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
