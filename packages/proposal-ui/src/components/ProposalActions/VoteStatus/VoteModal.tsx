import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { governorAbi } from '@buildeross/sdk/contract'
import { awaitSubgraphSync, getProposal } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { BytesType, CHAIN_ID, RequiredDaoContractAddresses } from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { AnimatedModal, SuccessModalContent } from '@buildeross/ui/Modal'
import {
  Atoms,
  Box,
  Button,
  Flex,
  Icon,
  IconType,
  Stack,
  Text,
  theme,
} from '@buildeross/zord'
import { Field, Formik } from 'formik'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSWRConfig } from 'swr'
import { useConfig } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import {
  voteModalFieldset,
  voteModalFormTitle,
  voteModalOption,
  voteModalOptionText,
  voteModalRadioInput,
  voteModalReason,
} from './VoteModal.css'

enum Choice {
  AGAINST = '0',
  FOR = '1',
  ABSTAIN = '2',
}

interface FormValues {
  choice: Choice | undefined
  reason: string
}

export interface VoteModalProps {
  title: string
  proposalId: BytesType
  votesAvailable: number
  showVoteModal: boolean
  setShowVoteModal: (show: boolean) => void
  addresses?: RequiredDaoContractAddresses
  chainId?: CHAIN_ID
  onSuccess?: () => void
}

export const VoteModal: React.FC<VoteModalProps> = ({
  title,
  proposalId,
  votesAvailable,
  showVoteModal,
  setShowVoteModal,
  addresses: addressesProp,
  chainId: chainIdProp,
  onSuccess,
}) => {
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current)
        successTimerRef.current = null
      }
    }
  }, [])

  const handleClose = () => {
    setShowVoteModal(false)
    setIsSuccess(false)

    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current)
      successTimerRef.current = null
    }
  }

  const handleSuccess = () => {
    setIsSuccess(true)
    onSuccess?.()
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current)
    }
    // Auto-close after 2 seconds
    successTimerRef.current = setTimeout(() => {
      handleClose()
    }, 2000)
  }

  return (
    <AnimatedModal
      open={showVoteModal}
      size={isSuccess ? 'small' : 'medium'}
      close={handleClose}
    >
      {isSuccess ? (
        <SuccessModalContent
          success={true}
          title={'Vote Submitted'}
          subtitle={`You’ve successfully voted on this proposal`}
        />
      ) : (
        <SubmitVoteForm
          proposalId={proposalId}
          votesAvailable={votesAvailable}
          handleModalClose={handleClose}
          onSuccess={handleSuccess}
          title={title}
          addresses={addressesProp}
          chainId={chainIdProp}
        />
      )}
    </AnimatedModal>
  )
}

