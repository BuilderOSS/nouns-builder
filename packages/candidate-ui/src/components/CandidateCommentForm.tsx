import { useEnsData } from '@buildeross/hooks'
import {
  attestCandidateComment,
  attestCommentWithSignature,
  CandidateVoteSupportEnum,
} from '@buildeross/sdk'
import { governorAbi } from '@buildeross/sdk/contract'
import { CandidateVoteSupport } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { ContractButton, TextArea, Toggle, WalletIdentity } from '@buildeross/ui'
import { getErrorMessage } from '@buildeross/utils/errors'
import { walletSnippet } from '@buildeross/utils/helpers'
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

const candidateSupportMeta: Record<
  CandidateVoteSupport,
  { label: string; color: string }
> = {
  [CandidateVoteSupport.For]: { label: 'For', color: theme.colors.positive },
  [CandidateVoteSupport.Against]: { label: 'Against', color: theme.colors.negative },
  [CandidateVoteSupport.Abstain]: { label: 'Abstain', color: theme.colors.text4 },
  [CandidateVoteSupport.None]: { label: 'None', color: theme.colors.text4 },
}

export interface CandidateCommentReplyTo {
  id: Hex
  commenter: Hex
  comment: string
  support: CandidateVoteSupport
  voteWeight: bigint
}

export interface CandidateCommentFormProps {
  candidateId: Hex
  proposalHash: Hex
  proposer: `0x${string}`
  governorAddress: `0x${string}`
  tokenSymbol: string
  onSuccess?: (result: {
    withSignature: boolean
    isReply: boolean
    hasSignal: boolean
  }) => void
  parentCommentUID?: Hex
  replyTo?: CandidateCommentReplyTo
  hasUserSignaled?: boolean
  hasVotingPower?: boolean
}

export const CandidateCommentForm: React.FC<CandidateCommentFormProps> = ({
  candidateId,
  proposalHash,
  proposer,
  governorAddress,
  tokenSymbol,
  onSuccess,
  parentCommentUID,
  replyTo,
  hasUserSignaled = false,
  hasVotingPower = true,
}) => {
  const config = useConfig()
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()
  const { ensName: replyToEnsName, ensAvatar: replyToEnsAvatar } = useEnsData(
    replyTo?.commenter
  )
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
      // When replying, comment is required (no signals allowed)
      // When not replying, either comment OR signal is required
      (replyTo
        ? comment.trim().length > 0
        : comment.trim().length > 0 || signalEnabled) &&
      (!shouldSign || nonce !== undefined)
    )
  }, [address, addresses.token, comment, signalEnabled, shouldSign, nonce, replyTo])

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
          proposalHash,
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

      // Call parent success with submission details
      if (onSuccess) {
        onSuccess({
          withSignature,
          isReply: !!replyTo,
          hasSignal: actualSupport !== CandidateVoteSupportEnum.NONE,
        })
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
    proposalHash,
    proposer,
    nonce,
    deadline,
    comment,
    parentCommentUID,
    replyTo,
    onSuccess,
  ])

  return (
    <Stack gap={{ '@initial': 'x4', '@768': 'x6' }}>
      {/* Replying to section */}
      {replyTo && (
        <Box>
          <Text fontSize={14} fontWeight="label" mb="x2">
            Replying to:
          </Text>
          <Flex
            direction="column"
            backgroundColor="background2"
            px="x3"
            py="x2"
            borderRadius="curved"
            borderWidth="normal"
            borderStyle="solid"
            borderColor="border"
            gap="x2"
          >
            <WalletIdentity
              address={replyTo.commenter as `0x${string}`}
              displayName={replyToEnsName || walletSnippet(replyTo.commenter)}
              avatarSrc={replyToEnsAvatar || undefined}
              avatarSize="16"
              nameVariant="label-sm"
              nameWeight="label"
              gap="x1"
            />
            {/* Signal badges - show if comment has a signal */}
            {replyTo.support !== CandidateVoteSupport.None && replyTo.voteWeight > 0n && (
              <Flex align="center" gap="x2" pl="x2">
                <Box
                  style={{
                    padding: '4px 8px',
                    borderRadius: 999,
                    background: candidateSupportMeta[replyTo.support].color,
                    color: theme.colors.onAccent,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {candidateSupportMeta[replyTo.support].label}
                </Box>
                <Text color="text3" fontSize={12}>
                  {replyTo.voteWeight.toString()} signal weight
                </Text>
              </Flex>
            )}
            {replyTo.comment.trim().length > 0 && (
              <Text
                fontSize={14}
                color="text2"
                pl="x2"
                style={{
                  whiteSpace: 'pre-wrap',
                  maxHeight: '100px',
                  overflow: 'auto',
                }}
              >
                {replyTo.comment.length > 200
                  ? `${replyTo.comment.slice(0, 200)}...`
                  : replyTo.comment}
              </Text>
            )}
          </Flex>
        </Box>
      )}

      {/* Show informational message if user can't signal - but not when replying */}
      {hasUserSignaled && !replyTo && (
        <Box
          p="x4"
          borderRadius="curved"
          borderWidth="normal"
          borderStyle="solid"
          borderColor="border"
          backgroundColor="background2"
        >
          <Text fontSize={14} color="text2">
            You have already signaled on this version. You can add additional comments
            below.
          </Text>
        </Box>
      )}

      {!hasVotingPower && !hasUserSignaled && !replyTo && (
        <Box
          p="x4"
          borderRadius="curved"
          borderWidth="normal"
          borderStyle="solid"
          borderColor="border"
          backgroundColor="background2"
        >
          <Text fontSize={14} color="text2">
            You need to hold {tokenSymbol} tokens to signal on candidates.
          </Text>
        </Box>
      )}

      {/* Primary Toggle: Enable Signaling - Only show if user can signal and not replying */}
      {!hasUserSignaled && hasVotingPower && !replyTo && (
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
      )}

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
        inputLabel={replyTo ? 'Reply' : signalEnabled ? 'Comment (Optional)' : 'Comment'}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setComment(e.target.value)
        }
        placeholder={replyTo ? 'Write your reply...' : 'Share your thoughts...'}
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
              {shouldSign && (
                <Text fontSize={12} color="text3" mt="x2" style={{ fontStyle: 'italic' }}>
                  Note: You'll be asked to sign twice - once for the signature, then to
                  submit on-chain.
                </Text>
              )}
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
          {replyTo
            ? 'Submit Reply'
            : shouldSign
              ? 'Signal & Sign'
              : signalEnabled && hasVotingPower && !hasUserSignaled
                ? 'Submit Signal'
                : 'Add Comment'}
        </ContractButton>
      </Flex>
    </Stack>
  )
}
