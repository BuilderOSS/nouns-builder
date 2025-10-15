import { Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { TransactionFormType } from '../TransactionForm'
import AdminNav from './AdminNav'
import TransactionTypeCard from './TransactionTypeCard'

interface SelectTransactionTypeProps {
  transactionTypes: TransactionFormType[]
  onSelect: (value: TransactionFormType) => void
  onOpenAdminSettings?: () => void
}

export const SelectTransactionType: React.FC<SelectTransactionTypeProps> = ({
  transactionTypes,
  onSelect,
  onOpenAdminSettings,
}) => {
  return (
    <Stack style={{ maxWidth: 680, minHeight: '80vh' }} mx={'auto'}>
      <Text variant={'heading-xs'} mb={'x5'}>
        Select Transaction Type
      </Text>

      {transactionTypes.map((transactionType) => (
        <TransactionTypeCard
          key={transactionType}
          transactionType={transactionType}
          onClick={() => onSelect(transactionType)}
        />
      ))}
      <Flex
        borderWidth={'thin'}
        borderStyle={'solid'}
        borderColor={'ghostHover'}
        mt={'x4'}
        mb={'x4'}
      />
      {onOpenAdminSettings && <AdminNav onClick={onOpenAdminSettings} />}
    </Stack>
  )
}
