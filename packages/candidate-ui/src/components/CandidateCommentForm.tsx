import {
  attestCandidateComment,
  attestCommentWithSignature,
  CandidateVoteSupportEnum,
} from '@buildeross/sdk'
import { governorAbi } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { ContractButton, TextArea, Toggle } from '@buildeross/ui'
import { getErrorMessage } from '@buildeross/utils/errors'
import type { IconType } from '@buildeross/zord'
import { Box, Flex, Icon, Stack, Text, theme, vars } from '@buildeross/zord'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { type Hex } from 'viem'
import { useAccount, useConfig, useReadContract, useWalletClient } from 'wagmi'

import {
  CANDIDATE_SIGNATURE_VALIDITY_DAYS,
  CANDIDATE_SIGNATURE_VALIDITY_SECONDS,
} from '../utils/candidateProposal'
import {
  signalOption,
  signalOptionText,
  signalRadioInput,
  sponsorBadge,
  sponsorCard,
  sponsorLabel,
} from './CandidateCommentForm.css'

export interface CandidateCommentFormProps {
  candidateId: Hex
  proposalId: Hex
  proposer: `0x${string}`
  governorAddress: `0x${string}`
  tokenSymbol: string
  onSuccess?: (withSignature: boolean) => void
  parentCommentUID?: Hex
}

