import { BASE_URL } from '@buildeross/constants/baseUrl'
import { useChainStore } from '@buildeross/stores'
import { Flex } from '@buildeross/zord'
import axios from 'axios'
import React from 'react'

import {
  initCustomTransaction,
  useCustomTransactionStore,
} from '../../../../../stores/useCustomTransactionStore'
import { CustomTransactionForm } from '../CustomTransactionForm'
import { contractAddressFields, validateContractAddress } from './fields'

export const Address = () => {
  const { customTransaction, composeCustomTransaction } = useCustomTransactionStore()
  const chain = useChainStore((x) => x.chain)
  const initialValues = {
    transactionContractAddress: customTransaction?.address || '',
    transactionCustomABI: customTransaction?.customABI || '',
  }

  const submitCallback = React.useCallback(
    async ({ transactionContractAddress }: { transactionContractAddress: string }) => {
      let customABI
      try {
        const response = await axios(
          `${BASE_URL}/api/abi?chainid=${chain.id}&address=${transactionContractAddress}`
        )
        customABI = response.data?.abi
      } catch (e) {
        console.error(e)
      }

      const isSame =
        transactionContractAddress.toLowerCase() ===
        customTransaction.address.toLowerCase()

      composeCustomTransaction({
        ...(isSame ? customTransaction : initCustomTransaction),
        address: transactionContractAddress,
        customABI,
      })
    },
    [customTransaction, composeCustomTransaction, chain.id]
  )

  return (
    <Flex direction={'column'}>
      <CustomTransactionForm
        initialValues={initialValues}
        fields={contractAddressFields}
        validationSchema={validateContractAddress}
        submitCallback={(values) => submitCallback(values)}
      />
    </Flex>
  )
}
