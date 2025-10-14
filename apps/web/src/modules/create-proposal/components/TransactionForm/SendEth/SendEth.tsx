import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { CHAIN_ID, TransactionType } from '@buildeross/types'
import { FIELD_TYPES, SmartInput } from '@buildeross/ui/Fields'
import { getEnsAddress } from '@buildeross/utils/ens'
import { walletSnippet } from '@buildeross/utils/helpers'
import { getProvider } from '@buildeross/utils/provider'
import { Box, Button, Flex } from '@buildeross/zord'
import type { FormikHelpers } from 'formik'
import { Form, Formik } from 'formik'
import { formatEther, getAddress, parseEther } from 'viem'
import { useBalance } from 'wagmi'

import sendEthSchema, { SendEthValues } from './SendEth.schema'

export const SendEth = () => {
  const { treasury } = useDaoStore((state) => state.addresses)
  const chain = useChainStore((x) => x.chain)
  const { data: treasuryBalance } = useBalance({
    address: treasury,
    chainId: chain.id,
  })
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const initialValues: SendEthValues = {
    recipientAddress: '',
    amount: 0,
  }

  const handleSubmit = async (
    values: SendEthValues,
    actions: FormikHelpers<SendEthValues>
  ) => {
    if (!values.amount || !values.recipientAddress) return

    const chainToQuery =
      chain.id === CHAIN_ID.FOUNDRY ? CHAIN_ID.FOUNDRY : CHAIN_ID.ETHEREUM

    const target = await getEnsAddress(values.recipientAddress, getProvider(chainToQuery))
    const value = parseEther(values.amount.toString()).toString()

    addTransaction({
      type: TransactionType.SEND_ETH,
      summary: `Send ${values.amount.toString()} ETH to ${walletSnippet(target)}`,
      transactions: [
        {
          functionSignature: 'sendEth(address)',
          target: getAddress(target),
          value,
          calldata: '0x',
        },
      ],
    })

    actions.resetForm()
  }

  return (
    <Box w={'100%'}>
      {treasuryBalance && (
        <Formik
          initialValues={initialValues}
          validationSchema={sendEthSchema(
            parseFloat(formatEther(treasuryBalance?.value))
          )}
          onSubmit={handleSubmit}
          validateOnBlur
          validateOnMount={false}
          validateOnChange={false}
        >
          {(formik) => (
            <Box
              data-testid="send-eth-form"
              as={'fieldset'}
              disabled={formik.isValidating || formik.isSubmitting}
              style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
            >
              <Flex as={Form} direction={'column'}>
                <SmartInput
                  type={FIELD_TYPES.TEXT}
                  formik={formik}
                  {...formik.getFieldProps('recipientAddress')}
                  id="recipientAddress"
                  inputLabel={'Recipient Wallet Address/ENS'}
                  placeholder={'0x...'}
                  isAddress={true}
                  errorMessage={
                    formik.touched.recipientAddress && formik.errors.recipientAddress
                      ? formik.errors.recipientAddress
                      : undefined
                  }
                />

                <Box mt={'x5'}>
                  <SmartInput
                    {...formik.getFieldProps(`amount`)}
                    inputLabel="Amount"
                    secondaryLabel={`Treasury Balance: ${treasuryBalance?.formatted} ETH`}
                    id={`amount`}
                    type={FIELD_TYPES.NUMBER}
                    placeholder={'1.0 ETH'}
                    min={0}
                    max={parseFloat(treasuryBalance?.formatted)}
                    errorMessage={
                      formik.touched.amount && formik.errors.amount
                        ? formik.errors.amount
                        : undefined
                    }
                  />
                </Box>

                <Button
                  mt={'x9'}
                  variant={'outline'}
                  borderRadius={'curved'}
                  type="submit"
                  disabled={!formik.isValid || formik.isSubmitting}
                >
                  {formik.isSubmitting
                    ? 'Adding Transaction to Queue...'
                    : 'Add Transaction to Queue'}
                </Button>
              </Flex>
            </Box>
          )}
        </Formik>
      )}
    </Box>
  )
}