export const CandidateCommentForm: React.FC<CandidateCommentFormProps> = ({
  candidateId,
  proposalId,
  proposer,
  governorAddress,
  tokenSymbol,
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
  const isCreator = useMemo(
    () => !!address && address.toLowerCase() === proposer.toLowerCase(),
    [address, proposer]
  )

  // State
  const [signalEnabled, setSignalEnabled] = useState(false)
  const [support, setSupport] = useState<CandidateVoteSupportEnum>(
    CandidateVoteSupportEnum.FOR
  )
  const [comment, setComment] = useState('')
  const [shouldSign, setShouldSign] = useState(false)
  const [deadline] = useState(
    Math.floor(Date.now() / 1000) + CANDIDATE_SIGNATURE_VALIDITY_SECONDS
  )

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // When signal toggle changes
  useEffect(() => {
    if (!signalEnabled) {
      setShouldSign(false)
    }
  }, [signalEnabled])

  // Signal options configuration
  const signalOptions = useMemo(
    () => [
      {
        text: 'Signal For',
        value: CandidateVoteSupportEnum.FOR,
        icon: {
          id: 'check' as IconType,
          fill: 'positive' as const,
          activeBackground: vars.color.positiveActive,
        },
      },
      {
        text: 'Signal Against',
        value: CandidateVoteSupportEnum.AGAINST,
        icon: {
          id: 'cross' as IconType,
          fill: 'negative' as const,
          activeBackground: vars.color.negativeActive,
        },
      },
      {
        text: 'Signal Abstain',
        value: CandidateVoteSupportEnum.ABSTAIN,
        icon: {
          id: 'dash' as IconType,
          fill: 'neutral' as const,
          activeBackground: vars.color.neutralHover,
        },
      },
    ],
    []
  )

  const canSubmit = useMemo(() => {
    return (
      !!address &&
      !!addresses.token &&
      (comment.trim().length > 0 || signalEnabled) &&
      (!shouldSign || nonce !== undefined)
    )
  }, [address, addresses.token, comment, signalEnabled, shouldSign, nonce])

  const canSign = useMemo(() => {
    return (
      support === CandidateVoteSupportEnum.FOR &&
      !isCreator &&
      nonce !== undefined &&
      !!walletClient
    )
  }, [isCreator, support, nonce, walletClient])

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !address) return

    setErrorMessage(null)
    setIsSubmitting(true)

    const withSignature = shouldSign && canSign
    const actualSupport = signalEnabled ? support : CandidateVoteSupportEnum.NONE

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
          proposalId,
          signer: address,
          proposer,
          nonce: nonce as bigint,
          deadline,
          support: actualSupport,
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
          support: actualSupport,
          comment: comment.trim(),
          parentCommentUID,
        })
      }

      // Reset form
      setComment('')
      setShouldSign(false)
      setSignalEnabled(false)
      setSupport(CandidateVoteSupportEnum.FOR)

      // Call parent success with signature status
      if (onSuccess) {
        onSuccess(withSignature)
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
    signalEnabled,
    support,
    walletClient,
    config,
    chain.id,
    addresses.token,
    governorAddress,
    tokenSymbol,
    candidateId,
    proposalId,
    proposer,
    nonce,
    deadline,
    comment,
    parentCommentUID,
    onSuccess,
  ])

  return (
    <Stack gap={{ '@initial': 'x4', '@768': 'x6' }}>
      {/* Primary Toggle: Enable Signaling */}
      <Flex align="center" justify="space-between" gap="x3">
        <Box>
          <Text fontSize={16} fontWeight="label">
            Signal on this candidate
          </Text>
          <Text fontSize={12} color="text3" mt="x1">
            Show your support for or against this candidate
          </Text>
        </Box>
        <Toggle on={signalEnabled} onToggle={() => setSignalEnabled(!signalEnabled)} />
      </Flex>

      {/* Signal Options (VoteModal style) - Only when enabled */}
      {signalEnabled && (
        <Stack gap={{ '@initial': 'x2', '@768': 'x3' }}>
          {signalOptions.map(({ text, value, icon }) => {
            const active = support === value
            return (
              <label key={value}>
                <Flex
                  className={signalOption}
                  data-is-active-positive={
                    value === CandidateVoteSupportEnum.FOR && active ? 'true' : 'false'
                  }
                  data-is-active-negative={
                    value === CandidateVoteSupportEnum.AGAINST && active
                      ? 'true'
                      : 'false'
                  }
                  data-is-active-neutral={
                    value === CandidateVoteSupportEnum.ABSTAIN && active
                      ? 'true'
                      : 'false'
                  }
                >
                  <input
                    type="radio"
                    name="support"
                    value={value}
                    checked={active}
                    onChange={() => {
                      setSupport(value)
                      if (value !== CandidateVoteSupportEnum.FOR) {
                        setShouldSign(false)
                      }
                    }}
                    className={signalRadioInput}
                  />
                  <Text className={signalOptionText}>{text}</Text>
                  <Box position="absolute" top="x4" right="x4">
                    <Icon
                      id={icon.id}
                      borderRadius="round"
                      p="x1"
                      style={{
                        backgroundColor: active
                          ? icon.activeBackground
                          : theme.colors.background1,
                      }}
                      fill={active ? 'onAccent' : icon.fill}
                    />
                  </Box>
                </Flex>
              </label>
            )
          })}
        </Stack>
      )}

      {/* Comment Section - Always visible */}
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

      {/* Sponsor Toggle - Only when FOR is selected */}
      {signalEnabled && support === CandidateVoteSupportEnum.FOR && !isCreator && (
        <Box className={sponsorCard} data-is-active={shouldSign ? 'true' : 'false'}>
          <Flex align="center" justify="space-between" gap="x3">
            <Box style={{ flex: 1 }}>
              <Flex align="center" gap="x2" mb="x1">
                <Text className={sponsorLabel}>Also sponsor this candidate</Text>
              </Flex>
              <Text fontSize={12} color="text3">
                Your signature will be used when promoting this to a proposal
              </Text>
              <Flex align="center" gap="x2" mt="x2">
                <Box className={sponsorBadge}>
                  Valid for {CANDIDATE_SIGNATURE_VALIDITY_DAYS} days
                </Box>
              </Flex>
            </Box>
            <Toggle on={shouldSign} onToggle={() => setShouldSign(!shouldSign)} />
          </Flex>
        </Box>
      )}

      {shouldSign && isNonceLoading && (
        <Text fontSize={14} color="text3">
          Loading signature nonce...
        </Text>
      )}

      {isCreator && signalEnabled && support === CandidateVoteSupportEnum.FOR && (
        <Text fontSize={14} color="text3">
          Candidate creators can signal and comment, but cannot sponsor their own
          candidate.
        </Text>
      )}

      {/* Error Display */}
      {errorMessage && (
        <Text color="negative" fontSize={14}>
          {errorMessage}
        </Text>
      )}

      {/* Submit Button */}
      <Flex justify={{ '@initial': 'stretch', '@768': 'flex-end' }}>
        <ContractButton
          chainId={chain.id}
          handleClick={handleSubmit}
          disabled={!canSubmit}
          loading={isSubmitting}
          style={{ width: '100%' }}
        >
          {shouldSign ? 'Signal & Sign' : signalEnabled ? 'Submit Signal' : 'Add Comment'}
        </ContractButton>
      </Flex>
    </Stack>
  )
}
