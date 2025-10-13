import {
  L1_CROSS_DOMAIN_MESSENGER,
  L2_MIGRATION_DEPLOYER,
} from '@buildeross/constants/addresses'
import { l2DeployerAbi, messengerAbi } from '@buildeross/sdk/contract'
import { CHAIN_ID, TransactionType } from '@buildeross/types'
import { Input } from '@buildeross/ui/Input'
import { Box, Button, Flex } from '@buildeross/zord'
import type { FormikHelpers } from 'formik'
import { Form, Formik } from 'formik'
import { useChainStore, useDaoStore, useProposalStore } from 'src/stores'
import { encodeFunctionData, parseEther } from 'viem'
import { useBalance } from 'wagmi'

import bridgeTreasuryFormSchema, {
  BridgeTreasuryValues,
} from './BridgeTreasuryForm.schema'

export const BridgeTreasuryForm = ({
  migratedToChainId,
}: {
  migratedToChainId?: CHAIN_ID
}) => {
  const { treasury } = useDaoStore((state) => state.addresses)
  const chain = useChainStore((x) => x.chain)
  const { data: treasuryBalance } = useBalance({
    address: treasury,
    chainId: chain.id,
  })
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const initialValues: BridgeTreasuryValues = {
    amount: 0,
  }

  const handleSubmit = async (
    values: BridgeTreasuryValues,
    actions: FormikHelpers<BridgeTreasuryValues>
  ) => {
    if (!values.amount || !migratedToChainId) return

    const value = parseEther(values.amount.toString()).toString()

    const depositParams = encodeFunctionData({
      abi: l2DeployerAbi,
      functionName: 'depositToTreasury',
    })

    addTransaction({
      type: TransactionType.MIGRATION,
      summary: `Bridge ${values.amount.toString()} ETH to L2 DAO`,
      transactions: [
        {
          functionSignature: 'depositToTreasury()',
          target: L1_CROSS_DOMAIN_MESSENGER[migratedToChainId],
          value,
          calldata: encodeFunctionData({
            abi: messengerAbi,
            functionName: 'sendMessage',
            args: [L2_MIGRATION_DEPLOYER[migratedToChainId], depositParams, 0],
          }),
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
          validationSchema={bridgeTreasuryFormSchema(
            parseFloat(treasuryBalance.formatted)
          )}
          onSubmit={handleSubmit}
          validateOnBlur
          validateOnMount={false}
          validateOnChange={false}
        >
          {({ errors, touched, isValid, isValidating, setFieldValue }) => (
            <Box
              data-testid="airdrop-form"
              as={'fieldset'}
              disabled={isValidating}
              style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
            >
              <Flex as={Form} direction={'column'}>
                <Box mt={'x5'}>
                  <Input
                    name={'amount'}
                    label={
                      <Flex justify={'space-between'}>
                        <Box fontWeight={'label'}>Amount</Box>
                        <Box color={'text3'}>
                          Treasury Balance: {`${treasuryBalance?.formatted} ETH`}
                        </Box>
                      </Flex>
                    }
                    secondaryLabel={'ETH'}
                    autoComplete={'off'}
                    type={'number'}
                    placeholder={0}
                    min={0}
                    max={treasuryBalance?.formatted}
                    step={'any'}
                    error={touched.amount && errors.amount ? errors.amount : undefined}
                  />
                </Box>

                <Flex align="center" justify="flex-end" w="100%" pr="x2">
                  <Button
                    type="button"
                    onClick={() =>
                      setFieldValue('amount', treasuryBalance?.formatted, true)
                    }
                    variant="unset"
                    mt="x2"
                    w="x16"
                  >
                    Set max
                  </Button>
                </Flex>

                <Button
                  mt={'x9'}
                  variant={'outline'}
                  borderRadius={'curved'}
                  type="submit"
                  disabled={!isValid}
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
