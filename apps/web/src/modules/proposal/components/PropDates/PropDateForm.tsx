import {
  AttestationParams,
  EAS_CONTRACT_ADDRESS,
  easAbi,
  PROPDATE_SCHEMA,
  PROPDATE_SCHEMA_UID,
} from '@buildeross/constants/eas'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { MessageType, type PropDate } from '@buildeross/sdk/eas'
import { CHAIN_ID } from '@buildeross/types'
import { Avatar } from '@buildeross/ui/Avatar'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { MarkdownEditor } from '@buildeross/ui/MarkdownEditor'
import { AnimatedModal, SuccessModalContent } from '@buildeross/ui/Modal'
import { defaultInputLabelStyle } from '@buildeross/ui/styles'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Select, Text } from '@buildeross/zord'
import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk'
import { InvoiceMetadata } from '@smartinvoicexyz/types'
import { Field, FieldProps, Form, Formik } from 'formik'
import { useCallback, useMemo, useState } from 'react'
import { useChainStore, useDaoStore } from 'src/stores'
import { getAddress, type Hex, zeroHash } from 'viem'
import { useConfig } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'
import * as Yup from 'yup'

const propDateValidationSchema = Yup.object().shape({
  milestoneId: Yup.number(),
  proposalId: Yup.string()
    .required('Proposal ID (bytes32) is required')
    .matches(
      /^0x[a-fA-F0-9]{64}$/,
      'Proposal ID must be a valid bytes32 hex string (e.g., 0x...)'
    ),
  replyTo: Yup.string(),
  message: Yup.string().required('Message is required'),
})

interface PropDateFormValues {
  milestoneId: number
  proposalId: string
  replyTo: string
  message: string
}

const getErrorMessage = (error: unknown): string => {
  if (!error) return 'An unknown error occurred.'
  if (typeof error === 'string') return error
  if (typeof error === 'object' && error !== null) {
    // Type assertion with Record to handle potential properties
    const errorObj = error as Record<string, unknown>
    if ('shortMessage' in errorObj && typeof errorObj.shortMessage === 'string') {
      return errorObj.shortMessage
    }
    if ('message' in errorObj && typeof errorObj.message === 'string') {
      return errorObj.message
    }
  }
  return 'An unknown error occurred.'
}

