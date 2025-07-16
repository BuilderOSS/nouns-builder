import { Flex } from '@buildeross/zord'
import React from 'react'

import { useCustomTransactionStore } from 'src/modules/create-proposal'

import { CustomTransactionForm } from '../CustomTransactionForm'
import { transactionValueFields, validateTransactionValue } from './fields'

export const Value = () => {
  const { customTransaction, composeCustomTransaction } = useCustomTransactionStore()
  const initialValues = {
    transactionValue: customTransaction?.value || '',
  }

  const submitCallback = React.useCallback(
    (values: { transactionValue: string }) => {
      composeCustomTransaction({
        ...customTransaction,
        value: values.transactionValue,
      })
    },
    [customTransaction, composeCustomTransaction]
  )

  return (
    <Flex direction={'column'}>
      <CustomTransactionForm
        initialValues={initialValues}
        fields={transactionValueFields}
        validationSchema={validateTransactionValue}
        submitCallback={(values) => submitCallback(values)}
      />
    </Flex>
  )
}
