import {
  AttestationParams,
  EAS_CONTRACT_ADDRESS,
  easAbi,
  ESCROW_DELEGATE_SCHEMA,
  ESCROW_DELEGATE_SCHEMA_UID,
} from '@buildeross/constants/eas'
import { useEscrowDelegate } from '@buildeross/hooks/useEscrowDelegate'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { Transaction, TransactionType } from '@buildeross/types'
import { SmartInput } from '@buildeross/ui/Fields'
import { getEnsAddress } from '@buildeross/utils/ens'
import { walletSnippet } from '@buildeross/utils/helpers'
import { addressValidationSchemaWithError } from '@buildeross/utils/yup'
import { Box, Button } from '@buildeross/zord'
import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk'
import { Form, Formik } from 'formik'
import { useCallback } from 'react'
import { encodeFunctionData, getAddress, Hex, isAddress, zeroHash } from 'viem'
import * as yup from 'yup'

interface EscrowDelegateFormValues {
  escrowDelegate: string
}

const escrowDelegateFormSchema = (_escrowDelegate: string | undefined) =>
  yup.object({
    escrowDelegate: addressValidationSchemaWithError(
      'Delegate address is invalid.',
      'Delegate address is required.'
    ).test(
      'not-escrow-delegate',
      'New delegate address must be different from the current delegate.',
      async (value) => {
        if (!_escrowDelegate || !value) {
          return true
        }
        if (_escrowDelegate?.toLowerCase() === value?.toLowerCase()) {
          return false
        }
        const valueAsAddress = await getEnsAddress(value)
        // Validate that the resolved value is actually a valid address
        if (!valueAsAddress || !isAddress(valueAsAddress, { strict: false })) {
          return false
        }
        return valueAsAddress?.toLowerCase() !== _escrowDelegate?.toLowerCase()
      }
    ),
  })

const schemaEncoder = new SchemaEncoder(ESCROW_DELEGATE_SCHEMA)

export const NominateEscrowDelegate: React.FC = () => {
  const { token, treasury } = useDaoStore((state) => state.addresses)
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const resetTransactionType = useProposalStore((state) => state.resetTransactionType)
  const chain = useChainStore((x) => x.chain)
  const { escrowDelegate } = useEscrowDelegate({
    chainId: chain.id,
    tokenAddress: token,
    treasuryAddress: treasury,
  })

  const handleNominateEscrowDelegateTransaction = useCallback(
    async (values: EscrowDelegateFormValues) => {
      const easContractAddress = EAS_CONTRACT_ADDRESS[chain.id]
      if (!token || !values.escrowDelegate || !easContractAddress) {
        return
      }
      const newEscrowDelegate = await getEnsAddress(values.escrowDelegate)
      // Validate that the resolved value is actually a valid address
      if (!newEscrowDelegate || !isAddress(newEscrowDelegate, { strict: false })) {
        console.error('Failed to resolve valid escrow delegate address')
        return
      }
      const encodedData = schemaEncoder.encodeData([
        { name: 'daoMultiSig', type: 'address', value: newEscrowDelegate },
      ]) as Hex

      const params: AttestationParams = {
        schema: ESCROW_DELEGATE_SCHEMA_UID,
        data: {
          recipient: getAddress(token),
          expirationTime: 0n,
          revocable: true,
          refUID: zeroHash,
          data: encodedData,
          value: 0n,
        },
      }

      const attest: Transaction = {
        target: easContractAddress,
        functionSignature:
          'attest((bytes32,(address,uint64,bool,bytes32,bytes,uint256)))',
        calldata: encodeFunctionData({
          abi: easAbi,
          functionName: 'attest',
          args: [params],
        }),
        value: '',
      }

      const displayName = isAddress(values.escrowDelegate, { strict: false })
        ? walletSnippet(values.escrowDelegate)
        : values.escrowDelegate

      addTransaction({
        type: TransactionType.NOMINATE_DELEGATE,
        summary: `Nominate ${displayName} as the delegate`,
        transactions: [attest],
      })
      resetTransactionType()
    },
    [addTransaction, chain.id, token, resetTransactionType]
  )

  const currentDelegate = escrowDelegate ?? treasury

  return (
    <Box w={'100%'}>
      <Formik<EscrowDelegateFormValues>
        initialValues={{
          escrowDelegate: '',
        }}
        validationSchema={escrowDelegateFormSchema(currentDelegate)}
        onSubmit={handleNominateEscrowDelegateTransaction}
        validateOnMount={true}
      >
        {(formik) => (
          <Form>
            <SmartInput
              type="text"
              formik={formik}
              {...formik.getFieldProps('escrowDelegate')}
              id="escrowDelegate"
              inputLabel={'Delegate'}
              placeholder={'0x... or .eth'}
              isAddress={true}
              errorMessage={
                formik.touched.escrowDelegate && formik.errors.escrowDelegate
                  ? formik.errors.escrowDelegate
                  : undefined
              }
              helperText={`This wallet will have delegated permissions to control escrows and token streams on behalf of the DAO.`}
            />
            <Button
              variant={'outline'}
              borderRadius={'curved'}
              w={'100%'}
              type="submit"
              disabled={!formik.isValid}
            >
              Add Transaction to Queue
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  )
}
