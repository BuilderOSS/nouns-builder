import { AddressType } from '@buildeross/types'
import { Flex } from '@buildeross/zord'
import React from 'react'

import { useCustomTransactionStore } from 'src/modules/create-proposal'

import { CustomTransactionForm } from '../CustomTransactionForm'
import { fields, validateABI } from './fields'

export const ABI = () => {
  const { customTransaction, composeCustomTransaction } = useCustomTransactionStore()
  const initialValues = {
    transactionCustomABI: customTransaction?.customABI || '',
  }

  const submitCallback = React.useCallback(
    (values: { transactionCustomABI: string }) => {
      try {
        if (customTransaction.address && values.transactionCustomABI) {
          composeCustomTransaction({
            ...customTransaction,
            address: customTransaction.address,
            customABI: values?.transactionCustomABI,
            contract: {
              address: customTransaction.address as AddressType,
              abi: JSON.parse(values?.transactionCustomABI),
            },
          })
        } else {
          composeCustomTransaction({
            ...customTransaction,
            address: customTransaction.address,
            customABI: undefined,
            contract: undefined,
          })
        }
      } catch (err) {
        console.error('err', err)
      }
    },
    [customTransaction, composeCustomTransaction]
  )

  return (
    <Flex direction={'column'}>
      <CustomTransactionForm
        initialValues={initialValues}
        fields={fields}
        validationSchema={validateABI()}
        submitCallback={(values) => submitCallback(values)}
      />
    </Flex>
  )
}
