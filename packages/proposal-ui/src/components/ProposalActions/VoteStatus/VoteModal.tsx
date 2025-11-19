import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { governorAbi } from '@buildeross/sdk/contract'
import { getProposal } from '@buildeross/sdk/subgraph'
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
import React, { Fragment, useCallback, useMemo } from 'react'
import { useSWRConfig } from 'swr'
import { Hex } from 'viem'
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
  proposalId: string
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
  const [isCastVoteSuccess, setIsCastVoteSuccess] = React.useState<boolean>(false)

  const handleModalClose = useCallback(() => {
    setShowVoteModal(false)
    if (isCastVoteSuccess && onSuccess) {
      onSuccess()
    }
  }, [setShowVoteModal, isCastVoteSuccess, onSuccess])

  return (
    <Fragment>
      {/* Vote Modal */}
      <AnimatedModal
        open={showVoteModal}
        size={isCastVoteSuccess ? 'small' : 'medium'}
        close={handleModalClose}
      >
        {isCastVoteSuccess ? (
          <SuccessModalContent
            success={true}
            title={'Vote Submitted'}
            subtitle={`You’ve successfully voted on this proposal`}
          />
        ) : (
          <SubmitVoteForm
            proposalId={proposalId}
            votesAvailable={votesAvailable}
            handleModalClose={handleModalClose}
            setIsCastVoteSuccess={setIsCastVoteSuccess}
            title={title}
            addresses={addressesProp}
            chainId={chainIdProp}
          />
        )}
      </AnimatedModal>
    </Fragment>
  )
}

const SubmitVoteForm: React.FC<{
  proposalId: string
  votesAvailable: number
  handleModalClose: () => void
  setIsCastVoteSuccess: (show: boolean) => void
  title: string
  addresses?: RequiredDaoContractAddresses
  chainId?: CHAIN_ID
}> = ({
  proposalId,
  votesAvailable,
  handleModalClose,
  title,
  setIsCastVoteSuccess,
  addresses: addressesProp,
  chainId: chainIdProp,
}) => {
  const storeAddresses = useDaoStore((state) => state.addresses)
  const storeChain = useChainStore((state) => state.chain)

  // Use prop values if provided, otherwise fall back to store
  const addresses = addressesProp || storeAddresses
  const chain = chainIdProp ? { id: chainIdProp } : storeChain

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
      if (!addresses.governor) return

      try {
        const governorContractParams = {
          address: addresses.governor,
          abi: governorAbi,
          chainId: chain.id,
        }

        let txHash: Hex
        if (values.reason.length > 0) {
          const data = await simulateContract(config, {
            ...governorContractParams,
            functionName: 'castVoteWithReason',
            args: [
              proposalId as BytesType,
              BigInt(values.choice as Choice),
              values.reason,
            ],
          })
          txHash = await writeContract(config, data.request)
        } else {
          const data = await simulateContract(config, {
            ...governorContractParams,
            functionName: 'castVote',
            args: [proposalId as BytesType, BigInt(values.choice!)],
          })
          txHash = await writeContract(config, data.request)
        }

        await waitForTransactionReceipt(config, { hash: txHash, chainId: chain.id })

        await mutate(
          [SWR_KEYS.PROPOSAL, chain.id, proposalId],
          getProposal(chain.id, proposalId)
        )

        setIsCastVoteSuccess(true)
      } catch (err) {
        console.error('Error casting vote:', err)
      }
    },
    [addresses.governor, chain.id, proposalId, config, mutate, setIsCastVoteSuccess]
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
      <Flex justify={'space-between'}>
        <Box>
          <Text variant="heading-md" className={voteModalFormTitle}>
            {votesAvailable === 0 ? 'Submit Vote' : 'Submit Votes'}
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
                chainId={chain.id}
                loading={isSubmitting}
                disabled={!values.choice}
                w="100%"
                size="lg"
                mt="x8"
                borderRadius="curved"
                handleClick={handleSubmit}
              >
                Submit vote
              </ContractButton>
            </fieldset>
          </form>
        )}
      </Formik>
    </Box>
  )
}
