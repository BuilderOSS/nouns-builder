import { TRANSACTION_TYPES } from '@buildeross/proposal-ui'
import { TransactionType } from '@buildeross/types'
import { DropdownSelect } from '@buildeross/ui/DropdownSelect'
import { Box, Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import React from 'react'

type TransactionOption = {
  value: TransactionType
  label: string
  description?: string
  icon?: React.ReactNode
}

type TransactionStageColumnProps = {
  transactionType: TransactionType | null
  options: TransactionOption[]
  onSelectTransactionType: (value: TransactionType) => void
  onResetTransactionType: () => void
  form: React.ReactNode
  emptyState?: React.ReactNode
}

export const TransactionStageColumn: React.FC<TransactionStageColumnProps> = ({
  transactionType,
  options,
  onSelectTransactionType,
  onResetTransactionType,
  form,
  emptyState,
}) => {
  return (
    <Stack gap={'x0'}>
      <Stack>
        <Text variant={'heading-xs'} mb={'x5'}>
          Select Transaction Type
        </Text>
        {transactionType ? (
          <Flex gap={'x2'} align={'flex-start'}>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <DropdownSelect
                value={transactionType}
                options={options}
                customLabel={TRANSACTION_TYPES[transactionType].title}
                onChange={onSelectTransactionType}
                positioning="absolute"
              />
            </Box>
            <Button
              variant="secondary"
              h={'x19'}
              minH={'x19'}
              px={'x4'}
              aria-label={'Cancel editing transaction'}
              onClick={onResetTransactionType}
            >
              <Icon id={'cross'} />
            </Button>
          </Flex>
        ) : (
          <DropdownSelect
            value={undefined}
            options={options}
            customLabel={'Select transaction type'}
            onChange={onSelectTransactionType}
          />
        )}
      </Stack>

      <Flex
        borderWidth={'thin'}
        borderStyle={'solid'}
        borderColor={'ghostHover'}
        mt={'x2'}
        mb={'x8'}
      />

      {!transactionType && emptyState}

      {transactionType ? form : null}
    </Stack>
  )
}