export const SubmitVoteForm: React.FC<{
  proposalId: BytesType
  votesAvailable: number
  handleModalClose: () => void
  onSuccess: () => void
  title: string
  addresses?: RequiredDaoContractAddresses
  chainId?: CHAIN_ID
  hideHeader?: boolean
}> = ({
  proposalId,
  votesAvailable,
  handleModalClose,
  title,
  onSuccess,
  addresses: addressesProp,
  chainId: chainIdProp,
  hideHeader = false,
}) => {
  const storeAddresses = useDaoStore((state) => state.addresses)
  const storeChain = useChainStore((state) => state.chain)

  // Use prop values if provided, otherwise fall back to store
  const { governor: governorAddress } = addressesProp ?? storeAddresses ?? {}
  const chainId = chainIdProp ?? storeChain?.id

  const { mutate } = useSWRConfig()
  const initialValues: FormValues = useMemo(
    () => ({
      choice: undefined,
      reason: '',
    }),
    []
  )

  const config = useConfig()

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      if (!governorAddress || values.choice === undefined) return

      try {
        const hasReason = values.reason.length > 0
        const choice = BigInt(values.choice)

        const data = await simulateContract(config, {
          address: governorAddress,
          abi: governorAbi,
          chainId: chainId,
          functionName: hasReason ? 'castVoteWithReason' : 'castVote',
          args: hasReason ? [proposalId, choice, values.reason] : [proposalId, choice],
        })
        const txHash = await writeContract(config, data.request)

        const receipt = await waitForTransactionReceipt(config, {
          hash: txHash,
          chainId: chainId,
        })

        await awaitSubgraphSync(chainId, receipt.blockNumber)

        await mutate(
          [SWR_KEYS.PROPOSAL, chainId, proposalId.toLowerCase()],
          getProposal(chainId, proposalId)
        )

        onSuccess()
      } catch (err) {
        console.error('Error casting vote:', err)
      }
    },
    [governorAddress, chainId, proposalId, config, mutate, onSuccess]
  )

  const voteOptions = useMemo(
    () => [
      {
        text: `Cast ${votesAvailable} ${votesAvailable > 1 ? 'votes' : 'vote'} for`,
        value: Choice.FOR,
        icon: { id: 'check', fill: 'positive', activeBackground: '#1A8967' },
      },
      {
        text: `Cast ${votesAvailable} ${votesAvailable > 1 ? 'votes' : 'vote'} against`,
        value: Choice.AGAINST,
        icon: { id: 'cross', fill: 'negative', activeBackground: '#CD2D2D' },
      },
      {
        text: 'Abstain from voting',
        value: Choice.ABSTAIN,
        icon: { id: 'dash', fill: 'neutral', activeBackground: '#C4C4C4' },
      },
    ],
    [votesAvailable]
  )
  return (
    <Box>
      {!hideHeader && (
        <Flex justify={'space-between'}>
          <Box>
            <Text variant="heading-md" className={voteModalFormTitle}>
              {votesAvailable <= 1 ? 'Submit Vote' : 'Submit Votes'}
            </Text>
            <Text variant="paragraph-sm" color="tertiary">
              Proposal: {title}
            </Text>
          </Box>
          <Button
            variant="ghost"
            onClick={handleModalClose}
            p={'x0'}
            size="xs"
            style={{
              // prop padding does not change padding to 0
              padding: 0,
            }}
          >
            <Icon id="cross" />
          </Button>
        </Flex>
      )}

      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ values, isSubmitting, setFieldValue, handleSubmit }) => (
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <fieldset disabled={isSubmitting} className={voteModalFieldset}>
              <Stack role="group" mt="x6" gap="x3">
                {voteOptions.map(({ text, value, icon }) => {
                  const active = values.choice === value
                  return (
                    <label key={text}>
                      <Flex
                        backgroundColor="background2"
                        position="relative"
                        w="100%"
                        borderRadius="curved"
                        align="center"
                        justify="center"
                        borderColor="transparent"
                        p="x4"
                        h="x16"
                        className={voteModalOption}
                        data-is-active-negative={
                          value === Choice.AGAINST && values.choice === value
                        }
                        data-is-active-positive={
                          value === Choice.FOR && values.choice === value
                        }
                        data-is-active-neutral={
                          value === Choice.ABSTAIN && values.choice === value
                        }
                      >
                        <Field
                          type="radio"
                          name="choice"
                          value={value}
                          className={voteModalRadioInput}
                          position="absolute"
                          top={0}
                          left={0}
                        />
                        <Text className={voteModalOptionText} variant="paragraph-md">
                          {text}
                        </Text>
                        <Box position="absolute" top="x4" right="x4">
                          <Icon
                            id={icon.id as IconType}
                            borderRadius="round"
                            p={'x1'}
                            style={{
                              backgroundColor: active
                                ? icon.activeBackground
                                : theme.colors.background1,
                            }}
                            fill={active ? 'onAccent' : (icon.fill as Atoms['color'])}
                          />
                        </Box>
                      </Flex>
                    </label>
                  )
                })}
              </Stack>

              <Box mt="x5">
                <Text variant="paragraph-md" className={voteModalOptionText}>
                  Reason
                </Text>

                <Box
                  as="textarea"
                  name="reason"
                  borderRadius="curved"
                  p="x4"
                  mt="x2"
                  backgroundColor="background2"
                  height="x32"
                  width="100%"
                  value={values.reason}
                  className={voteModalReason}
                  onChange={(e: React.FormEvent<HTMLTextAreaElement>) =>
                    setFieldValue('reason', e.currentTarget.value)
                  }
                />

                <Text color="tertiary" mt="x2" variant="paragraph-md">
                  Optional
                </Text>
              </Box>

              <ContractButton
                chainId={chainId}
                disabled={!values.choice || isSubmitting}
                w="100%"
                size="lg"
                mt="x8"
                borderRadius="curved"
                handleClick={handleSubmit}
              >
                {isSubmitting ? 'Submitting...' : 'Submit vote'}
              </ContractButton>
            </fieldset>
          </form>
        )}
      </Formik>
    </Box>
  )
}
