import {
  AttestationParams,
  EAS_CONTRACT_ADDRESS,
  ESCROW_DELEGATE_SCHEMA,
  ESCROW_DELEGATE_SCHEMA_UID,
  easAbi,
} from '@buildeross/constants/eas'
import { getEnsAddress } from '@buildeross/utils/ens'
import { addressValidationSchemaWithError } from '@buildeross/utils/yup'
import { Box, Button } from '@buildeross/zord'
import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk'
import { Form, Formik } from 'formik'
import { useCallback } from 'react'
import { Hex, encodeFunctionData, getAddress, zeroHash } from 'viem'
import * as yup from 'yup'

import SmartInput from 'src/components/Fields/SmartInput'
import { TransactionType } from 'src/modules/create-proposal/constants'
import { Transaction, useProposalStore } from 'src/modules/create-proposal/stores'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'

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
        return valueAsAddress?.toLowerCase() !== _escrowDelegate?.toLowerCase()
      }
    ),
  })

const schemaEncoder = new SchemaEncoder(ESCROW_DELEGATE_SCHEMA)

export const NominateEscrowDelegate = () => {
  const { token, escrowDelegate, treasury } = useDaoStore((state) => state.addresses)
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const chain = useChainStore((x) => x.chain)

  const handleNominateEscrowDelegateTransaction = useCallback(
    async (values: EscrowDelegateFormValues) => {
      const easContractAddress = EAS_CONTRACT_ADDRESS[chain.id]
      if (!token || !values.escrowDelegate || !easContractAddress) {
        return
      }
      const newEscrowDelegate = await getEnsAddress(values.escrowDelegate)
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

      addTransaction({
        type: TransactionType.ESCROW_DELEGATE,
        summary: 'Nominate Escrow Delegate',
        transactions: [attest],
      })
    },
    [addTransaction, chain.id, token]
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
              inputLabel={'Escrow Delegate'}
              placeholder={'0x... or .eth'}
              isAddress={true}
              errorMessage={
                formik.touched.escrowDelegate && formik.errors.escrowDelegate
                  ? formik.errors.escrowDelegate
                  : undefined
              }
              helperText={`This wallet will control the escrow and release funds.`}
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
