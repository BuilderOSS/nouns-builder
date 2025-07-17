import {
  L1_CROSS_DOMAIN_MESSENGER,
  L2_MIGRATION_DEPLOYER,
} from '@buildeross/constants/addresses'
import { CHAIN_ID } from '@buildeross/types'
import { Box, Button, Flex } from '@buildeross/zord'
import { Form, Formik } from 'formik'
import type { FormikHelpers } from 'formik'
import { encodeFunctionData } from 'viem'
import { useBalance } from 'wagmi'

import Input from 'src/components/Input/Input'
import { messengerABI } from 'src/data/contract/abis/L1CrossDomainMessenger'
import { L2DeployerABI } from 'src/data/contract/abis/L2MigrationDeployer'
import { TransactionType, useProposalStore } from 'src/modules/create-proposal'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'

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

    const value = values.amount.toString()

    const depositParams = encodeFunctionData({
      abi: L2DeployerABI,
      functionName: 'depositToTreasury',
    })

    addTransaction({
      type: TransactionType.MIGRATION,
      summary: `Bridge ${value} ETH to L2 DAO`,
      transactions: [
        {
          functionSignature: 'depositToTreasury()',
          target: L1_CROSS_DOMAIN_MESSENGER[migratedToChainId],
          value,
          calldata: encodeFunctionData({
            abi: messengerABI,
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
