import { erc20Abi } from '@buildeross/sdk/contract'
import { CHAIN_ID } from '@buildeross/types'
import { getEnsAddress } from '@buildeross/utils/ens'
import { walletSnippet } from '@buildeross/utils/helpers'
import { getProvider } from '@buildeross/utils/provider'
import { Box } from '@buildeross/zord'
import type { FormikHelpers } from 'formik'
import { Formik } from 'formik'
import { useCallback } from 'react'
import { TransactionType, useProposalStore } from 'src/modules/create-proposal'
import { useChainStore } from 'src/stores/useChainStore'
import { encodeFunctionData, getAddress, parseUnits } from 'viem'

import { sendErc20Schema, SendErc20Values } from './SendErc20.schema'
import { SendErc20Form } from './SendErc20Form'

export const SendErc20 = () => {
  const chain = useChainStore((x) => x.chain)
  const addTransaction = useProposalStore((state) => state.addTransaction)

  const initialValues: SendErc20Values = {
    tokenMetadata: undefined,
    tokenAddress: '',
    recipientAddress: '',
    amount: 0,
  }

  const handleSubmit = useCallback(
    async (values: SendErc20Values, actions: FormikHelpers<SendErc20Values>) => {
      if (
        !values.amount ||
        !values.recipientAddress ||
        !values.tokenAddress ||
        !values.tokenMetadata?.isValid
      )
        return

      const chainToQuery =
        chain.id === CHAIN_ID.FOUNDRY ? CHAIN_ID.FOUNDRY : CHAIN_ID.ETHEREUM

      const recipient = await getEnsAddress(
        values.recipientAddress,
        getProvider(chainToQuery)
      )
      const tokenAddress = getAddress(values.tokenAddress)
      const amount = parseUnits(values.amount.toString(), values.tokenMetadata.decimals)

      // Encode ERC20 transfer function call
      const calldata = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [getAddress(recipient), amount],
      })

      addTransaction({
        type: TransactionType.SEND_ERC20,
        summary: `Send ${values.amount} ${values.tokenMetadata.symbol} to ${walletSnippet(recipient)}`,
        transactions: [
          {
            functionSignature: 'transfer(address,uint256)',
            target: tokenAddress,
            value: '0',
            calldata,
          },
        ],
      })

      actions.resetForm()
    },
    [chain.id, addTransaction]
  )

  return (
    <Box w={'100%'}>
      <Formik
        initialValues={initialValues}
        validationSchema={sendErc20Schema()}
        onSubmit={handleSubmit}
        validateOnBlur
        validateOnMount={false}
        validateOnChange={false}
      >
        {(formik) => <SendErc20Form formik={formik} />}
      </Formik>
    </Box>
  )
}
