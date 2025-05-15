import { Box, Button, Flex } from '@zoralabs/zord'
import { Form, Formik } from 'formik'
import type { FormikHelpers } from 'formik'
import { getAddress } from 'viem'
import { useBalance } from 'wagmi'

import SmartInput from 'src/components/Fields/SmartInput'
import { NUMBER, TEXT } from 'src/components/Fields/types'
import { TransactionType, useProposalStore } from 'src/modules/create-proposal'
import { useDaoStore } from 'src/modules/dao'
import { useChainStore } from 'src/stores/useChainStore'
import { CHAIN_ID } from 'src/typings'
import { getEnsAddress } from 'src/utils/ens'
import { walletSnippet } from 'src/utils/helpers'
import { getProvider } from 'src/utils/provider'

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
    const value = values.amount.toString()

    addTransaction({
      type: TransactionType.SEND_ETH,
      summary: `Send ${value} ETH to ${walletSnippet(target)}`,
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
          validationSchema={sendEthSchema(parseFloat(treasuryBalance.formatted))}
          onSubmit={handleSubmit}
          validateOnBlur
          validateOnMount={false}
          validateOnChange={false}
        >
          {(formik) => (
            <Box
              data-testid="airdrop-form"
              as={'fieldset'}
              disabled={formik.isValidating}
              style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
            >
              <Flex as={Form} direction={'column'}>
                <SmartInput
                  type={TEXT}
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
                  helperText={`The wallet address that will receive funds when milestones are completed.`}
                />

                <Box mt={'x5'}>
                  <SmartInput
                    {...formik.getFieldProps(`amount`)}
                    inputLabel={
                      <Flex justify={'space-between'} width={'100%'}>
                        <Box fontWeight={'label'}>Amount</Box>
                        <Box color={'text3'} fontWeight="paragraph">
                          Treasury Balance: {`${treasuryBalance?.formatted} ETH`}
                        </Box>
                      </Flex>
                    }
                    id={`amount`}
                    type={NUMBER}
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
                  disabled={!formik.isValid}
                >
                  Add Transaction to Queue
                </Button>
              </Flex>
            </Box>
          )}
        </Formik>
      )}
    </Box>
  )
}