export const PropDateForm = ({
  closeForm,
  onSuccess,
  proposalId,
  replyTo,
  invoiceData,
}: {
  closeForm: () => void
  onSuccess: () => void
  proposalId: string
  replyTo?: PropDate
  invoiceData?: InvoiceMetadata
}) => {
  const initialValues = useMemo(
    () =>
      ({
        milestoneId: -1,
        proposalId: proposalId,
        replyTo: replyTo?.txid ?? zeroHash,
        message: '',
      }) as PropDateFormValues,
    [proposalId, replyTo?.txid]
  )
  const { id: chainId } = useChainStore((x) => x.chain)
  const {
    addresses: { token },
  } = useDaoStore()
  const config = useConfig()

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTxSuccess, setIsTxSuccess] = useState(false)

  const { ensName: replyToEnsName, ensAvatar: replyToEnsAvatar } = useEnsData(
    replyTo?.attester
  )

  const handleSubmit = useCallback(
    async (values: PropDateFormValues) => {
      setIsTxSuccess(false)
      setErrorMessage(null)

      if (!token) {
        return
      }

      const easContractAddress = EAS_CONTRACT_ADDRESS[chainId as CHAIN_ID]
      if (!easContractAddress) {
        setErrorMessage('Propdates are not supported on this network.')
        return
      }

      setIsSubmitting(true)
      const encodedData = (() => {
        const originalMessageId = values.replyTo ? (values.replyTo as Hex) : zeroHash

        const milestoneId = values.milestoneId
        let message = values.message
        let messageType = MessageType.INLINE_TEXT

        if (Number(milestoneId) >= 0) {
          const messageJSON = {
            milestoneId: Number(milestoneId),
            content: values.message,
          }
          message = JSON.stringify(messageJSON)
          messageType = MessageType.INLINE_JSON
        }

        const schemaEncoder = new SchemaEncoder(PROPDATE_SCHEMA)

        return schemaEncoder.encodeData([
          { name: 'proposalId', value: values.proposalId as Hex, type: 'bytes32' },
          { name: 'originalMessageId', value: originalMessageId, type: 'bytes32' },
          { name: 'messageType', value: messageType, type: 'uint8' },
          { name: 'message', value: message, type: 'string' },
        ]) as Hex
      })()

      const attestParams: AttestationParams = {
        schema: PROPDATE_SCHEMA_UID,
        data: {
          recipient: getAddress(token),
          expirationTime: 0n,
          revocable: true,
          refUID: zeroHash,
          data: encodedData,
          value: 0n,
        },
      }

      try {
        const data = await simulateContract(config, {
          address: easContractAddress,
          abi: easAbi,
          functionName: 'attest',
          chainId: chainId,
          args: [attestParams],
        })
        const txHash = await writeContract(config, data.request)
        await waitForTransactionReceipt(config, { hash: txHash, chainId: chainId })
        setIsTxSuccess(true)
      } catch (err: unknown) {
        console.error('Error submitting propdate (signing):', err)
        const message = getErrorMessage(err)
        setErrorMessage(message)
      } finally {
        setIsSubmitting(false)
      }
    },
    [chainId, config, token]
  )

  const handleCloseModal = useCallback(() => {
    onSuccess()
    setIsTxSuccess(false)
  }, [onSuccess])

  return (
    <Box
      p="x6"
      borderColor="border"
      borderStyle="solid"
      borderRadius="curved"
      borderWidth="normal"
      backgroundColor="background1"
      mb="x6"
    >
      <Flex justify="space-between" mb="x4" align="center">
        <Text fontSize={20} fontWeight="label">
          Create Propdate
        </Text>
      </Flex>

      <Formik<PropDateFormValues>
        initialValues={initialValues}
        validationSchema={propDateValidationSchema}
        onSubmit={handleSubmit}
        validateOnMount={true}
      >
        {(formik) => (
          <Form>
            <Flex direction={'column'} w={'100%'} py="x2" pl="x2">
              {replyTo && (
                <Box pb="x8">
                  <Text variant="label-md" mb="x1">
                    Replying to:
                  </Text>
                  <ReplyTo
                    replyTo={replyTo}
                    ensName={replyToEnsName}
                    ensAvatar={replyToEnsAvatar}
                  />
                </Box>
              )}

              {!replyTo && !!invoiceData?.milestones && (
                <Flex direction={'column'} pb="x8">
                  <label className={defaultInputLabelStyle}>Milestone (optional)</label>
                  <Select
                    {...formik.getFieldProps(`milestoneId`)}
                    id="milestoneId"
                    defaultValue="-1"
                  >
                    <option key="not-specific-milestone" value={-1}>
                      No specific milestone
                    </option>
                    {invoiceData.milestones.map((milestone, i) => (
                      <option key={milestone.title} value={i}>
                        {milestone.title}
                      </option>
                    ))}
                  </Select>
                </Flex>
              )}

              <Field name="message" id={'message'}>
                {({ field }: FieldProps) => {
                  return (
                    <MarkdownEditor
                      disabled={isSubmitting}
                      value={field.value}
                      onChange={(value: string) =>
                        formik?.setFieldValue(field.name, value)
                      }
                      inputLabel={'Message'}
                      errorMessage={
                        formik.touched.message && formik.errors.message
                          ? formik.errors.message
                          : undefined
                      }
                    />
                  )
                }}
              </Field>

              {errorMessage && !isSubmitting && (
                <Text color="negative" mt="x2">
                  {errorMessage}
                </Text>
              )}

              <Flex justify="flex-end" mt="x2" gap="x2">
                <Button variant="ghost" onClick={closeForm} disabled={isSubmitting}>
                  Reset
                </Button>
                <ContractButton
                  chainId={chainId}
                  variant="primary"
                  disabled={!formik.isValid || isSubmitting}
                  loading={isSubmitting}
                  handleClick={formik.handleSubmit}
                >
                  Submit Propdate
                </ContractButton>
              </Flex>
            </Flex>
          </Form>
        )}
      </Formik>
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
              ? 'Propdate Submitted'
              : errorMessage
                ? 'Transaction Failed'
                : 'Submitting Propdate...'
          }
          subtitle={
            isTxSuccess
              ? 'Your propdate has been successfully submitted.'
              : errorMessage
                ? (errorMessage ?? 'An unknown error occurred.')
                : 'Please confirm the transaction in your wallet and wait for confirmation.'
          }
          actions={
            (isTxSuccess || errorMessage) && (
              <Button variant="primary" onClick={handleCloseModal}>
                Close
              </Button>
            )
          }
        />
      </AnimatedModal>
    </Box>
  )
}

const ReplyTo = ({
  replyTo,
  ensName,
  ensAvatar,
}: {
  replyTo: PropDate
  ensName?: string | null
  ensAvatar?: string | null
}) => {
  return (
    <Flex
      direction="column"
      backgroundColor="neutralActive"
      px="x3"
      py="x2"
      borderRadius="curved"
      mt="x2"
      style={{
        borderLeft: 'var(--space-x2) solid var(--colors-text4)',
      }}
      gap="x1"
    >
      <Flex align="center" gap="x1">
        <Avatar address={replyTo.attester} src={ensAvatar || undefined} size="16" />
        <Text variant={'label-sm'} fontWeight="label">
          {ensName || walletSnippet(replyTo.attester)}
        </Text>
      </Flex>
      <Text
        variant="paragraph-sm"
        color="text2"
        style={{
          wordBreak: 'break-word',
          paddingLeft: 'var(--space-x1)',
        }}
      >
        {replyTo.message}
      </Text>
    </Flex>
  )
}
